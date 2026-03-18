import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.setting.upsert({
    where: { key: 'threshold' },
    update: { value: '5' },
    create: { key: 'threshold', value: '5', description: '테스트용 임계값' },
  });
  console.log('Threshold set to 5');

  const parent1 = await prisma.user.findUnique({
    where: { email: 'parent1@test.com' },
  });
  const parent2 = await prisma.user.findUnique({
    where: { email: 'parent2@test.com' },
  });
  const parent3 = await prisma.user.findUnique({
    where: { email: 'parent3@test.com' },
  });
  const parent4 = await prisma.user.findUnique({
    where: { email: 'parent4@test.com' },
  });
  const parent5 = await prisma.user.findUnique({
    where: { email: 'parent5@test.com' },
  });

  await prisma.agreement.deleteMany({
    where: { petition: { title: { startsWith: '테스트 시나리오' } } },
  });
  await prisma.petition.deleteMany({
    where: { title: { startsWith: '테스트 시나리오' } },
  });

  const petition = await prisma.petition.create({
    data: {
      title: '테스트 시나리오: 놀이터 개선 요청',
      content: '어린이집 놀이터를 더 안전하고 재미있게 개선해 주세요.',
      status: 'OPEN',
      threshold: 5,
      authorId: parent1.id,
      agreedCount: 1,
      agreements: {
        create: {
          userId: parent1.id,
          anonymousKey: 'parent1_' + Date.now(),
        },
      },
    },
  });
  console.log('Created petition:', petition.id);

  const parents = [parent2, parent3, parent4, parent5];
  for (const parent of parents) {
    await prisma.agreement.create({
      data: {
        userId: parent.id,
        petitionId: petition.id,
        anonymousKey: parent.email + '_' + Date.now(),
      },
    });
    await prisma.petition.update({
      where: { id: petition.id },
      data: { agreedCount: { increment: 1 } },
    });
  }

  const final = await prisma.petition.findUnique({
    where: { id: petition.id },
  });
  console.log(
    'Petition status:',
    final.status,
    '- agreements:',
    final.agreedCount
  );
  console.log('Test ready!');

  process.exit(0);
}

main();
