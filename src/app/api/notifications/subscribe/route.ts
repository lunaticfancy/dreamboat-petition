import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole !== 'TEACHER' && userRole !== 'DIRECTOR') {
      return NextResponse.json(
        { error: '교직원만 알림을 구독할 수 있습니다.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { endpoint, p256dh, auth } = body;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { error: '구독 정보가 불완전합니다.' },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth },
      create: {
        userId,
        endpoint,
        p256dh,
        auth,
      },
    });

    return NextResponse.json({
      success: true,
      message: '푸시 알림을 구독했습니다.',
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: '구독 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: '엔드포인트가 필요합니다.' },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId },
    });

    return NextResponse.json({
      success: true,
      message: '푸시 알림 구독을 해지했습니다.',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: '구독 해지 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
