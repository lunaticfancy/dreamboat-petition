'use client';

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { StatusBadge } from '@/components/status-badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PetitionStatus } from '@/types';

interface Petition {
  id: string;
  title: string;
  content: string;
  status: string;
  anonymousId: string;
  agreedCount: number;
  isHidden: boolean;
  createdAt: string;
  _count?: {
    agreements: number;
    comments: number;
    reports: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const statusTabs: { value: string; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'OPEN', label: '진행 중' },
  { value: 'PENDING_ANSWER', label: '답변 대기' },
  { value: 'ANSWERED', label: '답변 완료' },
];

const ITEMS_PER_PAGE = 10;

function PetitionsListPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [activeStatus, setActiveStatus] = useState(
    searchParams.get('status') || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  const userRole = (session?.user as any)?.role;
  const canSeeHidden = ['ADMIN', 'DIRECTOR', 'TEACHER'].includes(userRole);

  const fetchPetitions = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', ITEMS_PER_PAGE.toString());
        if (activeStatus) {
          params.set('status', activeStatus);
        }

        const res = await fetch(`/api/petitions?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || '소통함 목록을 불러오는데 실패했습니다.');
          return;
        }

        if (append) {
          setPetitions((prev) => [...prev, ...(data.petitions || [])]);
        } else {
          setPetitions(data.petitions || []);
        }
        setPagination(data.pagination);
      } catch {
        setError('소통함 목록 조회 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeStatus]
  );

  useEffect(() => {
    fetchPetitions(1, false);
  }, [fetchPetitions]);

  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchPetitions(pagination.page + 1, true);
    }
  };

  const filteredPetitions = useMemo(() => {
    if (!searchQuery.trim()) return petitions;

    const query = searchQuery.toLowerCase();
    return petitions.filter(
      (petition) =>
        petition.title.toLowerCase().includes(query) ||
        petition.content.toLowerCase().includes(query)
    );
  }, [petitions, searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/5 to-transparent border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            소통함 목록
          </h1>
          <p className="text-muted-foreground">
            학부모와 어린이집 관계자 간 소통을 위한 소통함 목록입니다.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <Input
              type="text"
              placeholder="소통함 제목 또는 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeStatus === tab.value
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          총 {formatNumber(pagination.total)}개의 소통함
          {petitions.length > 0 && (
            <span className="ml-2">
              ({petitions.length}/{pagination.total}개 표시)
            </span>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && filteredPetitions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-muted-foreground">
              {searchQuery ? '검색 결과가 없습니다.' : '등록된 글이 없습니다.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredPetitions.length > 0 && (
          <div className="space-y-4">
            {filteredPetitions.map((petition) => (
              <Link
                key={petition.id}
                href={`/petitions/${petition.id}`}
                className="block"
              >
                <Card className="p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge
                          status={petition.status as PetitionStatus}
                        />
                        {canSeeHidden && petition.isHidden && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            숨겨짐
                          </span>
                        )}
                        {(petition as any)._count?.reports > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            🚨 신고 {(petition as any)._count.reports}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(petition.createdAt)}
                        </span>
                      </div>

                      <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {petition.title}
                      </h2>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {petition.content}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 pt-2 sm:pt-0">
                      <div className="flex items-center gap-1.5 text-primary">
                        <svg
                          className="w-5 h-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M7 10v12" />
                          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.55l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3Z" />
                        </svg>
                        <span className="text-lg font-bold">
                          {formatNumber(petition.agreedCount)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        명 동의
                      </span>
                      <div className="flex items-center gap-1.5 text-muted-foreground ml-2">
                        <svg
                          className="w-4 h-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                        </svg>
                        <span className="text-sm font-medium">
                          {petition._count?.comments || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}

            {pagination.hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  className="min-w-[200px]"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      로딩 중...
                    </span>
                  ) : (
                    `더 보기 (${pagination.page}/${pagination.totalPages})`
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PetitionsListLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}

export default function PetitionsListPageWithSuspense() {
  return (
    <Suspense fallback={<PetitionsListLoading />}>
      <PetitionsListPage />
    </Suspense>
  );
}
