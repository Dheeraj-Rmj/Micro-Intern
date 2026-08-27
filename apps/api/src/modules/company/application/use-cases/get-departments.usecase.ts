import { ICompanyRepository } from "../ports/ICompanyRepository.js";
import { CompanyDepartment } from "../../domain/entities/CompanyDepartment.entity.js";

export class GetDepartmentsUseCase {
  constructor(private companyRepo: ICompanyRepository) {}

  async execute(companyId: string): Promise<CompanyDepartment[]> {
    return this.companyRepo.getDepartments(companyId);
  }
}
