import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: petitionId } = await params;

    const petition = await prisma.petition.findUnique({
      where: { id: petitionId },
    });

    if (!petition) {
      return NextResponse.json(
        { error: '소통함을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (petition.status !== 'OPEN') {
      return NextResponse.json(
        { error: '진행 중인 소통함에만 동의할 수 있습니다.' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    let userId: string | null = null;

    if (session?.user) {
      userId = (session.user as any).id;
      const userRole = (session.user as any).role as string | undefined;

      if (userRole && ['TEACHER', 'DIRECTOR', 'ADMIN'].includes(userRole)) {
        return NextResponse.json(
          { error: '선생님, 원장, 관리자는 소통함에 동의할 수 없습니다.' },
          { status: 403 }
        );
      }
    }

    const anonymousKey =
      req.headers.get('x-anonymous-key') ||
      crypto
        .createHash('sha256')
        .update(req.headers.get('x-forwarded-for') || 'unknown')
        .digest('hex');

    if (userId) {
      const existingAgreement = await prisma.agreement.findUnique({
        where: {
          userId_petitionId: {
            userId,
            petitionId,
          },
        },
      });

      if (existingAgreement) {
        return NextResponse.json(
          { error: '이미 동의하셨습니다.' },
          { status: 400 }
        );
      }
    } else {
      const existingAgreement = await prisma.agreement.findFirst({
        where: {
          anonymousKey,
          petitionId,
        },
      });

      if (existingAgreement) {
        return NextResponse.json(
          { error: '이미 동의하셨습니다.' },
          { status: 400 }
        );
      }
    }

    const thresholdSetting = await prisma.setting.findUnique({
      where: { key: 'threshold' },
    });

    const threshold = thresholdSetting
      ? parseInt(thresholdSetting.value, 10)
      : 10;

    const newAgreedCount = petition.agreedCount + 1;
    const thresholdReached = newAgreedCount >= threshold;

    await prisma.$transaction([
      prisma.agreement.create({
        data: {
          userId: userId || 'anonymous',
          petitionId,
          anonymousKey,
        },
      }),
      prisma.petition.update({
        where: { id: petitionId },
        data: {
          agreedCount: {
            increment: 1,
          },
          ...(thresholdReached && petition.status === 'OPEN'
            ? { status: 'PENDING_ANSWER' }
            : {}),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: thresholdReached
        ? '동의가 완료되었습니다. 답변 대기 상태로 변경되었습니다.'
        : '동의가 완료되었습니다.',
      thresholdReached,
    });
  } catch (error) {
    console.error('Agreement error:', error);
    return NextResponse.json(
      { error: '동의 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: petitionId } = await params;

    const petition = await prisma.petition.findUnique({
      where: { id: petitionId },
    });

    if (!petition) {
      return NextResponse.json(
        { error: '소통함을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (petition.status !== 'OPEN') {
      return NextResponse.json(
        { error: '진행 중인 소통함에만 동의할 수 있습니다.' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    let userId: string | null = null;

    if (session?.user) {
      userId = (session.user as any).id;
    }

    const anonymousKey =
      req.headers.get('x-anonymous-key') ||
      crypto
        .createHash('sha256')
        .update(req.headers.get('x-forwarded-for') || 'unknown')
        .digest('hex');

    let deletedAgreement = null;

    if (userId) {
      deletedAgreement = await prisma.agreement.deleteMany({
        where: {
          userId,
          petitionId,
        },
      });
    } else {
      deletedAgreement = await prisma.agreement.deleteMany({
        where: {
          anonymousKey,
          petitionId,
        },
      });
    }

    if (!deletedAgreement || deletedAgreement.count === 0) {
      return NextResponse.json(
        { error: '동의한 기록이 없습니다.' },
        { status: 400 }
      );
    }

    await prisma.petition.update({
      where: { id: petitionId },
      data: {
        agreedCount: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: '동의가 취소되었습니다.',
    });
  } catch (error) {
    console.error('Cancel agreement error:', error);
    return NextResponse.json(
      { error: '동의 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
