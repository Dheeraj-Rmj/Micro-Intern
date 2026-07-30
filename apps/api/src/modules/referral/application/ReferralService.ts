import { createModuleLogger } from "@/core/logger.js";
import { randomBytes } from "node:crypto";
import type { PrismaClient } from "@microintern/database";

const log = createModuleLogger("ReferralService");

export class ReferralService {
  constructor(private readonly db: PrismaClient) {}

  async generateReferralCode(
    userId: string,
  ): Promise<{ referralCode: string; referralUrl: string }> {
    // Check if user already has a code
    const existing = await this.db.referral.findFirst({
      where: { referrerId: userId, status: "PENDING" },
    });

    if (existing) {
      return {
        referralCode: existing.referralCode,
        referralUrl: `https://microintern.com/join?ref=${existing.referralCode}`,
      };
    }

    const referralCode = randomBytes(6).toString("hex").toUpperCase();
    await this.db.referral.create({
      data: { referrerId: userId, referralCode, status: "PENDING" },
    });

    log.info({ userId, referralCode }, "Referral code generated");
    return {
      referralCode,
      referralUrl: `https://microintern.com/join?ref=${referralCode}`,
    };
  }

  async trackConversion(referralCode: string, refereeId: string): Promise<boolean> {
    const referral = await this.db.referral.findUnique({
      where: { referralCode },
    });

    if (!referral || referral.status !== "PENDING") {
      return false;
    }

    await this.db.referral.update({
      where: { referralCode },
      data: {
        refereeId,
        status: "CONVERTED",
        convertedAt: new Date(),
      },
    });

    log.info({ referralCode, refereeId }, "Referral converted");
    return true;
  }

  async getUserReferrals(userId: string) {
    return this.db.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getReferralStats(userId: string) {
    const referrals = await this.db.referral.findMany({
      where: { referrerId: userId },
    });

    return {
      total: referrals.length,
      pending: referrals.filter((r) => r.status === "PENDING").length,
      converted: referrals.filter((r) => r.status === "CONVERTED").length,
      rewarded: referrals.filter((r) => r.status === "REWARDED").length,
    };
  }
}
