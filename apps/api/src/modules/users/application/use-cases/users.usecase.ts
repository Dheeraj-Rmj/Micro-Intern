import { PrismaClient } from '@microintern/database';
import { v7 as uuidv7 } from 'uuid';
import { InternalServerError } from '@/shared/errors/index.js';

export class UsersUseCase {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generates a secure, one-time eKYC onboarding link for a new company admin.
   * Super Admins use this to invite new enterprises to the platform.
   */
  async generateOnboardingUrl(superAdminId: string): Promise<{ token: string; url: string }> {
    try {
      const token = uuidv7(); // Cryptographically secure v7 UUID token

      // Create a pending onboarding record
      await this.prisma.companyOnboarding.create({
        data: {
          token,
          superAdminId,
          status: 'PENDING',
        }
      });

      return {
        token,
        url: `http://localhost:3000/onboarding/${token}`
      };
    } catch (error: any) {
      throw new InternalServerError('Failed to generate secure onboarding token', error);
    }
  }
}
