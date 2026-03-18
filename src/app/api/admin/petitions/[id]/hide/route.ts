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
      !['ADMIN', 'DIRECTOR', 'TEACHER'].includes((session.user as any).role)
    ) {
      return NextResponse.json(
        { error: '관리자, 원장 또는 선생님만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const petition = await prisma.petition.findUnique({
      where: { id },
    });

    if (!petition) {
      return NextResponse.json(
        { error: '소통함을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updatedPetition = await prisma.petition.update({
      where: { id },
      data: { isHidden: true },
    });

    return NextResponse.json({
      success: true,
      petition: updatedPetition,
    });
  } catch (error) {
    console.error('Hide petition error:', error);
    return NextResponse.json(
      { error: '소통함 숨기기 중 오류가 발생했습니다.' },
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
      !['ADMIN', 'DIRECTOR', 'TEACHER'].includes((session.user as any).role)
    ) {
      return NextResponse.json(
        { error: '관리자, 원장 또는 선생님만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const petition = await prisma.petition.findUnique({
      where: { id },
    });

    if (!petition) {
      return NextResponse.json(
        { error: '소통함을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updatedPetition = await prisma.petition.update({
      where: { id },
      data: { isHidden: false },
    });

    return NextResponse.json({
      success: true,
      petition: updatedPetition,
    });
  } catch (error) {
    console.error('Unhide petition error:', error);
    return NextResponse.json(
      { error: '소통함 보이기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
