import bcrypt from 'bcryptjs';

import type { PrismaClient } from '../generated/client/index.js';

/**
 * Seed platform users.
 *
 * Creates deterministic seed users for development and testing.
 * All passwords are 'Password@123' — clearly documented here.
 * NEVER run this seed against production.
 */
export async function seedUsers(prisma: PrismaClient): Promise<void> {
  const SEED_PASSWORD = 'Password@123';
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  const now = new Date();

  const users = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'superadmin@microintern.io',
      role: 'SUPER_ADMIN' as const,
      status: 'ACTIVE' as const,
      firstName: 'Super',
      lastName: 'Admin',
      emailVerifiedAt: now,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'admin@microintern.io',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
      firstName: 'Platform',
      lastName: 'Admin',
      emailVerifiedAt: now,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'owner@acme.com',
      role: 'COMPANY_OWNER' as const,
      status: 'ACTIVE' as const,
      firstName: 'Alice',
      lastName: 'Owner',
      emailVerifiedAt: now,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'recruiter@acme.com',
      role: 'RECRUITER' as const,
      status: 'ACTIVE' as const,
      firstName: 'Bob',
      lastName: 'Recruiter',
      emailVerifiedAt: now,
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      email: 'candidate@example.com',
      role: 'CANDIDATE' as const,
      status: 'ACTIVE' as const,
      firstName: 'Charlie',
      lastName: 'Candidate',
      emailVerifiedAt: now,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        ...user,
        passwordHash,
      },
    });
    console.warn(`  ✓ ${user.role}: ${user.email}`);
  }

  console.warn(`  ℹ️  All seed user passwords: ${SEED_PASSWORD}`);
}
