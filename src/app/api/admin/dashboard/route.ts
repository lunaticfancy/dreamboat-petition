import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
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

    const totalPetitions = await prisma.petition.count();

    const pendingPetitions = await prisma.petition.count({
      where: { status: 'OPEN' },
    });

    const answeredPetitions = await prisma.petition.count({
      where: { status: 'ANSWERED' },
    });

    const totalUsers = await prisma.user.count();

    const parentCount = await prisma.user.count({
      where: { role: 'PARENT' },
    });

    const teacherCount = await prisma.user.count({
      where: { role: 'TEACHER' },
    });

    const directorCount = await prisma.user.count({
      where: { role: 'DIRECTOR' },
    });

    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    const pendingReports = await prisma.report.count({
      where: { status: 'PENDING' },
    });

    const recentPetitions = await prisma.petition.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        agreedCount: true,
      },
    });

    const recentReports = await prisma.report.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        petitionId: true,
        commentId: true,
      },
    });

    return NextResponse.json({
      stats: {
        totalPetitions,
        pendingPetitions,
        answeredPetitions,
        totalUsers,
        parentCount,
        teacherCount,
        directorCount,
        adminCount,
        pendingReports,
      },
      recentPetitions,
      recentReports,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: '대시보드 통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
