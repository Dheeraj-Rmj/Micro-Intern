import { PrismaClient } from "@microintern/database";
import { v7 as uuidv7 } from "uuid";
import { InternalServerError } from "@/shared/errors/index.js";

export class UsersUseCase {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generates a secure, one-time eKYC onboarding link for a new company admin.
   * Super Admins use this to invite new enterprises to the platform.
   */
  async generateOnboardingUrl(
    superAdminId: string,
    companyName: string
  ): Promise<{ token: string; url: string }> {
    try {
      const token = uuidv7(); // Cryptographically secure v7 UUID token

      // Create a pending onboarding record
      await this.prisma.companyOnboarding.create({
        data: {
          token,
          superAdminId,
          companyName,
          status: "PENDING",
        },
      });

      let baseUrl = process.env["FRONTEND_URL"] || "https://micro-intern-web.vercel.app";
      if (baseUrl.includes("localhost") || baseUrl.includes("[YOUR-VERCEL-APP-URL]")) {
        baseUrl = "https://micro-intern-web.vercel.app";
      }
      
      // ensure we don't have double slash if baseUrl has trailing slash
      const formattedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

      return {
        token,
        url: `${formattedBaseUrl}/users/ekyc/${token}`,
      };
    } catch (error: any) {
      throw new InternalServerError("Failed to generate secure onboarding token", error);
    }
  }
}
