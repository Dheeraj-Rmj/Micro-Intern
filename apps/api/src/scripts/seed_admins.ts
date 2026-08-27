import { prisma } from "../core/database.js";
import { auth } from "../modules/auth/infrastructure/better-auth.js";

async function main() {
  const emails = [
    "ceo@rmjit.com",
    "manager@rmjit.com",
    "developer1@rmjit.com",
    "developer@rmjit.com",
    "tpo@rmjit.com",
    "rmj@rmjit.com",
  ];

  const plainPassword = "Rmjit@123";

  for (const email of emails) {
    try {
      // 1. Create user via better-auth to ensure correct password hashing and Account linkages
      await auth.api.signUpEmail({
        body: {
          email,
          password: plainPassword,
          name: "Super Admin",
          firstName: "Super",
          lastName: "Admin",
          role: "SUPER_ADMIN",
        },
      });

      // 2. Force update status and mfaEnabled directly via Prisma to bypass verification
      await prisma.user.update({
        where: { email },
        data: {
          status: "ACTIVE",
          mfaEnabled: false,
        },
      });
      console.log(`✅ Seeded Super Admin: ${email}`);
    } catch (err: any) {
      const errorStr = String(err).toLowerCase();
      if (errorStr.includes("already exists") || errorStr.includes("unique constraint")) {
        console.log(`⚠️ User already exists: ${email}. Attempting to force update...`);
        await prisma.user.update({
          where: { email },
          data: {
            role: "SUPER_ADMIN",
            status: "ACTIVE",
            mfaEnabled: false,
          },
        });
        console.log(`✅ Updated existing Super Admin: ${email}`);
      } else {
        console.error(`❌ Failed to seed ${email}:`, err);
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
