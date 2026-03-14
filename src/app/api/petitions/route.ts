import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: "file:prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const petition = await prisma.petition.create({
      data: {
        title,
        content,
        status: "OPEN",
      },
    });

    return NextResponse.json({ petition });
  } catch (error) {
    console.error("Create petition error:", error);
    return NextResponse.json(
      { error: "청원 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where = status ? { status } : {};

    const petitions = await prisma.petition.findMany({
      where,
      orderBy: { agreedCount: "desc" },
      include: {
        _count: {
          select: { agreements: true, comments: true },
        },
      },
    });

    return NextResponse.json({ petitions });
  } catch (error) {
    console.error("Get petitions error:", error);
    return NextResponse.json(
      { error: "청원 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
