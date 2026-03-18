import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notifyNewPetition } from '@/lib/notification';

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

    try {
      const result = await notifyNewPetition(title, petition.id);
      console.log('New petition notification result:', result);
      if (result.reason) {
        console.warn('Notification not sent:', result.reason);
      }
    } catch (error) {
      console.error('Failed to send new petition notification:', error);
    }

    return NextResponse.json({ petition });
  } catch (error) {
    console.error('Create petition error:', error);
    return NextResponse.json(
      { error: '소통함 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const userRole = (session?.user as any)?.role;
    const canSeeHidden = ['ADMIN', 'DIRECTOR', 'TEACHER'].includes(userRole);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (!canSeeHidden) {
      where.isHidden = false;
    }

    const [petitions, total] = await Promise.all([
      prisma.petition.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { agreements: true, comments: true, reports: true },
          },
        },
      }),
      prisma.petition.count({ where }),
    ]);

    return NextResponse.json({
      petitions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + petitions.length < total,
      },
    });
  } catch (error) {
    console.error('Get petitions error:', error);
    return NextResponse.json(
      { error: '소통함 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
