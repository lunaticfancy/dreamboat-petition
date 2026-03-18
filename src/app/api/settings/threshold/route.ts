import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DEFAULT_THRESHOLD = 10;

export async function GET() {
  try {
    let thresholdSetting = await prisma.setting.findUnique({
      where: { key: 'threshold' },
    });

    if (!thresholdSetting) {
      thresholdSetting = await prisma.setting.create({
        data: {
          key: 'threshold',
          value: String(DEFAULT_THRESHOLD),
          description: '소통함 답변을 위한 필요 동의 수',
        },
      });
    }

    return NextResponse.json({
      threshold: parseInt(thresholdSetting.value, 10),
    });
  } catch (error) {
    console.error('Get threshold error:', error);
    return NextResponse.json({ threshold: DEFAULT_THRESHOLD });
  }
}
