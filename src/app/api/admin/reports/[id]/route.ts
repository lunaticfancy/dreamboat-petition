import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !['ADMIN', 'DIRECTOR'].includes((session.user as any).role)
    ) {
      return NextResponse.json(
        { error: '관리자 또는 원장만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!['PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED'].includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태입니다.' },
        { status: 400 }
      );
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: '신고 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
