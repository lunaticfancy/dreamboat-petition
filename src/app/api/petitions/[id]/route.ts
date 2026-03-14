import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: "file:prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const petition = await prisma.petition.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { agreements: true, comments: true },
        },
      },
    });

    if (!petition) {
      return NextResponse.json(
        { error: "청원을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ petition });
  } catch (error) {
    console.error("Get petition error:", error);
    return NextResponse.json(
      { error: "청원 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
