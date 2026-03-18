import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !['ADMIN', 'DIRECTOR', 'TEACHER'].includes((session.user as any)?.role)
    ) {
      return NextResponse.json(
        { error: '관리자, 원장 또는 선생님만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { id: commentId } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { isHidden: true },
    });

    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error('Hide comment error:', error);
    return NextResponse.json(
      { error: '댓글 숨기기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !['ADMIN', 'DIRECTOR', 'TEACHER'].includes((session.user as any)?.role)
    ) {
      return NextResponse.json(
        { error: '관리자, 원장 또는 선생님만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { id: commentId } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { isHidden: false },
    });

    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error('Show comment error:', error);
    return NextResponse.json(
      { error: '댓글 보이기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
