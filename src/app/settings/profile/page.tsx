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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export default function ProfileSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (res.ok && data.user) {
          setProfile(data.user);
          setName(data.user.name || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchProfile();
    }
  }, [session]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('프로필이 업데이트되었습니다.');
        if (profile) {
          setProfile({ ...profile, name: name.trim() });
        }
      } else {
        alert(data.error || '프로필 업데이트 중 오류가 발생했습니다.');
      }
    } catch {
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'PARENT':
        return '학부모';
      case 'TEACHER':
        return '선생님';
      case 'DIRECTOR':
        return '원장';
      case 'ADMIN':
        return '관리자';
      default:
        return role;
    }
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
          <h1 className="text-3xl font-bold">프로필 설정</h1>
          <p className="text-muted-foreground mt-1">계정 정보를 관리합니다</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>프로필에 표시될 이름을 설정합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                이메일은 변경할 수 없습니다
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요"
                maxLength={50}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? '저장 중...' : '저장'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>계정 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">역할</span>
              <span className="font-medium">
                {getRoleName(profile?.role || '')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">인증 상태</span>
              <span
                className={`font-medium ${profile?.isVerified ? 'text-green-600' : 'text-orange-600'}`}
              >
                {profile?.isVerified ? '인증됨' : '미인증'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">가입일</span>
              <span className="font-medium">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('ko-KR')
                  : '-'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
