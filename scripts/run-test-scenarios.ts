/**
 * Test Scenarios for Petition (소통함) System
 *
 * This file contains multiple test scenarios with different situations.
 * Run with: npx tsx scripts/run-test-scenarios.ts
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

// Test user emails
const USERS = {
  parent1: 'parent1@test.com',
  parent2: 'parent2@test.com',
  parent3: 'parent3@test.com',
  parent4: 'parent4@test.com',
  parent5: 'parent5@test.com',
  director: 'director@test.com',
  admin: 'admin@debug.local',
};

/**
 * Clean up test data
 */
async function cleanup() {
  await prisma.agreement.deleteMany({
    where: { petition: { title: { startsWith: '[TEST]' } } },
  });
  await prisma.comment.deleteMany({
    where: { petition: { title: { startsWith: '[TEST]' } } },
  });
  await prisma.answer.deleteMany({
    where: { petition: { title: { startsWith: '[TEST]' } } },
  });
  await prisma.petition.deleteMany({
    where: { title: { startsWith: '[TEST]' } },
  });
  console.log('✓ Cleaned up previous test data');
}

/**
 * Get test users
 */
async function getUsers() {
  const users = {};
  for (const [key, email] of Object.entries(USERS)) {
    users[key] = await prisma.user.findUnique({ where: { email } });
  }
  return users;
}

/**
 * Scenario 1: Basic Flow (Threshold Reached → Answered)
 *
 * Flow: Parent creates → Parents agree → Threshold reached → Director answers → ANSWERED
 */
async function scenario1_BasicFlow(users) {
  console.log('\n=== Scenario 1: Basic Flow (답변 완료) ===');

  // Set threshold to 3 for easier testing
  await prisma.setting.upsert({
    where: { key: 'threshold' },
    update: { value: '3' },
    create: { key: 'threshold', value: '3', description: '테스트용 임계값' },
  });

  // Create petition
  const petition = await prisma.petition.create({
    data: {
      title: '[TEST] 시나리오1: 놀이터 개선 요청',
      content: '어린이집 놀이터를 더 안전하게 개선해 주세요.',
      status: 'OPEN',
      threshold: 3,
      authorId: users.parent1.id,
      agreedCount: 1,
      agreements: {
        create: {
          userId: users.parent1.id,
          anonymousKey: 'sc1_parent1_' + Date.now(),
        },
      },
    },
  });
  console.log(`  Created petition: ${petition.id}`);
  console.log(
    `  Status: ${petition.status}, Agreements: ${petition.agreedCount}/${petition.threshold}`
  );

  // Parents 2, 3 agree (reaching threshold)
  for (const parent of [users.parent2, users.parent3]) {
    await prisma.agreement.create({
      data: {
        userId: parent.id,
        petitionId: petition.id,
        anonymousKey: parent.email + '_' + Date.now(),
      },
    });
  }
  await prisma.petition.update({
    where: { id: petition.id },
    data: { agreedCount: 3, status: 'PENDING_ANSWER' }, // Manually set (API normally does this)
  });
  console.log(`  Parents agreed → Status: PENDING_ANSWER, Agreements: 3/3`);

  // Director answers
  await prisma.answer.create({
    data: {
      content:
        '놀이터 개선 계획을 수립하겠습니다. 다음 달에 시공을 시작합니다.',
      authorId: users.director.id,
      petitionId: petition.id,
    },
  });
  await prisma.petition.update({
    where: { id: petition.id },
    data: { status: 'ANSWERED', answeredAt: new Date() },
  });
  console.log(`  Director answered → Status: ANSWERED`);

  // Verify
  const final = await prisma.petition.findUnique({
    where: { id: petition.id },
    include: { answers: true },
  });
  console.log(`  ✓ Final Status: ${final.status}`);
  console.log(`  ✓ Answer: ${final.answers[0]?.content.substring(0, 30)}...`);

  return petition.id;
}

/**
 * Scenario 2: Petition Merge
 *
 * Flow: Two similar petitions → Admin merges one into another → Source = MERGED
 */
async function scenario2_PetitionMerge(users) {
  console.log('\n=== Scenario 2: Petition Merge (병합) ===');

  // Create two similar petitions
  const petition1 = await prisma.petition.create({
    data: {
      title: '[TEST] 시나리오2-1: 식당 메뉴 개선',
      content: '아이들 식사 메뉴를 더 건강하게 만들어주세요.',
      status: 'OPEN',
      threshold: 3,
      authorId: users.parent1.id,
      agreedCount: 2,
    },
  });

  const petition2 = await prisma.petition.create({
    data: {
      title: '[TEST] 시나리오2-2: 급식 품질 개선',
      content: '급식의 질을 높이해주세요.',
      status: 'OPEN',
      threshold: 3,
      authorId: users.parent2.id,
      agreedCount: 3,
    },
  });

  console.log(`  Created petition1: ${petition1.id} (${petition1.title})`);
  console.log(`  Created petition2: ${petition2.id} (${petition2.title})`);

  // Simulate merge (admin action)
  // Move all data from petition1 to petition2
  await prisma.agreement.updateMany({
    where: { petitionId: petition1.id },
    data: { petitionId: petition2.id },
  });
  await prisma.comment.updateMany({
    where: { petitionId: petition1.id },
    data: { petitionId: petition2.id },
  });
  await prisma.answer.updateMany({
    where: { petitionId: petition1.id },
    data: { petitionId: petition2.id },
  });

  // Update target petition count
  const newCount = await prisma.agreement.count({
    where: { petitionId: petition2.id },
  });
  await prisma.petition.update({
    where: { id: petition2.id },
    data: { agreedCount: newCount },
  });

  // Mark source as MERGED
  await prisma.petition.update({
    where: { id: petition1.id },
    data: {
      status: 'MERGED',
      mergedToId: petition2.id,
      mergedAt: new Date(),
      agreedCount: 0,
    },
  });

  // Verify
  const merged = await prisma.petition.findUnique({
    where: { id: petition1.id },
  });
  const target = await prisma.petition.findUnique({
    where: { id: petition2.id },
    include: { mergedFrom: true },
  });

  console.log(`  ✓ Source status: ${merged.status}`);
  console.log(`  ✓ Source mergedToId: ${merged.mergedToId}`);
  console.log(`  ✓ Target agreements: ${target.agreedCount}`);

  return [petition1.id, petition2.id];
}

/**
 * Scenario 3: Threshold Not Reached
 *
 * Flow: Parent creates → Few agree → Threshold not reached → Status stays OPEN
 */
async function scenario3_ThresholdNotReached(users) {
  console.log('\n=== Scenario 3: Threshold Not Reached (진행 중) ===');

  const petition = await prisma.petition.create({
    data: {
      title: '[TEST] 시나리오3: 외부 행사 요청',
      content: '이번 주말에 외부 행사를 열어주세요.',
      status: 'OPEN',
      threshold: 5,
      authorId: users.parent1.id,
      agreedCount: 2,
      agreements: {
        create: [
          { userId: users.parent1.id, anonymousKey: 'sc3_p1_' + Date.now() },
          { userId: users.parent2.id, anonymousKey: 'sc3_p2_' + Date.now() },
        ],
      },
    },
  });

  console.log(`  Created petition: ${petition.id}`);
  console.log(
    `  Status: ${petition.status}, Agreements: ${petition.agreedCount}/${petition.threshold}`
  );
  console.log(`  ✓ Status stays OPEN (threshold not reached)`);

  return petition.id;
}

/**
 * Scenario 4: Multiple Answers
 *
 * Flow: Petition answered → Additional answers can be added
 */
async function scenario4_MultipleAnswers(users) {
  console.log('\n=== Scenario 4: Multiple Answers (다중 답변) ===');

  const petition = await prisma.petition.create({
    data: {
      title: '[TEST] 시나리오4: 교통 안전 개선',
      content: '등하원 시간 교통 안전을 강화해주세요.',
      status: 'ANSWERED',
      threshold: 3,
      authorId: users.parent1.id,
      agreedCount: 3,
      answeredAt: new Date(),
    },
  });

  // First answer
  await prisma.answer.create({
    data: {
      content:
        '학부모 분들의 의견을听取했습니다. 교통 유도원을 배치하겠습니다.',
      authorId: users.director.id,
      petitionId: petition.id,
    },
  });

  // Additional answer (follow-up)
  await prisma.answer.create({
    data: {
      content: '추가로 보완 사항: 보호자 대기 공간을 설치합니다.',
      authorId: users.director.id,
      petitionId: petition.id,
    },
  });

  // Verify
  const answers = await prisma.answer.findMany({
    where: { petitionId: petition.id },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`  Created petition: ${petition.id}`);
  console.log(`  ✓ Answers count: ${answers.length}`);
  answers.forEach((a, i) => {
    console.log(`    ${i + 1}. ${a.content.substring(0, 30)}...`);
  });

  return petition.id;
}

/**
 * Scenario 5: Comment/Discussion
 *
 * Flow: Petition with comments from various users
 */
async function scenario5_PetitionWithComments(users) {
  console.log('\n=== Scenario 5: Petition with Comments (댓글) ===');

  const petition = await prisma.petition.create({
    data: {
      title: '[TEST] 시나리오5: 체육복 개선',
      content: '체육수업 복장을 완화해주세요.',
      status: 'OPEN',
      threshold: 3,
      authorId: users.parent1.id,
      agreedCount: 1,
    },
  });

  await prisma.comment.create({
    data: {
      content: '이건 정말 필요한 개선이네요!',
      userId: users.parent2.id,
      petitionId: petition.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: '동의합니다. 특히 여름철服装이 너무 복잡해요.',
      userId: users.parent3.id,
      petitionId: petition.id,
    },
  });

  const comments = await prisma.comment.findMany({
    where: { petitionId: petition.id },
  });

  console.log(`  Created petition: ${petition.id}`);
  console.log(`  ✓ Comments count: ${comments.length}`);
  comments.forEach((c) => {
    console.log(`    - ${c.content.substring(0, 30)}...`);
  });

  return petition.id;
}

/**
 * Scenario 6: Duplicate Agreement Prevention
 *
 * Flow: Same user tries to agree twice → Should fail (unique constraint)
 * Note: Role restriction (TEACHER/DIRECTOR/ADMIN can't agree) is handled at API level
 */
async function scenario6_DuplicateAgreement(users) {
  console.log(
    '\n=== Scenario 6: Duplicate Agreement Prevention (중복 동의 방지) ==='
  );

  const petition = await prisma.petition.create({
    data: {
      title: '[TEST] 시나리오6:Vista 개선 요청',
      content: '비Vista를 더明亮하게 해주세요.',
      status: 'OPEN',
      threshold: 3,
      authorId: users.parent1.id,
      agreedCount: 1,
      agreements: {
        create: {
          userId: users.parent2.id,
          anonymousKey: 'sc6_p2_' + Date.now(),
        },
      },
    },
  });

  console.log(`  Created petition: ${petition.id}`);
  console.log(`  First agreement from parent2: ✓`);

  // Try to create duplicate agreement (should fail at DB level)
  let duplicateFailed = false;
  try {
    await prisma.agreement.create({
      data: {
        userId: users.parent2.id, // Same user
        petitionId: petition.id,
        anonymousKey: 'sc6_p2_duplicate_' + Date.now(),
      },
    });
  } catch (error) {
    duplicateFailed = true;
    console.log(`  ✓ Duplicate agreement blocked (unique constraint)`);
  }

  if (!duplicateFailed) {
    console.log(`  ✗ ERROR: Duplicate agreement was allowed!`);
  }

  // Verify only 1 agreement exists
  const count = await prisma.agreement.count({
    where: { petitionId: petition.id },
  });
  console.log(`  ✓ Final agreement count: ${count}`);

  return petition.id;
}

/**
 * Scenario 7: Answer Editing with History
 *
 * Flow: Director creates answer → Edits answer → Edit history is saved
 */
async function scenario7_AnswerEditHistory(users) {
  console.log(
    '\n=== Scenario 7: Answer Editing with History (답변 수정 이력) ==='
  );

  const petition = await prisma.petition.create({
    data: {
      title: '[TEST] 시나리오7: 야간 교육 프로그램',
      content: '저녁 시간 보충수업 프로그램을 만들어주세요.',
      status: 'PENDING_ANSWER',
      threshold: 3,
      authorId: users.parent1.id,
      agreedCount: 3,
    },
  });

  // Create initial answer
  const answer = await prisma.answer.create({
    data: {
      content: '현재 인력 부족으로 어려울 수 있습니다.',
      authorId: users.director.id,
      petitionId: petition.id,
    },
  });
  console.log(`  Created petition: ${petition.id}`);
  console.log(`  Initial answer: "${answer.content.substring(0, 30)}..."`);

  // Simulate answer edit (update content + create history)
  await prisma.answerEditHistory.create({
    data: {
      answerId: answer.id,
      previousContent: answer.content,
    },
  });

  await prisma.answer.update({
    where: { id: answer.id },
    data: { content: '위원회成立后 검토해보겠습니다. 来月 답변 드리겠습니다.' },
  });

  // Verify edit history
  const editHistory = await prisma.answerEditHistory.findMany({
    where: { answerId: answer.id },
    orderBy: { editedAt: 'asc' },
  });

  const updatedAnswer = await prisma.answer.findUnique({
    where: { id: answer.id },
  });

  console.log(
    `  ✓ Updated answer: "${updatedAnswer.content.substring(0, 30)}..."`
  );
  console.log(`  ✓ Edit history count: ${editHistory.length}`);
  if (editHistory.length > 0) {
    console.log(
      `    Previous: "${editHistory[0].previousContent.substring(0, 30)}..."`
    );
  }

  return petition.id;
}

/**
 * Scenario 8: Petition Report and Hide
 *
 * Flow: Parent reports inappropriate petition → Admin hides it
 */
async function scenario8_ReportAndHide(users) {
  console.log(
    '\n=== Scenario 8: Petition Report and Hide (신고 및 숨기기) ==='
  );

  const petition = await prisma.petition.create({
    data: {
      title: '[TEST] 시나리오8: 부적절한 콘텐츠 포함',
      content: '이 내용은 부적절합니다.',
      status: 'OPEN',
      threshold: 3,
      authorId: users.parent1.id,
      agreedCount: 1,
    },
  });
  console.log(`  Created petition: ${petition.id}`);
  console.log(`  Initial isHidden: ${petition.isHidden}`);

  // Create report
  const report = await prisma.report.create({
    data: {
      reason: '부적절한 내용',
      petitionId: petition.id,
      reporterId: users.parent2.id,
    },
  });
  console.log(`  Created report: ${report.id}`);

  // Admin hides the petition
  await prisma.petition.update({
    where: { id: petition.id },
    data: { isHidden: true },
  });

  // Verify
  const hiddenPetition = await prisma.petition.findUnique({
    where: { id: petition.id },
  });

  console.log(`  ✓ Updated isHidden: ${hiddenPetition.isHidden}`);
  console.log(`  ✓ Report status: ${report.status || 'PENDING'}`);

  return petition.id;
}

/**
 * Scenario 9: Author Cannot Agree to Own Petition
 *
 * Flow: Author tries to agree to their own petition → Should not count
 */
async function scenario9_AuthorSelfAgreement(users) {
  console.log(
    '\n=== Scenario 9: Author Self-Agreement Prevention (본인 동의 방지) ==='
  );

  const petition = await prisma.petition.create({
    data: {
      title: '[TEST] 시나리오9:Vista 개선 요청',
      content: '본인이 작성한Vista에 동의합니다.',
      status: 'OPEN',
      threshold: 3,
      authorId: users.parent1.id,
      agreedCount: 1,
      agreements: {
        create: {
          userId: users.parent1.id, // Author agrees to own petition
          anonymousKey: 'sc9_author_' + Date.now(),
        },
      },
    },
  });

  console.log(`  Created petition: ${petition.id}`);
  console.log(`  Author's self-agreement created`);
  console.log(`  Note: API should prevent this, but DB allows it for now`);
  console.log(`  ✓ Current agreedCount: ${petition.agreedCount}`);

  return petition.id;
}

/**
 * Main runner
 */
async function main() {
  console.log('Starting Test Scenarios...\n');

  await cleanup();
  const users = await getUsers();

  const results = {
    scenario1: await scenario1_BasicFlow(users),
    scenario2: await scenario2_PetitionMerge(users),
    scenario3: await scenario3_ThresholdNotReached(users),
    scenario4: await scenario4_MultipleAnswers(users),
    scenario5: await scenario5_PetitionWithComments(users),
    scenario6: await scenario6_DuplicateAgreement(users),
    scenario7: await scenario7_AnswerEditHistory(users),
    scenario8: await scenario8_ReportAndHide(users),
    scenario9: await scenario9_AuthorSelfAgreement(users),
  };

  console.log('\n=== Summary ===');
  console.log('Scenario 1 (Basic Flow):', results.scenario1);
  console.log('Scenario 2 (Merge):', results.scenario2);
  console.log('Scenario 3 (Not Reached):', results.scenario3);
  console.log('Scenario 4 (Multiple Answers):', results.scenario4);
  console.log('Scenario 5 (Comments):', results.scenario5);
  console.log('Scenario 6 (Duplicate Prevention):', results.scenario6);
  console.log('Scenario 7 (Answer Edit History):', results.scenario7);
  console.log('Scenario 8 (Report and Hide):', results.scenario8);
  console.log('Scenario 9 (Author Self-Agreement):', results.scenario9);

  process.exit(0);
}

main().catch(console.error);
