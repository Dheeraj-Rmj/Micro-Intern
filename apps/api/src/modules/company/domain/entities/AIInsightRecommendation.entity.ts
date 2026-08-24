export class AIInsightRecommendation {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly type: string,
    public readonly title: string,
    public readonly description: string,
    public readonly severity: string | null,
    public readonly metadata: any | null,
    public readonly createdAt: Date,
    public readonly isDismissed: boolean,
  ) {}
}
