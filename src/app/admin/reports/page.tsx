'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Report {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  petitionId: string | null;
  commentId: string | null;
  petition?: {
    id: string;
    title: string;
    isHidden: boolean;
  } | null;
  comment?: {
    id: string;
    content: string;
    petitionId: string;
    isHidden: boolean;
  } | null;
}

const statusFilters: { value: string; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '대기' },
  { value: 'REVIEWED', label: '검토 중' },
  { value: 'ACTIONED', label: '처리됨' },
  { value: 'DISMISSED', label: '기각' },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: '대기', color: 'bg-orange-100 text-orange-700' },
  REVIEWED: { label: '검토 중', color: 'bg-blue-100 text-blue-700' },
  ACTIONED: { label: '처리됨', color: 'bg-green-100 text-green-700' },
  DISMISSED: { label: '기각', color: 'bg-gray-100 text-gray-700' },
};

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [hidingPetitionId, setHidingPetitionId] = useState<string | null>(null);
  const [hidingCommentId, setHidingCommentId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeStatus !== 'ALL') {
        params.append('status', activeStatus);
      }

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch reports');
      }
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (
      status === 'authenticated' &&
      !['ADMIN', 'DIRECTOR', 'TEACHER'].includes((session?.user as any)?.role)
    ) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (
      status === 'authenticated' &&
      ['ADMIN', 'DIRECTOR', 'TEACHER'].includes((session?.user as any)?.role)
    ) {
      fetchReports();
    }
  }, [status, session, fetchReports]);

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update report');
      }

      fetchReports();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleHidePetition = async (
    petitionId: string,
    currentlyHidden: boolean
  ) => {
    setHidingPetitionId(petitionId);
    try {
      const res = await fetch(`/api/admin/petitions/${petitionId}/hide`, {
        method: currentlyHidden ? 'DELETE' : 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '실패');
      }

      fetchReports();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setHidingPetitionId(null);
    }
  };

  const handleHideComment = async (
    commentId: string,
    currentlyHidden: boolean
  ) => {
    setHidingCommentId(commentId);
    try {
      const res = await fetch(`/api/admin/comments/${commentId}/hide`, {
        method: currentlyHidden ? 'DELETE' : 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '실패');
      }

      fetchReports();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setHidingCommentId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (
    status === 'authenticated' &&
    !['ADMIN', 'DIRECTOR', 'TEACHER'].includes((session?.user as any)?.role)
  ) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          대시보드로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold">신고 관리</h1>
        <p className="text-muted-foreground">
          사용자가 신고한 부적절한 콘텐츠를 검토하고 처리합니다.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">상태 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveStatus(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeStatus === filter.value
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 text-sm text-muted-foreground">
        총 {reports.length}건의 신고
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground/50"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" x2="4" y1="22" y2="15" />
              </svg>
              <p className="text-muted-foreground">신고가 없습니다.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const statusInfo = statusLabels[report.status] || {
              label: report.status,
              color: 'bg-gray-100 text-gray-700',
            };

            return (
              <Card key={report.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded ${
                              statusInfo.color
                            }`}
                          >
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            신고 사유
                          </p>
                          <p className="text-foreground">{report.reason}</p>
                        </div>

                        {report.petition && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-muted-foreground">
                                신고된 소통함
                              </p>
                              {report.petition.isHidden && (
                                <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 30">
                                  숨겨짐
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/petitions/${report.petition.id}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {report.petition.title}
                            </Link>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleHidePetition(
                                    report.petition!.id,
                                    report.petition!.isHidden
                                  )
                                }
                                disabled={
                                  hidingPetitionId === report.petition.id
                                }
                              >
                                {hidingPetitionId === report.petition.id
                                  ? '처리 중...'
                                  : report.petition.isHidden
                                    ? '소통함에서 보이기'
                                    : '소통함에서 숨기기'}
                              </Button>
                            </div>
                          </div>
                        )}

                        {report.comment && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-muted-foreground">
                                신고된 댓글
                              </p>
                              {report.comment.isHidden && (
                                <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700 30">
                                  숨겨짐
                                </span>
                              )}
                            </div>
                            <p className="text-sm">
                              {truncateContent(report.comment.content)}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleHideComment(
                                    report.comment!.id,
                                    report.comment!.isHidden
                                  )
                                }
                                disabled={hidingCommentId === report.comment.id}
                              >
                                {hidingCommentId === report.comment.id
                                  ? '처리 중...'
                                  : report.comment.isHidden
                                    ? '댓글 보이기'
                                    : '댓글 숨기기'}
                              </Button>
                              <Link
                                href={`/petitions/${report.comment.petitionId}`}
                                className="text-xs text-primary hover:underline mt-1 inline-block"
                              >
                                소통함에서 보기 →
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {report.status === 'PENDING' && (
                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(report.id, 'REVIEWED')
                          }
                        >
                          검토 중으로 변경
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(report.id, 'ACTIONED')
                          }
                        >
                          처리 완료
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleStatusChange(report.id, 'DISMISSED')
                          }
                        >
                          기각
                        </Button>
                      </div>
                    )}

                    {report.status === 'REVIEWED' && (
                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(report.id, 'ACTIONED')
                          }
                        >
                          처리 완료
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleStatusChange(report.id, 'DISMISSED')
                          }
                        >
                          기각
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
