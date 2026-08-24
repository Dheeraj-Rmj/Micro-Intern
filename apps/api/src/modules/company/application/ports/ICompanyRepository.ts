import { CompanyDepartment } from "../../domain/entities/CompanyDepartment.entity";
import { CompanyAnalyticsSnapshot } from "../../domain/entities/CompanyAnalyticsSnapshot.entity";
import { CompanyBilling } from "../../domain/entities/CompanyBilling.entity";
import { AIInsightRecommendation } from "../../domain/entities/AIInsightRecommendation.entity";

export interface ICompanyRepository {
  getDepartments(companyId: string): Promise<CompanyDepartment[]>;
  getAnalytics(companyId: string): Promise<CompanyAnalyticsSnapshot | null>;
  getBilling(companyId: string): Promise<CompanyBilling | null>;
  getAIInsights(companyId: string): Promise<AIInsightRecommendation[]>;
}
