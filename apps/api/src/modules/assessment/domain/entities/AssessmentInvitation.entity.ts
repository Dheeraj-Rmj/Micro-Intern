import { SubmissionStatus } from "@microintern/database";

export class AssessmentInvitation {
  constructor(
    public readonly id: string,
    public readonly assessmentId: string,
    public readonly candidateId: string,
    public readonly status: SubmissionStatus,
    public readonly invitedAt: Date,
    public readonly expiresAt: Date | null,
    public readonly assessmentTitle?: string,
    public readonly companyName?: string,
  ) {}

  isPending(): boolean {
    return this.status === SubmissionStatus.INVITED;
  }

  isExpired(): boolean {
    if (this.status === SubmissionStatus.EXPIRED) return true;
    if (this.expiresAt && new Date() > this.expiresAt) return true;
    return false;
  }

  static fromPrisma(record: any): AssessmentInvitation {
    return new AssessmentInvitation(
      record.id,
      record.assessmentId,
      record.candidateId,
      record.status,
      record.invitedAt,
      record.expiresAt ?? null,
      record.assessment?.title,
      record.assessment?.company?.name,
    );
  }
}
