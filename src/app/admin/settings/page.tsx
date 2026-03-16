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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [threshold, setThreshold] = useState<string>('10');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (
      status === 'authenticated' &&
      (session?.user as any)?.role !== 'ADMIN'
    ) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (
      status === 'authenticated' &&
      (session?.user as any)?.role === 'ADMIN'
    ) {
      fetchSettings();
    }
  }, [status, session]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch settings');
      }
      const data = await res.json();
      setThreshold(String(data.threshold));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: parseInt(threshold, 10) }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update settings');
      }

      const data = await res.json();
      setThreshold(String(data.threshold));
      setSuccess('설정이 저장되었습니다.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">설정 관리</h1>
        <p className="text-muted-foreground">시스템 설정을 관리하세요</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>청원 설정</CardTitle>
          <CardDescription>청원 관련 기본 설정을 관리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="threshold"
                className="mb-1 block text-sm font-medium"
              >
                필요 동의 수
              </label>
              <Input
                id="threshold"
                type="number"
                min="1"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="10"
              />
              <p className="text-sm text-muted-foreground">
                이 값 이상 동의를 받으면 청원이 답변 대기 상태로 전환됩니다.
                기본값은 10명입니다.
              </p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
