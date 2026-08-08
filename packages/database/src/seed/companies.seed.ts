import type { PrismaClient } from '../generated/client/index.js';

/**
 * Seed company data for testing the Company Admin Portal.
 */
export async function seedCompanies(prisma: PrismaClient): Promise<void> {
  const companyId = '10000000-0000-0000-0000-000000000001';
  
  // 1. Create the Company
  await prisma.company.upsert({
    where: { id: companyId },
    update: {},
    create: {
      id: companyId,
      name: 'ACME Corp',
      slug: 'acme-corp',
      status: 'ACTIVE',
      industry: 'Technology',
      location: 'San Francisco, CA',
      planTier: 'ENTERPRISE',
    },
  });
  console.warn('  ✓ Created company: ACME Corp');

  // 2. Associate Users (from users.seed.ts)
  const ownerId = '00000000-0000-0000-0000-000000000003';
  const recruiterId = '00000000-0000-0000-0000-000000000004';
  
  await prisma.companyMember.upsert({
    where: { companyId_userId: { companyId, userId: ownerId } },
    update: {},
    create: { companyId, userId: ownerId, role: 'COMPANY_OWNER' },
  });

  await prisma.companyMember.upsert({
    where: { companyId_userId: { companyId, userId: recruiterId } },
    update: {},
    create: { companyId, userId: recruiterId, role: 'RECRUITER' },
  });

  // 3. Departments
  const departments = [
    { name: 'Engineering', headcount: 45, budget: 150000, status: 'Active' },
    { name: 'Product', headcount: 12, budget: 50000, status: 'Active' },
    { name: 'Marketing', headcount: 8, budget: 25000, status: 'Active' },
    { name: 'Sales', headcount: 22, budget: 75000, status: 'Active' },
    { name: 'HR', headcount: 5, budget: 15000, status: 'Active' }
  ];

  for (const dept of departments) {
    const existing = await prisma.companyDepartment.findFirst({
      where: { companyId, name: dept.name }
    });
    if (!existing) {
      await prisma.companyDepartment.create({
        data: {
          companyId,
          ...dept
        }
      });
    }
  }
  console.warn('  ✓ Seeded company departments');

  // 4. Analytics Snapshot
  const existingAnalytics = await prisma.companyAnalyticsSnapshot.findFirst({
    where: { companyId }
  });
  if (!existingAnalytics) {
    await prisma.companyAnalyticsSnapshot.create({
      data: {
        companyId,
        timeToHireDays: 14.5,
        offerAcceptanceRate: 85.2,
        candidateDropRate: 12.4,
        totalPlacements: 142,
        funnelData: [
          { stage: 'Applied', count: 1200 },
          { stage: 'Assessment', count: 850 },
          { stage: 'Interview', count: 320 },
          { stage: 'Offer', count: 165 },
          { stage: 'Hired', count: 142 }
        ],
        sourceData: [
          { source: 'LinkedIn', percentage: 45 },
          { source: 'Referral', percentage: 25 },
          { source: 'Direct', percentage: 15 },
          { source: 'Job Boards', percentage: 15 }
        ]
      }
    });
    console.warn('  ✓ Seeded company analytics');
  }

  // 5. Billing
  await prisma.companyBilling.upsert({
    where: { companyId },
    update: {},
    create: {
      companyId,
      planName: 'Enterprise AI Suite',
      renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      recruiterSeatsUsed: 2,
      recruiterSeatsMax: 10,
      aiCreditsUsed: 4250,
      aiCreditsMax: 10000,
      storageUsedBytes: 536870912, // 512MB
      storageMaxBytes: 5368709120, // 5GB
    }
  });
  console.warn('  ✓ Seeded company billing');

  // 6. AI Insights
  const insights = [
    {
      type: 'SKILL_SHORTAGE',
      title: 'High demand for Next.js Developers',
      description: 'Your open Engineering roles have a 40% candidate drop-off rate when assessing advanced Next.js concepts. Consider adjusting the assessment difficulty or providing study materials.',
      severity: 'Medium',
      metadata: { role: 'Frontend Engineer', skill: 'Next.js' }
    },
    {
      type: 'MARKET_TREND',
      title: 'Competitive Salary Adjustments Needed',
      description: 'The offer acceptance rate for Senior Backend Engineers has dropped by 15% this quarter. Market data suggests your current compensation band is 10% below the industry average.',
      severity: 'High',
      metadata: { role: 'Senior Backend Engineer', metric: 'Offer Acceptance Rate' }
    },
    {
      type: 'STRATEGY',
      title: 'Optimize Sourcing Channels',
      description: 'Referrals currently yield the highest offer acceptance rate (92%) and lowest time-to-hire (10 days). We recommend launching an internal referral campaign to boost this channel.',
      severity: 'Low',
      metadata: { channel: 'Referral' }
    }
  ];

  for (const insight of insights) {
    const existing = await prisma.aIInsightRecommendation.findFirst({
      where: { companyId, title: insight.title }
    });
    if (!existing) {
      await prisma.aIInsightRecommendation.create({
        data: {
          companyId,
          ...insight,
          metadata: insight.metadata ? JSON.parse(JSON.stringify(insight.metadata)) : null
        }
      });
    }
  }
  console.warn('  ✓ Seeded company AI insights');
}
