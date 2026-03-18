'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSendCode = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    setError('');
    setSendingCode(true);

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '인증 코드 발송 중 오류가 발생했습니다.');
        return;
      }

      setSuccess('인증 메일을 보냈습니다.');

      if (data.code) {
        setSuccess(`인증 코드: ${data.code} (개발 모드에서만 표시)`);
      }
    } catch {
      setError('인증 코드 발송 중 오류가 발생했습니다.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '인증 코드 확인 중 오류가 발생했습니다.');
        setLoading(false);
        return;
      }

      setSuccess('이메일 인증이 완료되었습니다!');
      setVerified(true);

      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch {
      setError('인증 코드 확인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">이메일 인증</h1>
          <p className="text-slate-600 mt-2">
            회원가입 시 사용한 이메일로 인증 코드를 받으세요
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 20 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="text-green-600 text-lg font-semibold mb-1">
                  ✓ {success}
                </div>
                {verified && (
                  <div className="text-green-500 text-sm">
                    잠시 후 로그인 페이지로 이동합니다...
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                이메일
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="email@example.com"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode || !email}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200:bg-slate-600 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {sendingCode ? '발송 중...' : '코드 받기'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                인증 코드
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                required
                maxLength={6}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code || code.length !== 6}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? '인증 중...' : '인증하기'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">
              이미 인증하셨나요?{' '}
              <a
                href="/auth/login"
                className="text-primary hover:underline font-medium"
              >
                로그인
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-light">
          <div className="text-slate-600">로딩 중...</div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
