import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !['ADMIN', 'DIRECTOR', 'TEACHER'].includes((session.user as any).role)
    ) {
      return NextResponse.json(
        { error: '관리자, 원장, 선생님만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'ALL') {
      if (status === 'HIDDEN') {
        where.isHidden = true;
      } else {
        where.status = status;
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const petitions = await prisma.petition.findMany({
      where,
      include: {
        _count: {
          select: { agreements: true, comments: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ petitions });
  } catch (error) {
    console.error('Get petitions error:', error);
    return NextResponse.json(
      { error: '소통함 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
