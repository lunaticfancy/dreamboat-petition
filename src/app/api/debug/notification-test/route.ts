import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notifyNewPetition, getNotificationStatus } from '@/lib/notification';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const status = getNotificationStatus();
    const subscriberCount = await prisma.pushSubscription.count();

    return NextResponse.json({
      ...status,
      vapidKeyPreview: process.env.NEXT_PUBLIC_VAPID_KEY
        ? `${process.env.NEXT_PUBLIC_VAPID_KEY.substring(0, 20)}...`
        : 'NOT_SET',
      subscriberCount,
    });
  } catch (error) {
    console.error('Get notification status error:', error);
    return NextResponse.json(
      { error: '상태 조회 중 오류 발생' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !['ADMIN', 'DIRECTOR', 'TEACHER'].includes((session.user as any).role)
    ) {
      return NextResponse.json(
        { error: '관리자, 원장 또는 선생님만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { testType } = body;

    const status = getNotificationStatus();

    if (!status.vapidConfigured) {
      return NextResponse.json({
        success: false,
        error: 'VAPID_NOT_CONFIGURED',
        message:
          'VAPID keys not configured. Check NEXT_PUBLIC_VAPID_KEY and VAPID_PRIVATE_KEY environment variables.',
        status,
      });
    }

    if (testType === 'petition') {
      const result = await notifyNewPetition(
        '테스트 소통함',
        'test-petition-id'
      );
      return NextResponse.json({
        success: true,
        message: '테스트 알림 발송 완료',
        result,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'testType을 지정해주세요 (petition)',
    });
  } catch (error) {
    console.error('Notification test error:', error);
    return NextResponse.json(
      { error: '테스트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
