import type { PrismaClient } from "../client.js";

export async function seedSkills(prisma: PrismaClient): Promise<void> {
  console.warn("⚡ Seeding Skill Categories and Taxonomy...");

  // 1. Categories
  const catBackend = await prisma.skillCategory.upsert({
    where: { name: "Backend Engineering" },
    update: {},
    create: {
      name: "Backend Engineering",
      description: "Server-side development, databases, APIs, and microservices.",
    },
  });

  const catFrontend = await prisma.skillCategory.upsert({
    where: { name: "Frontend Engineering" },
    update: {},
    create: {
      name: "Frontend Engineering",
      description: "Web interfaces, modern JavaScript/TypeScript, CSS, and user experience.",
    },
  });

  const catAI = await prisma.skillCategory.upsert({
    where: { name: "AI & Machine Learning" },
    update: {},
    create: {
      name: "AI & Machine Learning",
      description: "LLM integration, prompt engineering, agentic workflows, and embeddings.",
    },
  });

  // 2. Skills
  const skillTs = await prisma.skill.upsert({
    where: { name: "TypeScript" },
    update: {},
    create: {
      name: "TypeScript",
      categoryId: catBackend.id,
      difficulty: 3,
    },
  });

  const skillNode = await prisma.skill.upsert({
    where: { name: "Node.js" },
    update: {},
    create: {
      name: "Node.js",
      categoryId: catBackend.id,
      difficulty: 3,
    },
  });

  const skillPostgres = await prisma.skill.upsert({
    where: { name: "PostgreSQL" },
    update: {},
    create: {
      name: "PostgreSQL",
      categoryId: catBackend.id,
      difficulty: 4,
    },
  });

  const skillReact = await prisma.skill.upsert({
    where: { name: "React" },
    update: {},
    create: {
      name: "React",
      categoryId: catFrontend.id,
      difficulty: 3,
    },
  });

  const skillPrompt = await prisma.skill.upsert({
    where: { name: "Prompt Engineering" },
    update: {},
    create: {
      name: "Prompt Engineering",
      categoryId: catAI.id,
      difficulty: 4,
    },
  });

  console.warn(
    "✅ Seeded 3 categories and 5 core skills:",
    [skillTs.name, skillNode.name, skillPostgres.name, skillReact.name, skillPrompt.name].join(
      ", ",
    ),
  );
}
