import "dotenv/config";
import { getContainer } from "../../src/core/container.js";
import { InviteTeamMemberUseCase } from "../../src/modules/company/application/use-cases/invite-team-member.usecase.js";
import { PrismaCompanyRepository } from "../../src/modules/company/infrastructure/repositories/PrismaCompanyRepository.js";
import { PrismaUserRepository } from "../../src/modules/auth/infrastructure/repositories/PrismaUserRepository.js";
import { BcryptPasswordService } from "../../src/modules/auth/infrastructure/services/AuthServices.js";
import { prisma } from "@microintern/database";

async function main() {
  
  // Find a company owner
  const owner = await prisma.user.findFirst({
    where: { role: "COMPANY_OWNER" },
    include: { companyMembership: true }
  });

  if (!owner) {
    console.log("No company owner found to test with.");
    await prisma.$disconnect();
    return;
  }
  console.log("Found owner:", owner.email);

  const companyRepo = new PrismaCompanyRepository(prisma as any);
  const userRepo = new PrismaUserRepository(prisma as any);
  const passwordService = new BcryptPasswordService();

  const useCase = new InviteTeamMemberUseCase(companyRepo, userRepo, passwordService);

  const testEmail = `test-recruiter-${Date.now()}@test.com`;
  console.log("Inviting email:", testEmail);

  try {
    const result = await useCase.execute(owner.id, testEmail, "Test Recruiter", "Recruiter Title");
    console.log("Success:", result);
  } catch (err) {
    console.error("Error executing use case:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
