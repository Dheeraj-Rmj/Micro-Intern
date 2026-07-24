import { prisma } from '../client.js';
import { seedUsers } from './users.seed.js';

/**
 * Database seed orchestrator.
 *
 * Execution order matters — seeds must respect FK dependencies:
 * 1. Users (base identity)
 * 2. Companies + CompanyMembers
 * 3. Trials
 * 4. (Submissions, Evaluations — seeded in integration tests only)
 */
async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  console.log('👤 Seeding users...');
  await seedUsers(prisma);

  console.log('✅ Database seed complete.');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
