import { prisma } from '../client.js';

import { seedUsers } from './users.seed.js';
import { seedSkills } from './skills.seed.js';

/**
 * Database seed orchestrator.
 *
 * Execution order matters — seeds must respect FK dependencies:
 * 1. Users (base identity)
 * 2. Skills & Taxonomy
 * 3. Companies + CompanyMembers
 * 4. Assessments
 */
async function main(): Promise<void> {
  console.warn('🌱 Starting database seed...');

  console.warn('👤 Seeding users...');
  await seedUsers(prisma);

  console.warn('⚡ Seeding skill framework...');
  await seedSkills(prisma);

  console.warn('✅ Database seed complete.');
}


main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
