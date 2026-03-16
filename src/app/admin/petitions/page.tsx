'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import type { PetitionStatus } from '@/types';

interface Petition {
  id: string;
  title: string;
  content: string;
  status: string;
  anonymousId: string;
  agreedCount: number;
  isHidden: boolean;
  mergedToId: string | null;
  createdAt: string;
  mergedAt: string | null;
  mergedTo?: {
    id: string;
    title: string;
  } | null;
  _count?: {
    agreements: number;
    comments: number;
  };
}

const statusFilters: { value: string; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'OPEN', label: '진행 중' },
  { value: 'ANSWERED', label: '답변 완료' },
  { value: 'CLOSED', label: '종료' },
  { value: 'MERGED', label: '병합됨' },
  { value: 'HIDDEN', label: '숨겨짐' },
];

export default function AdminPetitionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [sourcePetition, setSourcePetition] = useState<Petition | null>(null);
  const [targetPetitionId, setTargetPetitionId] = useState('');
  const [merging, setMerging] = useState(false);
  const [mergeError, setMergeError] = useState('');
  const [mergeSuccess, setMergeSuccess] = useState('');
  const [hidingId, setHidingId] = useState<string | null>(null);
  const [mergeSearchQuery, setMergeSearchQuery] = useState('');

  const fetchPetitions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeStatus !== 'ALL') {
        params.append('status', activeStatus);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const res = await fetch(`/api/admin/petitions?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch petitions');
      }
      const data = await res.json();
      setPetitions(data.petitions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeStatus, searchQuery]);

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
      fetchPetitions();
    }
  }, [status, session, fetchPetitions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPetitions();
  };

  const openMergeModal = (petition: Petition) => {
    setSourcePetition(petition);
    setTargetPetitionId('');
    setMergeError('');
    setMergeSuccess('');
    setMergeModalOpen(true);
  };

  const closeMergeModal = () => {
    setMergeModalOpen(false);
    setSourcePetition(null);
    setTargetPetitionId('');
    setMergeError('');
    setMergeSuccess('');
  };

  const handleMerge = async () => {
    if (!sourcePetition || !targetPetitionId) {
      setMergeError('대상 청원을 선택해주세요.');
      return;
    }

    if (sourcePetition.id === targetPetitionId) {
      setMergeError('동일한 청원으로 병합할 수 없습니다.');
      return;
    }

    setMerging(true);
    setMergeError('');
    setMergeSuccess('');

    try {
      const res = await fetch('/api/admin/petitions/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: sourcePetition.id,
          targetId: targetPetitionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '병합 실패');
      }

      setMergeSuccess('청원이 성공적으로 병합되었습니다.');
      fetchPetitions();
      setTimeout(() => {
        closeMergeModal();
      }, 1500);
    } catch (err: any) {
      setMergeError(err.message);
    } finally {
      setMerging(false);
    }
  };

  const handleToggleHide = async (
    petitionId: string,
    currentlyHidden: boolean
  ) => {
    setHidingId(petitionId);
    try {
      const res = await fetch(`/api/admin/petitions/${petitionId}/hide`, {
        method: currentlyHidden ? 'DELETE' : 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '실패');
      }

      fetchPetitions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setHidingId(null);
    }
  };

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
    <div className="container mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">청원 관리</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">상태</label>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveStatus(filter.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeStatus === filter.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="제목 또는 내용으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button type="submit">검색</Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      <div className="mb-4 text-sm text-muted-foreground">
        총 {formatNumber(petitions.length)}개의 청원
      </div>

      {petitions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">청원이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {petitions.map((petition) => (
            <Card
              key={petition.id}
              className={`p-5 ${petition.isHidden ? 'border-orange-300 dark:border-orange-700' : ''}`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={petition.status as PetitionStatus} />
                      {petition.isHidden && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          숨겨짐
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(petition.createdAt)}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">
                      {petition.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {petition.content}
                    </p>
                    {petition.status === 'MERGED' && petition.mergedTo && (
                      <p className="mt-2 text-sm text-purple-600">
                        병합됨: {petition.mergedTo.title}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
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
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant={petition.isHidden ? 'outline' : 'ghost'}
                    size="sm"
                    onClick={() =>
                      handleToggleHide(petition.id, petition.isHidden)
                    }
                    disabled={hidingId === petition.id}
                  >
                    {hidingId === petition.id
                      ? '처리 중...'
                      : petition.isHidden
                        ? '보이기'
                        : '숨기기'}
                  </Button>
                  {petition.status !== 'MERGED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMergeModal(petition)}
                    >
                      병합
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {mergeModalOpen && sourcePetition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle>청원 병합</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    원본 청원 (병합될 청원)
                  </label>
                  <p className="text-sm text-muted-foreground p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {sourcePetition.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    이 청원의 동의, 댓글, 답변이 대상 청원으로 이동합니다.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    대상 청원 (병합될 위치)
                  </label>
                  <Input
                    type="text"
                    placeholder="청원 제목으로 검색..."
                    value={mergeSearchQuery}
                    onChange={(e) => {
                      setMergeSearchQuery(e.target.value);
                      setTargetPetitionId('');
                    }}
                    className="mb-2"
                  />
                  <div className="max-h-48 overflow-y-auto border rounded-lg">
                    {petitions
                      .filter(
                        (p) =>
                          p.id !== sourcePetition.id &&
                          (mergeSearchQuery
                            ? p.title
                                .toLowerCase()
                                .includes(mergeSearchQuery.toLowerCase())
                            : true)
                      )
                      .slice(0, 10)
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setTargetPetitionId(p.id);
                            setMergeSearchQuery(p.title);
                          }}
                          className={`w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                            targetPetitionId === p.id ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">
                              {p.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {p.agreedCount}명 동의
                            </span>
                          </div>
                        </button>
                      ))}
                    {petitions.filter(
                      (p) =>
                        p.id !== sourcePetition.id &&
                        (mergeSearchQuery
                          ? p.title
                              .toLowerCase()
                              .includes(mergeSearchQuery.toLowerCase())
                          : true)
                    ).length === 0 && (
                      <p className="p-3 text-sm text-muted-foreground text-center">
                        검색 결과가 없습니다.
                      </p>
                    )}
                  </div>
                </div>

                {targetPetitionId && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      선택된 대상 청원
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                      {petitions.find((p) => p.id === targetPetitionId)?.title}
                    </p>
                  </div>
                )}

                {mergeError && (
                  <p className="text-sm text-red-500">{mergeError}</p>
                )}
                {mergeSuccess && (
                  <p className="text-sm text-green-500">{mergeSuccess}</p>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={closeMergeModal}>
                    취소
                  </Button>
                  <Button
                    onClick={handleMerge}
                    disabled={merging || !targetPetitionId}
                  >
                    {merging ? '병합 중...' : '병합'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
