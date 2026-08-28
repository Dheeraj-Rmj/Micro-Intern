import { prisma } from "../core/database.js";
import bcrypt from "bcryptjs";

async function main() {
  const email = "rahul@rmjit.com";
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log(`User ${email} not found in database.`);
    return;
  }

  const plainPassword = "MicroIntern@123";
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  await prisma.user.update({
    where: { email },
    data: { passwordHash }
  });

  console.log(`Successfully reset password for ${email} to: ${plainPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
