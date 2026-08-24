import { createModuleLogger } from "@/core/logger.js";
import { compilePrompt, PROMPTS } from "@/infrastructure/ai/PromptManager.js";
import type { PrismaClient } from "@microintern/database";
import type { AIFallbackEngine } from "@/infrastructure/ai/AIFallbackEngine.js";

const log = createModuleLogger("OfferLetterUseCase");

export type GenerateOfferLetterDTO = {
  journeyId: string;
  companyName: string;
  candidateName: string;
  roleName: string;
  startDate: string;
  salary: string;
  additionalTerms?: string;
};

export class GenerateOfferLetterUseCase {
  constructor(private readonly aiEngine: AIFallbackEngine) {}

  async execute(dto: GenerateOfferLetterDTO): Promise<{ offerLetter: string }> {
    log.info({ journeyId: dto.journeyId }, "Generating offer letter");

    const { systemMessage, userMessage } = compilePrompt(PROMPTS.OFFER_LETTER_GENERATOR, {
      companyName: dto.companyName,
      candidateName: dto.candidateName,
      roleName: dto.roleName,
      startDate: dto.startDate,
      salary: dto.salary,
      additionalTerms: dto.additionalTerms ?? "Standard employment terms apply.",
    });

    const aiResponse = await this.aiEngine.complete({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      responseFormat: { type: "json_object" } as const,
      temperature: 0.3,
    });

    let result: { offerLetter: string } = { offerLetter: "" };
    try {
      result = JSON.parse(aiResponse.content);
    } catch {
      log.warn("Failed to parse AI offer letter response");
      result = { offerLetter: aiResponse.content };
    }

    log.info({ journeyId: dto.journeyId }, "Offer letter generated");
    return result;
  }
}
