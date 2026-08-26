import { prisma } from "./src/core/database.js";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function main() {
  const emails = [
    "rmjit@gmail.com",
    "microintern@gmail.com",
    "saimicrointern@gmail.com",
    "rmjit12@gmail.com",
    "rmjit13@gmail.com"
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
        mfaEnabled: false // explicitly disable MFA for this testing to bypass shortcut modal limits
      },
    });
    console.log(`✅ Seeded Super Admin: ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
