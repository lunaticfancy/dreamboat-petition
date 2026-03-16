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
        { error: '관리자, 원장 또는 선생님만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        petition: {
          select: {
            id: true,
            title: true,
            isHidden: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            petitionId: true,
          },
        },
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: '신고 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
