import webpush from 'web-push';

// VAPID keys - should be generated once and stored in environment variables
// Run: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@puruni.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

/**
 * Send push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
  },
  payload: PushPayload
): Promise<void> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured, skipping push notification');
    return;
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );
  } catch (error) {
    // If subscription is expired, it will throw an error
    // In production, you might want to delete expired subscriptions
    console.error('Push notification error:', error);
    throw error;
  }
}

/**
 * Send push notification to multiple subscriptions
 */
export async function sendPushToSubscriptions(
  subscriptions: Array<{
    endpoint: string;
    p256dh: string;
    auth: string;
  }>,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await sendPushNotification(subscription, payload);
        sent++;
      } catch {
        failed++;
      }
    })
  );

  return { sent, failed };
}

/**
 * Get VAPID public key for client
 */
export function getVapidPublicKey(): string {
  return vapidPublicKey;
}
