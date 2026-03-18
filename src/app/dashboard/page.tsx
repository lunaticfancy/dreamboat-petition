'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import type { PetitionStatus } from '@/types';

interface DashboardStats {
  totalPetitions: number;
  pendingPetitions: number;
  answeredPetitions: number;
  totalUsers: number;
  parentCount: number;
  teacherCount: number;
  directorCount: number;
  adminCount: number;
  pendingReports: number;
}

interface RecentPetition {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  agreedCount: number;
}

interface RecentReport {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  petitionId: string | null;
  commentId: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
  const [recentPetitions, setRecentPetitions] = useState<RecentPetition[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (
      status === 'authenticated' &&
      ['ADMIN', 'DIRECTOR', 'TEACHER'].includes((session?.user as any)?.role)
    ) {
      fetchAdminData();
    }
  }, [status, session]);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
      const data = await res.json();
      setAdminStats(data.stats);
      setRecentPetitions(data.recentPetitions);
      setRecentReports(data.recentReports);
    } catch (err: any) {
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;

  if (!session) {
    return null;
  }

  if (userRole === 'ADMIN') {
    if (adminLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <p>로딩 중...</p>
        </div>
      );
    }

    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">관리자 대시보드</h1>
          <p className="text-muted-foreground">
            {(session?.user as any)?.name || session?.user?.email}님,
            안녕하세요!
          </p>
        </div>

        {adminError && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {adminError}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                전체 소통함
              </CardTitle>
              <svg
                className="h-4 w-4 text-muted-foreground"
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
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(adminStats?.totalPetitions || 0)}
              </div>
              <p className="text-xs text-muted-foreground">등록된 소통함</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                답변 대기
              </CardTitle>
              <svg
                className="h-4 w-4 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(adminStats?.pendingPetitions || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                답변 요청된 소통함
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                답변 완료
              </CardTitle>
              <svg
                className="h-4 w-4 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(adminStats?.answeredPetitions || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                답변 완료된 소통함
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                전체 사용자
              </CardTitle>
              <svg
                className="h-4 w-4 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(adminStats?.totalUsers || 0)}
              </div>
              <p className="text-xs text-muted-foreground">등록된 사용자</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                미처리 신고
              </CardTitle>
              <svg
                className="h-4 w-4 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" x2="4" y1="22" y2="15" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(adminStats?.pendingReports || 0)}
              </div>
              <p className="text-xs text-muted-foreground">검토 대기 중</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">사용자 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 50">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-700">
                    {formatNumber(adminStats?.parentCount || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">학부모</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 50">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-700">
                    {formatNumber(adminStats?.teacherCount || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">선생님</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 50">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-700">
                    {formatNumber(adminStats?.directorCount || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">원장</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 50">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-700">
                    {formatNumber(adminStats?.adminCount || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">관리자</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>최근 소통함</CardTitle>
              <Link
                href="/admin/petitions"
                className="text-sm text-primary hover:underline"
              >
                전체 보기
              </Link>
            </CardHeader>
            <CardContent>
              {recentPetitions.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  최근 소통함이 없습니다.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentPetitions.map((petition) => (
                    <div
                      key={petition.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-medium text-sm truncate">
                          {petition.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge
                            status={petition.status as PetitionStatus}
                          />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(petition.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-primary shrink-0">
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
                          <path d="M7 10v12" />
                          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.55l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3Z" />
                        </svg>
                        <span className="text-sm font-medium">
                          {formatNumber(petition.agreedCount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>최근 신고</CardTitle>
              <Link
                href="/admin/reports"
                className="text-sm text-primary hover:underline"
              >
                전체 보기
              </Link>
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  최근 신고가 없습니다.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm truncate">{report.reason}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded ${
                              report.status === 'PENDING'
                                ? 'bg-orange-100 text-orange-700'
                                : report.status === 'REVIEWED'
                                  ? 'bg-blue-100 text-blue-700'
                                  : report.status === 'ACTIONED'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {report.status === 'PENDING'
                              ? '대기'
                              : report.status === 'REVIEWED'
                                ? '검토 중'
                                : report.status === 'ACTIONED'
                                  ? '처리됨'
                                  : '기각'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/admin/users"
                className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <svg
                    className="w-5 h-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" x2="19" y1="8" y2="14" />
                    <line x1="22" x2="16" y1="11" y2="11" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">사용자 관리</p>
                  <p className="text-sm text-muted-foreground">
                    사용자 생성 및 관리
                  </p>
                </div>
              </Link>

              <Link
                href="/admin/petitions"
                className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <svg
                    className="w-5 h-5 text-primary"
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
                <div>
                  <p className="font-medium">소통함 관리</p>
                  <p className="text-sm text-muted-foreground">
                    소통함 목록 및 답변
                  </p>
                </div>
              </Link>

              <Link
                href="/admin/reports"
                className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <svg
                    className="w-5 h-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" x2="4" y1="22" y2="15" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">신고 관리</p>
                  <p className="text-sm text-muted-foreground">
                    {adminStats?.pendingReports
                      ? `${adminStats.pendingReports}건`
                      : '신고 처리'}
                  </p>
                </div>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <svg
                    className="w-5 h-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">설정</p>
                  <p className="text-sm text-muted-foreground">
                    필요 동의 수 설정
                  </p>
                </div>
              </Link>

              <Link
                href="/settings/notifications"
                className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">알림 설정</p>
                  <p className="text-sm text-muted-foreground">웹 알림 설정</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {userRole === 'PARENT' && '학부모 대시보드'}
          {userRole === 'TEACHER' && '선생님 대시보드'}
          {userRole === 'DIRECTOR' && '원장 대시보드'}
        </h1>
        <p className="text-muted-foreground">
          {(session?.user as any)?.name || session?.user?.email}님, 안녕하세요!
        </p>
      </div>
      {userRole === 'PARENT' && <ParentDashboard />}
      {(userRole === 'TEACHER' || userRole === 'DIRECTOR') && (
        <StaffDashboard role={userRole} />
      )}
    </div>
  );
}

function ParentDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">빠른 작업</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/petitions/new"
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <svg
                  className="w-5 h-5 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </div>
              <div>
                <p className="font-medium">새 글 작성</p>
                <p className="text-sm text-muted-foreground">
                  익명으로 글을 작성합니다
                </p>
              </div>
            </Link>

            <Link
              href="/petitions"
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <svg
                  className="w-5 h-5 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <line x1="9" x2="15" y1="3" y2="21" />
                </svg>
              </div>
              <div>
                <p className="font-medium">소통함 목록</p>
                <p className="text-sm text-muted-foreground">
                  진행 중인 소통함을 둘러봅니다
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">이용 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 30 shrink-0">
                <span className="text-sm font-medium text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium">글 작성</p>
                <p className="text-sm text-muted-foreground">
                  익명으로 글을 작성합니다. 작성자 정보는 공개되지 않습니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 30 shrink-0">
                <span className="text-sm font-medium text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium">동의 수집</p>
                <p className="text-sm text-muted-foreground">
                  다른 학부모들에게 동의를 요청하세요. 필요 동의 수 이상의
                  동의를 모으면 관계자가 답변합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 30 shrink-0">
                <span className="text-sm font-medium text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium">답변 확인</p>
                <p className="text-sm text-muted-foreground">
                  관계자가 답변하면 답변을 확인하고 추가 의견을 남기실 수
                  있습니다.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StaffDashboard({ role }: { role: string }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">빠른 작업</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/petitions"
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <svg
                  className="w-5 h-5 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <line x1="9" x2="15" y1="3" y2="21" />
                </svg>
              </div>
              <div>
                <p className="font-medium">소통함 목록</p>
                <p className="text-sm text-muted-foreground">
                  모든 소통함을 확인합니다
                </p>
              </div>
            </Link>

            <Link
              href="/petitions?status=PENDING_ANSWER"
              className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 30">
                <svg
                  className="w-5 h-5 text-orange-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="font-medium">답변 대기</p>
                <p className="text-sm text-muted-foreground">
                  답변이 필요한 소통함
                </p>
              </div>
            </Link>

            {(role === 'DIRECTOR' || role === 'TEACHER') && (
              <Link
                href="/admin/reports"
                className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 30">
                  <svg
                    className="w-5 h-5 text-red-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" x2="12" y1="9" y2="13" />
                    <line x1="12" x2="12.01" y1="17" y2="17" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">신고 관리</p>
                  <p className="text-sm text-muted-foreground">
                    신고된 내용 확인
                  </p>
                </div>
              </Link>
            )}

            {(role === 'DIRECTOR' || role === 'TEACHER') && (
              <Link
                href="/settings/notifications"
                className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 30">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">알림 설정</p>
                  <p className="text-sm text-muted-foreground">
                    브라우저 알림 관리
                  </p>
                </div>
              </Link>
            )}

            {role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 30">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1-1-1.73l-.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">관리자 페이지</p>
                  <p className="text-sm text-muted-foreground">
                    사용자 및 설정 관리
                  </p>
                </div>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {role === 'DIRECTOR' ? '원장' : '선생님'} 안내
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              • 학부모가 작성한 소통함에 답변을 작성할 수 있습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              • 필요 동의 수 이상의 동의를 받은 소통함은 필수로 답변해야 합니다.
            </p>
            <p className="text-sm text-muted-foreground">
              • 답변은 수정할 수 있으며, 수정 이력이 저장됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
