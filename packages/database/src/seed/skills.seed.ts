import type { PrismaClient } from '@prisma/client';

export async function seedSkills(prisma: PrismaClient): Promise<void> {
  console.warn('⚡ Seeding Skill Categories and Taxonomy...');

  // 1. Categories
  const catBackend = await prisma.skillCategory.upsert({
    where: { name: 'Backend Engineering' },
    update: {},
    create: {
      name: 'Backend Engineering',
      slug: 'backend-engineering',
      description: 'Server-side development, databases, APIs, and microservices.',
    },
  });

  const catFrontend = await prisma.skillCategory.upsert({
    where: { name: 'Frontend Engineering' },
    update: {},
    create: {
      name: 'Frontend Engineering',
      slug: 'frontend-engineering',
      description: 'Web interfaces, modern JavaScript/TypeScript, CSS, and user experience.',
    },
  });

  const catAI = await prisma.skillCategory.upsert({
    where: { name: 'AI & Machine Learning' },
    update: {},
    create: {
      name: 'AI & Machine Learning',
      slug: 'ai-machine-learning',
      description: 'LLM integration, prompt engineering, agentic workflows, and embeddings.',
    },
  });

  // 2. Skills
  const skillTs = await prisma.skill.upsert({
    where: { slug: 'typescript' },
    update: {},
    create: {
      name: 'TypeScript',
      slug: 'typescript',
      categoryId: catBackend.id,
      difficulty: 3,
      metadata: { language: 'TypeScript', domain: 'universal' },
    },
  });

  const skillNode = await prisma.skill.upsert({
    where: { slug: 'nodejs' },
    update: {},
    create: {
      name: 'Node.js',
      slug: 'nodejs',
      categoryId: catBackend.id,
      difficulty: 3,
      metadata: { runtime: 'Node.js', domain: 'backend' },
    },
  });

  const skillPostgres = await prisma.skill.upsert({
    where: { slug: 'postgresql' },
    update: {},
    create: {
      name: 'PostgreSQL',
      slug: 'postgresql',
      categoryId: catBackend.id,
      difficulty: 4,
      metadata: { db: 'relational' },
    },
  });

  const skillReact = await prisma.skill.upsert({
    where: { slug: 'react' },
    update: {},
    create: {
      name: 'React',
      slug: 'react',
      categoryId: catFrontend.id,
      difficulty: 3,
      metadata: { library: 'React' },
    },
  });

  const skillPrompt = await prisma.skill.upsert({
    where: { slug: 'prompt-engineering' },
    update: {},
    create: {
      name: 'Prompt Engineering',
      slug: 'prompt-engineering',
      categoryId: catAI.id,
      difficulty: 4,
      metadata: { ai: 'LLM' },
    },
  });

  console.warn('✅ Seeded 3 categories and 5 core skills:', [
    skillTs.name,
    skillNode.name,
    skillPostgres.name,
    skillReact.name,
    skillPrompt.name,
  ].join(', '));
}
