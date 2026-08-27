import { ICompanyRepository } from "../ports/ICompanyRepository.js";
import { AIInsightRecommendation } from "../../domain/entities/AIInsightRecommendation.entity.js";

export class GetAIInsightsUseCase {
  constructor(private companyRepo: ICompanyRepository) {}

  async execute(companyId: string): Promise<AIInsightRecommendation[]> {
    return this.companyRepo.getAIInsights(companyId);
  }
}
