import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (
      !user ||
      (user.role !== 'TEACHER' &&
        user.role !== 'DIRECTOR' &&
        user.role !== 'ADMIN')
    ) {
      return NextResponse.json(
        { error: '답변 권한이 없습니다.' },
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

    const petition = await prisma.petition.findUnique({
      where: { id: params.id },
    });

    if (!petition) {
      return NextResponse.json(
        { error: '청원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const answer = await prisma.answer.create({
      data: {
        content,
        authorId: session.user.id,
        petitionId: params.id,
      },
      include: {
        author: {
          select: { name: true, role: true },
        },
      },
    });

    await prisma.petition.update({
      where: { id: params.id },
      data: {
        status: 'ANSWERED',
        answeredAt: new Date(),
      },
    });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Create answer error:', error);
    return NextResponse.json(
      { error: '답변 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const answers = await prisma.answer.findMany({
      where: { petitionId: params.id },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { name: true, role: true },
        },
        editHistory: {
          orderBy: { editedAt: 'asc' },
        },
      },
    });

    return NextResponse.json({ answers });
  } catch (error) {
    console.error('Get answers error:', error);
    return NextResponse.json(
      { error: '답변 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
