import { prisma } from '@/lib/db';
import webpush from 'web-push';

interface NotificationType {
  notifyNewPetition: boolean;
  notifyNewReport: boolean;
  notifyThresholdReached: boolean;
}

export async function sendNotificationByType(
  type: keyof NotificationType,
  payload: {
    title: string;
    body: string;
    tag?: string;
  }
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      include: {
        user: {
          select: {
            notifyNewPetition: true,
            notifyNewReport: true,
            notifyThresholdReached: true,
          },
        },
      },
    });

    for (const sub of subscriptions) {
      const isEnabled =
        (type === 'notifyNewPetition' && sub.user?.notifyNewPetition) ||
        (type === 'notifyNewReport' && sub.user?.notifyNewReport) ||
        (type === 'notifyThresholdReached' && sub.user?.notifyThresholdReached);

      if (!isEnabled) {
        continue;
      }

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: payload.tag || 'default',
          })
        );
        sent++;
      } catch (error) {
        console.error('Failed to send push:', error);
        failed++;
      }
    }
  } catch (error) {
    console.error('Error in sendNotificationByType:', error);
  }

  return { sent, failed };
}

export async function notifyNewPetition(
  petitionTitle: string,
  petitionId: string
) {
  return sendNotificationByType('notifyNewPetition', {
    title: '새로운 소통함이 등록되었습니다',
    body: petitionTitle,
    tag: `petition-${petitionId}`,
  });
}

export async function notifyNewReport(petitionTitle: string, reportId: string) {
  return sendNotificationByType('notifyNewReport', {
    title: '새로운 신고가 접수되었습니다',
    body: petitionTitle || '소통함 신고',
    tag: `report-${reportId}`,
  });
}

export async function notifyThresholdReached(
  petitionTitle: string,
  petitionId: string
) {
  return sendNotificationByType('notifyThresholdReached', {
    title: '동의 목표 달성! 답변을 작성해주세요',
    body: petitionTitle,
    tag: `threshold-${petitionId}`,
  });
}
