import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (id === (session.user as any).id) {
      return NextResponse.json(
        { error: '자신의 계정은 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '사용자가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: '사용자 삭제 중 오류가 발생했습니다.' },
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

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { role, name } = await req.json();

    const ALLOWED_ROLES = ['PARENT', 'TEACHER', 'DIRECTOR', 'ADMIN'];

    if (role && !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: '유효하지 않은 역할입니다.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (name !== undefined) updateData.name = name;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: '사용자 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
