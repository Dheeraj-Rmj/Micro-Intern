import { CompanyDepartment } from "../../domain/entities/CompanyDepartment.entity.js";
import { CompanyAnalyticsSnapshot } from "../../domain/entities/CompanyAnalyticsSnapshot.entity.js";
import { CompanyBilling } from "../../domain/entities/CompanyBilling.entity.js";
import { AIInsightRecommendation } from "../../domain/entities/AIInsightRecommendation.entity.js";

export interface ICompanyRepository {
  getDepartments(companyId: string): Promise<CompanyDepartment[]>;
  getAnalytics(companyId: string): Promise<CompanyAnalyticsSnapshot | null>;
  getBilling(companyId: string): Promise<CompanyBilling | null>;
  getAIInsights(companyId: string): Promise<AIInsightRecommendation[]>;
}
