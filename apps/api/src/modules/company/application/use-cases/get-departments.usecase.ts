import { ICompanyRepository } from "../ports/ICompanyRepository";
import { CompanyDepartment } from "../../domain/entities/CompanyDepartment.entity";

export class GetDepartmentsUseCase {
  constructor(private companyRepo: ICompanyRepository) {}

  async execute(companyId: string): Promise<CompanyDepartment[]> {
    return this.companyRepo.getDepartments(companyId);
  }
}
