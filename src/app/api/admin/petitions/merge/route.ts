import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { sourceId, targetId } = await req.json();

    // Validation
    if (!sourceId || !targetId) {
      return NextResponse.json(
        { error: '원본 청원 ID와 대상 청원 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (sourceId === targetId) {
      return NextResponse.json(
        { error: '동일한 청원으로 병합할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Check if source petition exists and is not already merged
    const sourcePetition = await prisma.petition.findUnique({
      where: { id: sourceId },
      include: {
        _count: {
          select: { agreements: true, comments: true },
        },
      },
    });

    if (!sourcePetition) {
      return NextResponse.json(
        { error: '원본 청원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (sourcePetition.status === 'MERGED') {
      return NextResponse.json(
        { error: '이미 병합된 청원은 다시 병합할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Check if target petition exists and is not merged
    const targetPetition = await prisma.petition.findUnique({
      where: { id: targetId },
    });

    if (!targetPetition) {
      return NextResponse.json(
        { error: '대상 청원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (targetPetition.status === 'MERGED') {
      return NextResponse.json(
        { error: '병합된 청원을 대상으로 선택할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Perform merge in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Move all agreements from source to target (avoid duplicates)
      const sourceAgreements = await tx.agreement.findMany({
        where: { petitionId: sourceId },
        select: { userId: true, anonymousKey: true, createdAt: true },
      });

      // Get existing agreements in target
      const targetAgreements = await tx.agreement.findMany({
        where: { petitionId: targetId },
        select: { userId: true },
      });
      const targetUserIds = new Set(targetAgreements.map((a) => a.userId));

      // Create agreements for users who haven't agreed to target yet
      for (const agreement of sourceAgreements) {
        if (!targetUserIds.has(agreement.userId)) {
          await tx.agreement.create({
            data: {
              userId: agreement.userId,
              petitionId: targetId,
              anonymousKey: agreement.anonymousKey,
              createdAt: agreement.createdAt,
            },
          });
        }
      }

      // 2. Move all comments from source to target
      await tx.comment.updateMany({
        where: { petitionId: sourceId },
        data: { petitionId: targetId },
      });

      // 3. Move all answers from source to target
      await tx.answer.updateMany({
        where: { petitionId: sourceId },
        data: { petitionId: targetId },
      });

      // 4. Move all files from source to target
      await tx.fileUpload.updateMany({
        where: { petitionId: sourceId },
        data: { petitionId: targetId },
      });

      // 5. Move all reports from source to target
      await tx.report.updateMany({
        where: { petitionId: sourceId },
        data: { petitionId: targetId },
      });

      // 6. Update target petition's agreedCount
      const finalAgreedCount = await tx.agreement.count({
        where: { petitionId: targetId },
      });

      await tx.petition.update({
        where: { id: targetId },
        data: { agreedCount: finalAgreedCount },
      });

      // 7. Mark source petition as MERGED
      const mergedPetition = await tx.petition.update({
        where: { id: sourceId },
        data: {
          status: 'MERGED',
          mergedToId: targetId,
          mergedAt: new Date(),
          agreedCount: 0,
        },
      });

      return mergedPetition;
    });

    return NextResponse.json({
      success: true,
      message: '청원이 성공적으로 병합되었습니다.',
      mergedPetition: result,
    });
  } catch (error) {
    console.error('Merge petition error:', error);
    return NextResponse.json(
      { error: '청원 병합 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
