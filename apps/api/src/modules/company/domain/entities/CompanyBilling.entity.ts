export class CompanyBilling {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly stripeCustomerId: string | null,
    public readonly planName: string,
    public readonly renewalDate: Date | null,
    public readonly recruiterSeatsUsed: number,
    public readonly recruiterSeatsMax: number,
    public readonly aiCreditsUsed: number,
    public readonly aiCreditsMax: number,
    public readonly storageUsedBytes: bigint,
    public readonly storageMaxBytes: bigint,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
