import { prisma } from "../core/database.js";

async function main() {
  const email = 'vyshnavinakka5@gmail.com';
  
  // Update the user role to SUPER_ADMIN
  const res = await prisma.user.updateMany({
    where: { email },
    data: { role: 'SUPER_ADMIN' }
  });

  if (res.count === 0) {
    console.log(`User ${email} not found in database. Make sure you register first!`);
  } else {
    console.log(`Successfully updated ${email} to SUPER_ADMIN role!`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
