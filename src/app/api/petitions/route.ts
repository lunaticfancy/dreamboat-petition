import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Get current threshold from settings
    const setting = await prisma.setting.findFirst({
      where: { key: 'threshold' },
    });
    const currentThreshold = setting ? parseInt(setting.value, 10) : 10;

    // Create petition and automatically add author as first agree-er
    const petition = await prisma.petition.create({
      data: {
        title,
        content,
        status: 'OPEN',
        threshold: currentThreshold,
        authorId: userId,
        agreedCount: 1,
        agreements: {
          create: {
            userId: userId,
            anonymousKey: `author_${Date.now()}`,
          },
        },
      },
    });

    return NextResponse.json({ petition });
  } catch (error) {
    console.error('Create petition error:', error);
    return NextResponse.json(
      { error: '청원 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const userRole = (session?.user as any)?.role;
    const canSeeHidden = ['ADMIN', 'DIRECTOR', 'TEACHER'].includes(userRole);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (!canSeeHidden) {
      where.isHidden = false;
    }

    const petitions = await prisma.petition.findMany({
      where,
      orderBy: { agreedCount: 'desc' },
      include: {
        _count: {
          select: { agreements: true, comments: true, reports: true },
        },
      },
    });

    return NextResponse.json({ petitions });
  } catch (error) {
    console.error('Get petitions error:', error);
    return NextResponse.json(
      { error: '청원 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
