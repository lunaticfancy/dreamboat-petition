import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
];

// Maximum file size: 10MB in bytes
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 선택되지 않았습니다.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            '지원하지 않는 파일 형식입니다. 이미지(JPG, PNG, GIF, WebP, SVG) 또는 PDF 파일만 업로드 가능합니다.',
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || '';
    const filename = `${timestamp}-${randomString}.${extension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
