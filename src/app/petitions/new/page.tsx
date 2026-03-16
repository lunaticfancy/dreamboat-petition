'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewPetitionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    const userRole = (session.user as any)?.role;
    if (
      userRole === 'TEACHER' ||
      userRole === 'DIRECTOR' ||
      userRole === 'ADMIN'
    ) {
      router.push('/petitions');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/petitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '청원 생성 중 오류가 발생했습니다.');
        return;
      }

      router.push(`/petitions/${data.petition.id}`);
    } catch {
      setError('청원 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
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
          <h1 className="text-3xl font-bold">청원 작성</h1>
          <p className="text-muted-foreground mt-1">
            만들고 싶은 변화를 제시해보세요
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>새 청원</CardTitle>
            <CardDescription>
              내용을 작성하시면 다른 학부모들도 볼 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  제목
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="청원 제목을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  상세 내용
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={10}
                  className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="청원 내용을 자세히 작성해주세요"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? '작성 중...' : '청원 제출'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
