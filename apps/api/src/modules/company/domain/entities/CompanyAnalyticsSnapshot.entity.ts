export class CompanyAnalyticsSnapshot {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly snapshotDate: Date,
    public readonly timeToHireDays: number,
    public readonly offerAcceptanceRate: number,
    public readonly candidateDropRate: number,
    public readonly totalPlacements: number,
    public readonly funnelData: any | null,
    public readonly sourceData: any | null,
    public readonly createdAt: Date,
  ) {}
}
