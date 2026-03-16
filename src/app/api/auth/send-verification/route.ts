import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { emailService } from '@/lib/email';

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '해당 이메일로 등록된 계정이 없습니다.' },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: '이미 인증된 계정입니다.' },
        { status: 400 }
      );
    }

    await prisma.verificationCode.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationCode.create({
      data: {
        code,
        userId: user.id,
        expiresAt,
      },
    });

    const result = await emailService.sendVerificationEmail(email, code, 10);

    if (!result.success) {
      console.error('Email send failed:', result.error);
      return NextResponse.json(
        { error: '인증 코드 발송 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '인증 코드가 발송되었습니다.',
      ...(process.env.NODE_ENV !== 'production' && { code }),
    });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: '인증 코드 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
