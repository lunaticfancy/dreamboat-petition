'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ReportButtonProps {
  petitionId?: string;
  commentId?: string;
  answerId?: string;
}

export function ReportButton({ petitionId, commentId }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petitionId, commentId, reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '신고 중 오류가 발생했습니다.');
        return;
      }

      setSuccess(true);
      setReason('');
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 1500);
    } catch {
      setError('신고 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="xs"
        onClick={() => setIsOpen(true)}
        className="text-slate-500 hover:text-red-600"
      >
        신고
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              신고하기
            </h3>

            {success ? (
              <div className="text-primary text-center py-4">
                신고가 접수되었습니다.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    신고 사유
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="신고 사유를 입력해주세요"
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                  >
                    취소
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? '신고 중...' : '신고하기'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
