import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "이메일과 인증 코드를 입력해주세요." },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "해당 이메일로 등록된 계정이 없습니다." },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "이미 인증된 계정입니다." },
        { status: 400 }
      );
    }

    // Find valid verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        code,
        userId: user.id,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: "유효하지 않거나 만료된 인증 코드입니다." },
        { status: 400 }
      );
    }

    // Mark code as used and verify user
    await prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: {
          used: true,
          usedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "이메일 인증이 완료되었습니다.",
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "인증 코드 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}