import { prisma } from "../core/database.js";

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: "Alice", mode: "insensitive" } },
        { firstName: { contains: "Alice", mode: "insensitive" } },
        { lastName: { contains: "Owner", mode: "insensitive" } }
      ]
    }
  });

  console.log("Found users to remove:", users);

  for (const user of users) {
    if (user.name === "Alice Owner" || (user.firstName === "Alice" && user.lastName === "Owner")) {
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log(`Deleted user ${user.id} (${user.email})`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
