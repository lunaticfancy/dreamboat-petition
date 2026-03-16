import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const DEFAULT_THRESHOLD = 10;

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    let thresholdSetting = await prisma.setting.findUnique({
      where: { key: 'threshold' },
    });

    // Create default threshold if not exists
    if (!thresholdSetting) {
      thresholdSetting = await prisma.setting.create({
        data: {
          key: 'threshold',
          value: String(DEFAULT_THRESHOLD),
          description: '청원 답변을 위한 필요 동의 수',
        },
      });
    }

    return NextResponse.json({
      threshold: parseInt(thresholdSetting.value, 10),
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: '설정 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { threshold } = await req.json();

    // Validate threshold
    if (threshold === undefined || threshold === null) {
      return NextResponse.json(
        { error: '필요 동의 수를 입력해주세요.' },
        { status: 400 }
      );
    }

    const thresholdNum = parseInt(String(threshold), 10);
    if (isNaN(thresholdNum) || thresholdNum < 1) {
      return NextResponse.json(
        { error: '필요 동의 수는 1 이상의 숫자여야 합니다.' },
        { status: 400 }
      );
    }

    const adminUserId = (session.user as any).id;

    const setting = await prisma.setting.upsert({
      where: { key: 'threshold' },
      update: {
        value: String(thresholdNum),
        updatedById: adminUserId,
      },
      create: {
        key: 'threshold',
        value: String(thresholdNum),
        description: '청원 동의를 위한 기본 임계값',
        updatedById: adminUserId,
      },
    });

    return NextResponse.json({
      success: true,
      threshold: parseInt(setting.value, 10),
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: '설정 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
