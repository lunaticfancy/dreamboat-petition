'use client';

import { useState } from 'react';
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

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '회원가입 중 오류가 발생했습니다.');
        return;
      }

      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>어린이집 소통 창구 계정을 만드세요</CardDescription>
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
                이름 (선택)
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름 (선택)"
              />
            </div>

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
                minLength={6}
                placeholder="비밀번호 (6자 이상)"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '회원가입 중...' : '회원가입'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/auth/login"
                className="text-primary hover:underline font-medium"
              >
                로그인
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
