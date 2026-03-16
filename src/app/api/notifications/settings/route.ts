import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        notifyNewPetition: true,
        notifyNewReport: true,
        notifyThresholdReached: true,
      },
    });

    return NextResponse.json({ settings: user });
  } catch (error) {
    console.error('Get notification settings error:', error);
    return NextResponse.json(
      { error: '설정 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { notifyNewPetition, notifyNewReport, notifyThresholdReached } =
      await req.json();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notifyNewPetition: notifyNewPetition ?? true,
        notifyNewReport: notifyNewReport ?? true,
        notifyThresholdReached: notifyThresholdReached ?? true,
      },
      select: {
        notifyNewPetition: true,
        notifyNewReport: true,
        notifyThresholdReached: true,
      },
    });

    return NextResponse.json({ settings: user });
  } catch (error) {
    console.error('Update notification settings error:', error);
    return NextResponse.json(
      { error: '설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
