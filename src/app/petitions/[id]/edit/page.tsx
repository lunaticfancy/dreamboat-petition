'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditPetitionPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchPetition() {
      try {
        const res = await fetch(`/api/petitions/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError('소통함을 찾을 수 없습니다.');
          return;
        }

        const petition = data.petition;

        const userId = (session?.user as any)?.id;
        const canEdit =
          petition.authorId === userId && petition.status === 'OPEN';

        if (!canEdit) {
          router.push(`/petitions/${params.id}`);
          return;
        }

        setTitle(petition.title);
        setContent(petition.content);
      } catch {
        setError('소통함 조회 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    if (session && params.id) {
      fetchPetition();
    }
  }, [session, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/petitions/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '소통함 수정 중 오류가 발생했습니다.');
        return;
      }

      router.push(`/petitions/${params.id}`);
    } catch {
      setError('소통함 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
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
          <h1 className="text-3xl font-bold">소통함 수정</h1>
          <p className="text-muted-foreground mt-1">소통함 내용을 수정하세요</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>소통함 수정</CardTitle>
            <CardDescription>
              수정 후 저장하시면 변경사항이 반영됩니다
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
                  placeholder="소통함 제목을 입력하세요"
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
                  placeholder="소통함 내용을 자세히 작성해주세요"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/petitions/${params.id}`)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? '저장 중...' : '저장'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
