export interface PlatformStatsProps {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalCompanies: number;
  activeCompanies: number;
  pendingCompanies: number;
  totalTrials: number;
  activeTrials: number;
  aiMetrics: {
    totalEvaluations: number;
    passedEvaluations: number;
    averagePercentageScore: number;
  };
  timestamp?: Date;
}

export class PlatformStats {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly suspendedUsers: number;
  readonly totalCompanies: number;
  readonly activeCompanies: number;
  readonly pendingCompanies: number;
  readonly totalTrials: number;
  readonly activeTrials: number;
  readonly aiMetrics: {
    readonly totalEvaluations: number;
    readonly passedEvaluations: number;
    readonly averagePercentageScore: number;
  };
  readonly timestamp: Date;

  constructor(props: PlatformStatsProps) {
    this.totalUsers = props.totalUsers;
    this.activeUsers = props.activeUsers;
    this.suspendedUsers = props.suspendedUsers;
    this.totalCompanies = props.totalCompanies;
    this.activeCompanies = props.activeCompanies;
    this.pendingCompanies = props.pendingCompanies;
    this.totalTrials = props.totalTrials;
    this.activeTrials = props.activeTrials;
    this.aiMetrics = {
      totalEvaluations: props.aiMetrics.totalEvaluations,
      passedEvaluations: props.aiMetrics.passedEvaluations,
      averagePercentageScore: Math.round((props.aiMetrics.averagePercentageScore + Number.EPSILON) * 100) / 100,
    };
    this.timestamp = props.timestamp ?? new Date();
  }

  get passRate(): number {
    if (this.aiMetrics.totalEvaluations === 0) {
      return 0;
    }
    const rate = (this.aiMetrics.passedEvaluations / this.aiMetrics.totalEvaluations) * 100;
    return Math.round((rate + Number.EPSILON) * 100) / 100;
  }

  toJSON(): Record<string, unknown> {
    return {
      users: {
        total: this.totalUsers,
        active: this.activeUsers,
        suspended: this.suspendedUsers,
      },
      companies: {
        total: this.totalCompanies,
        active: this.activeCompanies,
        pendingVerification: this.pendingCompanies,
      },
      trials: {
        total: this.totalTrials,
        active: this.activeTrials,
      },
      aiUsage: {
        totalEvaluations: this.aiMetrics.totalEvaluations,
        passedEvaluations: this.aiMetrics.passedEvaluations,
        passRate: this.passRate,
        averagePercentageScore: this.aiMetrics.averagePercentageScore,
      },
      generatedAt: this.timestamp.toISOString(),
    };
  }
}
