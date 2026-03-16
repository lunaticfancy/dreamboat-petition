import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

export async function PUT(
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

    const answer = await prisma.answer.findUnique({
      where: { id: params.id },
    });

    if (!answer) {
      return NextResponse.json(
        { error: '답변을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (answer.authorId !== session.user.id) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: '답변 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    await prisma.answerEditHistory.create({
      data: {
        answerId: params.id,
        previousContent: answer.content,
      },
    });

    const updatedAnswer = await prisma.answer.update({
      where: { id: params.id },
      data: { content },
      include: {
        editHistory: {
          orderBy: { editedAt: 'asc' },
        },
      },
    });

    return NextResponse.json({ answer: updatedAnswer });
  } catch (error) {
    console.error('Update answer error:', error);
    return NextResponse.json(
      { error: '답변 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const answer = await prisma.answer.findUnique({
      where: { id: params.id },
      include: {
        editHistory: {
          orderBy: { editedAt: 'asc' },
        },
      },
    });

    if (!answer) {
      return NextResponse.json(
        { error: '답변을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Get answer error:', error);
    return NextResponse.json(
      { error: '답변 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
