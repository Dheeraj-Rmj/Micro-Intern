import { ICompanyRepository } from "../ports/ICompanyRepository.js";
import { CompanyAnalyticsSnapshot } from "../../domain/entities/CompanyAnalyticsSnapshot.entity.js";

export class GetHiringAnalyticsUseCase {
  constructor(private companyRepo: ICompanyRepository) {}

  async execute(companyId: string): Promise<CompanyAnalyticsSnapshot | null> {
    return this.companyRepo.getAnalytics(companyId);
  }
}
