import { ICompanyRepository } from '../ports/ICompanyRepository';
import { CompanyBilling } from '../../domain/entities/CompanyBilling.entity';

export class GetBillingUseCase {
  constructor(private companyRepo: ICompanyRepository) {}

  async execute(companyId: string): Promise<CompanyBilling | null> {
    return this.companyRepo.getBilling(companyId);
  }
}
