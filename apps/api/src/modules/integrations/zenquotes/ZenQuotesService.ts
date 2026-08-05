import { getRedisClient } from '@/core/redis.js';
import { createModuleLogger } from '@/core/logger.js';
import { getAIGateway } from '@/infrastructure/ai/index.js';

const log = createModuleLogger('ZenQuotesService');

export interface ZenQuote {
  quote: string;
  author: string;
  html: string;
}

export class ZenQuotesService {
  private static CACHE_KEY = 'zenquotes:list';
  private static CACHE_TTL = 43200; // 12 hours in seconds

  static async getRandomQuote(role: string = 'developer'): Promise<ZenQuote | null> {
    const redis = getRedisClient();
    const roleCacheKey = `${this.CACHE_KEY}:${role.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    try {
      // 1. Check Cache for personalized quotes list for this role
      const cachedRoleQuotes = await redis.get(roleCacheKey);
      let quotesArray: ZenQuote[] = [];

      if (cachedRoleQuotes) {
        log.debug({ role }, 'Returning ZenQuote from personalized Redis cache list');
        quotesArray = JSON.parse(cachedRoleQuotes) as ZenQuote[];
      } else {
        // 2. We don't have a personalized list. Let's get the master list (cached or fetch from API)
        let masterList: ZenQuote[] = [];
        const cachedMaster = await redis.get(this.CACHE_KEY);
        
        if (cachedMaster) {
          masterList = JSON.parse(cachedMaster) as ZenQuote[];
        } else {
          log.info('Fetching new master ZenQuotes list from API');
          const response = await fetch('https://zenquotes.io/api/quotes');
          
          if (!response.ok) {
            throw new Error(`ZenQuotes API responded with status: ${response.status}`);
          }

          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            masterList = data.map((quoteData: any) => ({
              quote: quoteData.q,
              author: quoteData.a,
              html: quoteData.h,
            }));
            await redis.setex(this.CACHE_KEY, this.CACHE_TTL, JSON.stringify(masterList));
          }
        }

        if (masterList.length === 0) return null;

        // 3. Use AI Gateway to filter the master list for this specific role
        log.info({ role }, 'Using AI Gateway to personalize quote list for role');
        const ai = getAIGateway();
        const prompt = `You are an AI that filters motivational quotes.
Given a list of quotes, return a JSON array containing ONLY the top 5 to 10 most relevant quotes for a person whose role is: "${role}".
If none are directly related, pick the best general motivational quotes for career/ambition.
Do not change the text of the quotes. Ensure the output is a valid JSON array of objects with "quote", "author", and "html" fields exactly matching the input format.

Input Quotes:
${JSON.stringify(masterList, null, 2)}
`;
        try {
          const aiResponse = await ai.complete({
            messages: [{ role: 'user', content: prompt }],
            responseFormat: { type: 'json_object' },
            temperature: 0.1,
          });

          // The AI might return { quotes: [...] } or just [...]
          const parsed = JSON.parse(aiResponse.content);
          const personalizedQuotes = Array.isArray(parsed) ? parsed : (parsed.quotes || parsed.data || masterList.slice(0, 5));
          
          if (Array.isArray(personalizedQuotes) && personalizedQuotes.length > 0 && personalizedQuotes[0].quote) {
            quotesArray = personalizedQuotes;
          } else {
            quotesArray = masterList; // fallback
          }
        } catch (aiErr) {
          log.warn({ err: aiErr }, 'AI filtering failed, falling back to master list');
          quotesArray = masterList; // Fallback to master list if AI fails
        }

        // 4. Save the personalized array to Cache for this role
        await redis.setex(roleCacheKey, this.CACHE_TTL, JSON.stringify(quotesArray));
      }

      if (quotesArray.length === 0) return null;

      // 5. Return a random quote from the personalized array
      const randomIndex = Math.floor(Math.random() * quotesArray.length);
      return quotesArray[randomIndex] ?? null;
    } catch (error) {
      log.error({ err: error }, 'Failed to fetch ZenQuote');
      return null;
    }
  }
}
