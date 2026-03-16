import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: { petitionId: params.id },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { name: true, role: true },
        },
      },
    });

    const commentsWithStaff = comments.map((comment) => ({
      ...comment,
      isStaff:
        comment.user.role === 'TEACHER' || comment.user.role === 'DIRECTOR',
      staffRole:
        comment.user.role === 'TEACHER' || comment.user.role === 'DIRECTOR'
          ? comment.user.role
          : null,
    }));

    return NextResponse.json({ comments: commentsWithStaff });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: '댓글 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { content, parentId } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        petitionId: params.id,
        parentId: parentId || null,
        isStaff: user.role === 'TEACHER' || user.role === 'DIRECTOR',
        staffRole:
          user.role === 'TEACHER' || user.role === 'DIRECTOR'
            ? user.role
            : null,
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: '댓글 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
