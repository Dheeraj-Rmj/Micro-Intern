import { SubmissionStatus } from '@microintern/database';

export class TrialInvitation {
  constructor(
    public readonly id: string,
    public readonly trialId: string,
    public readonly candidateId: string,
    public readonly status: SubmissionStatus,
    public readonly invitedAt: Date,
    public readonly expiresAt: Date | null,
    public readonly trialTitle?: string,
    public readonly companyName?: string
  ) {}

  isPending(): boolean {
    return this.status === SubmissionStatus.INVITED;
  }

  isExpired(): boolean {
    if (this.status === SubmissionStatus.EXPIRED) return true;
    if (this.expiresAt && new Date() > this.expiresAt) return true;
    return false;
  }

  static fromPrisma(record: any): TrialInvitation {
    return new TrialInvitation(
      record.id,
      record.trialId,
      record.candidateId,
      record.status,
      record.invitedAt,
      record.expiresAt ?? null,
      record.trial?.title,
      record.trial?.company?.name
    );
  }
}
