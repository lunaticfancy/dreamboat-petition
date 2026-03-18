import { prisma } from '@/lib/db';
import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

let vapidConfigured = false;

function initVapid(): boolean {
  if (vapidConfigured) {
    return true;
  }

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error(
      'VAPID keys not configured. Set NEXT_PUBLIC_VAPID_KEY and VAPID_PRIVATE_KEY'
    );
    return false;
  }

  try {
    webpush.setVapidDetails(
      `mailto:${process.env.SENDGRID_FROM_EMAIL || 'noreply@puruni.com'}`,
      vapidPublicKey,
      vapidPrivateKey
    );
    vapidConfigured = true;
    console.log('VAPID configured successfully');
    return true;
  } catch (error) {
    console.error('Failed to configure VAPID:', error);
    return false;
  }
}

initVapid();

export function isVapidConfigured(): boolean {
  return vapidConfigured;
}

export function getNotificationStatus(): {
  vapidConfigured: boolean;
  vapidPublicKeySet: boolean;
  vapidPrivateKeySet: boolean;
} {
  return {
    vapidConfigured,
    vapidPublicKeySet: !!vapidPublicKey,
    vapidPrivateKeySet: !!vapidPrivateKey,
  };
}

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
): Promise<{ sent: number; failed: number; reason?: string }> {
  if (!vapidConfigured) {
    console.error('sendNotificationByType: VAPID not configured');
    return { sent: 0, failed: 0, reason: 'VAPID_NOT_CONFIGURED' };
  }

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

    console.log(
      `sendNotificationByType: Found ${subscriptions.length} total subscriptions`
    );

    if (subscriptions.length === 0) {
      console.warn(
        'sendNotificationByType: No push subscriptions found in database'
      );
      return { sent: 0, failed: 0, reason: 'NO_SUBSCRIPTIONS' };
    }

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
      } catch (error: any) {
        console.error('Failed to send push notification:', {
          endpoint: sub.endpoint.substring(0, 50) + '...',
          error: error?.message || error,
          statusCode: error?.statusCode,
        });
        failed++;
      }
    }

    console.log(
      `sendNotificationByType: Result - sent: ${sent}, failed: ${failed}`
    );
    return { sent, failed };
  } catch (error) {
    console.error('Error in sendNotificationByType:', error);
    return { sent: 0, failed: 0, reason: 'DATABASE_ERROR' };
  }
}

export async function notifyNewPetition(
  petitionTitle: string,
  petitionId: string
) {
  return sendNotificationByType('notifyNewPetition', {
    title: '소통함에 새로운 글이 등록되었습니다',
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
