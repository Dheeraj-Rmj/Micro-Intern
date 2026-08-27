import "dotenv/config";
import { ZenQuotesService } from "../src/modules/integrations/zenquotes/ZenQuotesService.js";
import { connectRedis, disconnectRedis } from "../src/core/redis.js";

async function test() {
  console.log("--- Testing ZenQuotes Integration ---");

  try {
    // 1. Connect to Redis explicitly for the script
    await connectRedis();
    console.log("✅ Connected to local Redis");

    // 2. Fetch the quote (this will hit the API first time)
    console.log("\nFetching quote (Attempt 1)...");
    const start1 = Date.now();
    const quote1 = await ZenQuotesService.getRandomQuote();
    console.log(`⏱️ Took ${Date.now() - start1}ms`);
    console.log("Quote:", quote1);

    // 3. Fetch again (this should hit the cache)
    console.log("\nFetching quote (Attempt 2 - Should be cached)...");
    const start2 = Date.now();
    const quote2 = await ZenQuotesService.getRandomQuote();
    console.log(`⏱️ Took ${Date.now() - start2}ms`);
    console.log("Quote:", quote2);
  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    await disconnectRedis();
    console.log("\n✅ Disconnected from Redis");
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0);
  }
}

test();
