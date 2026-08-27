import bcrypt from "bcryptjs";
import { prisma } from "../core/database.js";
import { Role, EntityStatus } from "@microintern/database";

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
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  for (const email of emails) {
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        await prisma.user.update({
          where: { email },
          data: {
            role: Role.SUPER_ADMIN,
            status: EntityStatus.ACTIVE,
            mfaEnabled: false,
            emailVerified: true,
          },
        });
        console.log(`✅ Updated existing Super Admin: ${email}`);
      } else {
        await prisma.user.create({
          data: {
            email,
            firstName: "Super",
            lastName: "Admin",
            passwordHash,
            role: Role.SUPER_ADMIN,
            status: EntityStatus.ACTIVE,
            emailVerified: true,
            mfaEnabled: false,
          },
        });
        console.log(`✅ Seeded Super Admin: ${email}`);
      }
    } catch (err: any) {
      console.error(`❌ Failed to seed ${email}:`, err);
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
