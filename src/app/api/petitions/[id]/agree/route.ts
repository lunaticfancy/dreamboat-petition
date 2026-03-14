import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const petitionId = params.id;

    // Get petition
    const petition = await prisma.petition.findUnique({
      where: { id: petitionId },
    });

    if (!petition) {
      return NextResponse.json(
        { error: '청원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Check if petition is still open
    if (petition.status !== 'OPEN') {
      return NextResponse.json(
        { error: '종료된 청원입니다.' },
        { status: 400 }
      );
    }

    // Get session (user may or may not be logged in)
    const session = await getServerSession(authOptions);

    let userId: string | null = null;

    if (session?.user) {
      userId = (session.user as any).id;
    }

    // Get anonymous key from request header or generate from IP
    const anonymousKey =
      req.headers.get('x-anonymous-key') ||
      crypto
        .createHash('sha256')
        .update(req.headers.get('x-forwarded-for') || 'unknown')
        .digest('hex');

    // Check for existing agreement
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
      // For anonymous users, check by anonymousKey
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

    // Create agreement and increment count atomically
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
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: '동의가 완료되었습니다.',
    });
  } catch (error) {
    console.error('Agreement error:', error);
    return NextResponse.json(
      { error: '동의 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
