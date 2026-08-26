import { prisma } from "../core/database.js";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

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
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(plainPassword, salt);

  for (const email of emails) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: "SUPER_ADMIN",
        passwordHash,
      },
      create: {
        id: uuidv4(),
        email,
        firstName: "Super",
        lastName: "Admin",
        role: "SUPER_ADMIN",
        passwordHash,
        status: "ACTIVE",
        mfaEnabled: false, // explicitly disable MFA for this testing to bypass shortcut modal limits
      },
    });
    console.log(`✅ Seeded Super Admin: ${user.email}`);
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
