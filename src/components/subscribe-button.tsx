'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface SubscribeButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SubscribeButton({
  variant = 'outline',
  size = 'sm',
}: SubscribeButtonProps) {
  const { data: session, status } = useSession();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const userRole = (session?.user as any)?.role;
  const canSubscribe = userRole === 'TEACHER' || userRole === 'DIRECTOR';

  useEffect(() => {
    if (
      canSubscribe &&
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, [canSubscribe]);

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('이 브라우저는 푸시 알림을 지원하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_KEY || ''
        ) as unknown as BufferSource,
      });

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('구독 실패');
      }

      setIsSubscribed(true);
    } catch (error) {
      console.error('구독 오류:', error);
      alert('푸시 알림 구독에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
    } catch (error) {
      console.error('구독 해지 오류:', error);
      alert('푸시 알림 구독 해지에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || !canSubscribe) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
      disabled={isLoading}
    >
      {isLoading
        ? '처리 중...'
        : isSubscribed
          ? '🔔 알림 해지'
          : '🔔 알림 받기'}
    </Button>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
