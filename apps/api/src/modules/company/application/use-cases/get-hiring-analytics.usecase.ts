import { ICompanyRepository } from '../ports/ICompanyRepository';
import { CompanyAnalyticsSnapshot } from '../../domain/entities/CompanyAnalyticsSnapshot.entity';

export class GetHiringAnalyticsUseCase {
  constructor(private companyRepo: ICompanyRepository) {}

  async execute(companyId: string): Promise<CompanyAnalyticsSnapshot | null> {
    return this.companyRepo.getAnalytics(companyId);
  }
}
