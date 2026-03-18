import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notifyNewReport } from '@/lib/notification';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { petitionId, commentId, reason } = await req.json();

    if (!reason) {
      return NextResponse.json(
        { error: '신고 사유를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!petitionId && !commentId) {
      return NextResponse.json(
        { error: '신고할 대상을 지정해주세요.' },
        { status: 400 }
      );
    }

    // Check if petition exists if provided
    if (petitionId) {
      const petition = await prisma.petition.findUnique({
        where: { id: petitionId },
      });

      if (!petition) {
        return NextResponse.json(
          { error: '소통함을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    // Check if comment exists if provided
    if (commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        return NextResponse.json(
          { error: '댓글을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        petitionId: petitionId || null,
        commentId: commentId || null,
        reporterId: session.user.id,
        reason,
        status: 'PENDING',
      },
    });

    let petitionTitle = null;
    if (petitionId) {
      const petition = await prisma.petition.findUnique({
        where: { id: petitionId },
        select: { title: true },
      });
      petitionTitle = petition?.title || null;
    } else if (commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { petition: { select: { title: true } } },
      });
      petitionTitle = comment?.petition.title || null;
    }

    notifyNewReport(petitionTitle || '신고가 접수되었습니다', report.id);

    return NextResponse.json({ report, message: '신고가 접수되었습니다.' });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: '신고 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
