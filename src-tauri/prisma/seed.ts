import { PrismaClient, RoleName, ActivityStatus, ActivityType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: RoleName.TEACHER },
      update: {},
      create: { name: RoleName.TEACHER },
    }),
    prisma.role.upsert({
      where: { name: RoleName.SUPERVISOR },
      update: {},
      create: { name: RoleName.SUPERVISOR },
    }),
    prisma.role.upsert({
      where: { name: RoleName.ADMIN },
      update: {},
      create: { name: RoleName.ADMIN },
    }),
  ]);

  const [teacherRole, supervisorRole] = roles;

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      passwordHash: password,
      displayName: 'Taylor Teacher',
      role: { connect: { id: teacherRole.id } },
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@example.com' },
    update: {},
    create: {
      email: 'supervisor@example.com',
      passwordHash: password,
      displayName: 'Sam Supervisor',
      role: { connect: { id: supervisorRole.id } },
    },
  });

  await prisma.rubricConfiguration.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Impact',
        description: 'How the activity impacts learners or community.',
        weight: 0.4,
      },
      {
        name: 'Reflection',
        description: 'Quality of reflection submitted by the educator.',
        weight: 0.3,
      },
      {
        name: 'Evidence',
        description: 'Strength of supporting evidence provided.',
        weight: 0.3,
      },
    ],
  });

  const goal = await prisma.yearlyGoal.upsert({
    where: {
      userId_year: {
        userId: teacher.id,
        year: new Date().getFullYear(),
      },
    },
    update: {},
    create: {
      userId: teacher.id,
      year: new Date().getFullYear(),
      targetHours: 40,
      notes: 'Default target for professional development.',
    },
  });

  await prisma.activity.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'STEM Workshop',
      activityType: ActivityType.PROFESSIONAL_DEVELOPMENT,
      provider: 'Local University',
      activityDate: new Date(),
      hours: 4,
      reflection: 'Great opportunity to collaborate with peers.',
      status: ActivityStatus.SUBMITTED,
      ownerId: teacher.id,
      reviewerId: supervisor.id,
      goalId: goal.id,
      tags: {
        create: [
          {
            tag: {
              connectOrCreate: {
                where: { name: 'STEM' },
                create: { name: 'STEM' },
              },
            },
          },
          {
            tag: {
              connectOrCreate: {
                where: { name: 'Workshop' },
                create: { name: 'Workshop' },
              },
            },
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: ActivityStatus.DRAFT,
            comment: 'Initial draft created.',
            changedById: teacher.id,
          },
          {
            status: ActivityStatus.SUBMITTED,
            comment: 'Submitted for review.',
            changedById: teacher.id,
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
