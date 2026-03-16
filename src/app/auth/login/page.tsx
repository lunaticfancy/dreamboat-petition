'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>어린이집 소통 창구에 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                이메일
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                비밀번호
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호 (6자 이상)"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              계정이 없으신가요?{' '}
              <Link
                href="/auth/signup"
                className="text-primary hover:underline font-medium"
              >
                회원가입
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
