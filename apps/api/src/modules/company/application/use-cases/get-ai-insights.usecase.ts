import { ICompanyRepository } from "../ports/ICompanyRepository";
import { AIInsightRecommendation } from "../../domain/entities/AIInsightRecommendation.entity";

export class GetAIInsightsUseCase {
  constructor(private companyRepo: ICompanyRepository) {}

  async execute(companyId: string): Promise<AIInsightRecommendation[]> {
    return this.companyRepo.getAIInsights(companyId);
  }
}
