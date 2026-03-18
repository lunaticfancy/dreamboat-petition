'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface NotificationSettings {
  notifyNewPetition: boolean;
  notifyNewReport: boolean;
  notifyThresholdReached: boolean;
}

export default function NotificationSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>({
    notifyNewPetition: true,
    notifyNewReport: true,
    notifyThresholdReached: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    async function fetchSettings() {
      try {
        const res = await fetch('/api/notifications/settings');
        const data = await res.json();
        if (res.ok && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchSettings();
    }
  }, [session]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert('설정이 저장되었습니다.');
      } else {
        const data = await res.json();
        alert(data.error || '설정 저장 중 오류가 발생했습니다.');
      }
    } catch {
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('이 브라우저는 웹 알림을 지원하지 않습니다.');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 flex items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">알림 설정</h1>
          <p className="text-muted-foreground mt-1">
            웹 브라우저 알림을 설정합니다
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>브라우저 알림</CardTitle>
            <CardDescription>
              웹 브라우저를 통한 알림을 받으려면 먼저 알림 권한을 허용해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">알림 권한</p>
                <p className="text-sm text-muted-foreground">
                  현재 상태:{' '}
                  {notificationPermission === 'granted'
                    ? '허용됨'
                    : notificationPermission === 'denied'
                      ? '차단됨'
                      : '미설정'}
                </p>
              </div>
              {notificationPermission !== 'granted' && (
                <Button
                  onClick={requestNotificationPermission}
                  variant="outline"
                >
                  알림 허용하기
                </Button>
              )}
              {notificationPermission === 'granted' && (
                <span className="text-green-600 text-sm">✓ 허용됨</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>알림 항목</CardTitle>
            <CardDescription>받고 싶은 알림을 선택해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifyNewPetition" className="font-medium">
                  새로운 소통함 알림
                </Label>
                <p className="text-sm text-muted-foreground">
                  새로운 소통함이 등록되면 알림을 받습니다
                </p>
              </div>
              <Checkbox
                id="notifyNewPetition"
                checked={settings.notifyNewPetition}
                onCheckedChange={() => handleToggle('notifyNewPetition')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifyNewReport" className="font-medium">
                  신고 알림
                </Label>
                <p className="text-sm text-muted-foreground">
                  소통함이 신고되면 알림을 받습니다
                </p>
              </div>
              <Checkbox
                id="notifyNewReport"
                checked={settings.notifyNewReport}
                onCheckedChange={() => handleToggle('notifyNewReport')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifyThresholdReached" className="font-medium">
                  목표 달성 알림
                </Label>
                <p className="text-sm text-muted-foreground">
                  소통함이 목표 동의를 달성하면 알림을 받습니다
                </p>
              </div>
              <Checkbox
                id="notifyThresholdReached"
                checked={settings.notifyThresholdReached}
                onCheckedChange={() => handleToggle('notifyThresholdReached')}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? '저장 중...' : '설정 저장'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
