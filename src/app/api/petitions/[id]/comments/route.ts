import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const isStaff =
      userRole && ['ADMIN', 'DIRECTOR', 'TEACHER'].includes(userRole);

    const comments = await prisma.comment.findMany({
      where: {
        petitionId: id,
        ...(isStaff ? {} : { isHidden: false }),
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        userId: true,
        petitionId: true,
        parentId: true,
        isHidden: true,
        createdAt: true,
        updatedAt: true,
        ipAddress: true,
        user: {
          select: { name: true, role: true },
        },
      },
    });

    const staffRoles = ['TEACHER', 'DIRECTOR', 'ADMIN'];

    // Mask IP address to show only first 2 octets and last octet (e.g., "192.168.***.1")
    const maskIpAddress = (ip: string | null): string => {
      if (!ip || ip === 'unknown') return '익명';
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.***.${parts[3]}`;
      }
      if (ip.includes(':')) {
        const ipv6Parts = ip.split(':').filter(Boolean);
        if (ipv6Parts.length >= 4) {
          return `${ipv6Parts[0]}:${ipv6Parts[1]}:***:${ipv6Parts[ipv6Parts.length - 1]}`;
        }
        if (ipv6Parts.length >= 2) {
          return `${ipv6Parts[0]}:***:${ipv6Parts[ipv6Parts.length - 1]}`;
        }
        if (ip === '::1') return 'localhost';
        if (ip === '::') return 'IPv6';
      }
      return '익명';
    };

    const commentsWithStaff = comments.map((comment: any) => {
      const isCommentStaff = staffRoles.includes(comment.user.role);

      return {
        ...comment,
        anonymousId: comment.ipAddress
          ? maskIpAddress(comment.ipAddress)
          : '익명',
        isStaff: isCommentStaff,
        staffRole: isCommentStaff ? comment.user.role : null,
        user: {
          name: isCommentStaff ? comment.user.name : null,
          role: comment.user.role,
        },
      };
    });

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get IP address from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        petitionId: id,
        parentId: parentId || null,
        ipAddress,
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: '댓글 생성 중 오류가 발생했습니다.', details: String(error) },
      { status: 500 }
    );
  }
}
