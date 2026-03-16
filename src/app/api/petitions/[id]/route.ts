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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const petition = await prisma.petition.findUnique({
      where: { id },
      include: {
        _count: {
          select: { agreements: true, comments: true, reports: true },
        },
      },
    });

    if (!petition) {
      return NextResponse.json(
        { error: '청원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const userRole = (session?.user as any)?.role;
    const canSeeHidden = ['ADMIN', 'DIRECTOR', 'TEACHER'].includes(userRole);

    if (petition.isHidden && !canSeeHidden) {
      return NextResponse.json(
        { error: '이 청원은 숨겨져 있습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ petition });
  } catch (error) {
    console.error('Get petition error:', error);
    return NextResponse.json(
      { error: '청원 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const petition = await prisma.petition.findUnique({
      where: { id },
    });

    if (!petition) {
      return NextResponse.json(
        { error: '청원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (petition.authorId !== session.user.id) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const updatedPetition = await prisma.petition.update({
      where: { id },
      data: { title, content },
    });

    return NextResponse.json({ petition: updatedPetition });
  } catch (error) {
    console.error('Update petition error:', error);
    return NextResponse.json(
      { error: '청원 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
