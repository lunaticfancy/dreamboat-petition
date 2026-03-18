'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { StatusBadge } from '@/components/status-badge';
import { ReportButton } from '@/components/report-button';
import { CommentSection } from '@/components/comment-section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Petition {
  id: string;
  title: string;
  content: string;
  status: string;
  anonymousId: string;
  agreedCount: number;
  threshold: number;
  isHidden: boolean;
  createdAt: string;
  authorId?: string;
  mergedToId?: string | null;
  mergedTo?: {
    id: string;
    title: string;
  } | null;
  _count?: {
    agreements: number;
    comments: number;
    reports: number;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  anonymousId: string;
  isHidden: boolean;
  user: {
    name: string | null;
    role: string;
  };
  isStaff: boolean;
  staffRole: string | null;
  parentId: string | null;
}

interface Answer {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string | null;
    role: string;
  };
  authorId?: string;
}

export default function PetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [petition, setPetition] = useState<Petition | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [threshold, setThreshold] = useState(10);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editAnswerContent, setEditAnswerContent] = useState('');
  const [isEditingPetition, setIsEditingPetition] = useState(false);
  const [editPetitionTitle, setEditPetitionTitle] = useState('');
  const [editPetitionContent, setEditPetitionContent] = useState('');

  useEffect(() => {
    async function fetchPetition() {
      try {
        const res = await fetch(`/api/petitions/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || '소통함을 찾을 수 없습니다.');
          return;
        }

        setPetition(data.petition);
      } catch {
        setError('소통함 조회 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchAnswers() {
      try {
        const res = await fetch(`/api/petitions/${params.id}/answer`);
        const data = await res.json();
        if (res.ok && data.answers) {
          setAnswers(data.answers);
        }
      } catch {
        setAnswers([]);
      }
    }

    async function fetchThreshold() {
      try {
        const res = await fetch('/api/settings/threshold');
        const data = await res.json();
        if (data.threshold) {
          setThreshold(data.threshold);
        }
      } catch {
        // Use default threshold
      }
    }

    async function fetchComments() {
      try {
        const res = await fetch(`/api/petitions/${params.id}/comments`);
        const data = await res.json();
        if (res.ok && data.comments) {
          setComments(data.comments);
        }
      } catch {
        setComments([]);
      }
    }

    if (params.id) {
      fetchPetition();
      fetchAnswers();
      fetchThreshold();
      fetchComments();
    }
  }, [params.id]);

  const handleAgree = async () => {
    if (!session?.user) {
      const confirmed = confirm(
        '동의하려면 로그인이 필요합니다.\n\n회원가입 하시겠습니까?'
      );
      if (confirmed) {
        window.location.href = '/auth/signup';
      }
      return;
    }

    const role = (session.user as any).role;
    if (['TEACHER', 'DIRECTOR', 'ADMIN'].includes(role)) {
      alert('선생님, 원장, 관리자는 소통함에 동의할 수 없습니다.');
      return;
    }

    try {
      const res = await fetch(`/api/petitions/${params.id}/agree`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setAgreed(true);
        if (petition) {
          setPetition({ ...petition, agreedCount: petition.agreedCount + 1 });
        }
      } else {
        alert(data.error || '동의 처리 중 오류가 발생했습니다.');
      }
    } catch {
      alert('동의 처리 중 오류가 발생했습니다.');
    }
  };

  const handleCancelAgree = async () => {
    if (!confirm('동의를 취소하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/petitions/${params.id}/agree`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setAgreed(false);
        if (petition) {
          setPetition({ ...petition, agreedCount: petition.agreedCount - 1 });
        }
      } else {
        alert(data.error || '동의 취소 중 오류가 발생했습니다.');
      }
    } catch {
      alert('동의 취소 중 오류가 발생했습니다.');
    }
  };

  const canUserAnswer = () => {
    if (!session?.user) return false;
    const role = (session.user as any).role;
    return role === 'TEACHER' || role === 'DIRECTOR' || role === 'ADMIN';
  };

  const canUserAgree = () => {
    if (!session?.user) return true;
    const role = (session.user as any).role;
    return role === 'PARENT';
  };

  const isStaff = () => {
    if (!session?.user) return false;
    const role = (session.user as any).role;
    return ['TEACHER', 'DIRECTOR', 'ADMIN'].includes(role);
  };

  const handleSubmitAnswer = async () => {
    if (!answerContent.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/petitions/${params.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: answerContent }),
      });
      const data = await res.json();

      if (res.ok) {
        setAnswerContent('');
        if (petition) {
          setPetition({ ...petition, status: 'ANSWERED' });
        }
        if (data.answer) {
          setAnswers([...answers, data.answer]);
        }
      } else {
        alert(data.error || '답변 등록 중 오류가 발생했습니다.');
      }
    } catch {
      alert('답변 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const canEditAnswer = (answer: Answer) => {
    const userRole = (session?.user as any)?.role;
    return ['TEACHER', 'DIRECTOR', 'ADMIN'].includes(userRole);
  };

  const handleEditAnswer = (answer: Answer) => {
    setEditingAnswerId(answer.id);
    setEditAnswerContent(answer.content);
  };

  const handleCancelEditAnswer = () => {
    setEditingAnswerId(null);
    setEditAnswerContent('');
  };

  const handleSaveEditAnswer = async (answerId: string) => {
    if (!editAnswerContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/answers/${answerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editAnswerContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnswers(
          answers.map((a) =>
            a.id === answerId ? { ...a, content: data.answer.content } : a
          )
        );
        setEditingAnswerId(null);
        setEditAnswerContent('');
        alert('답변이 수정되었습니다.');
      } else {
        const data = await res.json();
        alert(data.error || '답변 수정 중 오류가 발생했습니다.');
      }
    } catch {
      alert('답변 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const canEditPetition = () => {
    const userId = (session?.user as any)?.id;
    return petition?.authorId === userId && petition?.status === 'OPEN';
  };

  const handleStartEditPetition = () => {
    if (!petition) return;
    setEditPetitionTitle(petition.title);
    setEditPetitionContent(petition.content);
    setIsEditingPetition(true);
  };

  const handleCancelEditPetition = () => {
    setIsEditingPetition(false);
    setEditPetitionTitle('');
    setEditPetitionContent('');
  };

  const handleSaveEditPetition = async () => {
    if (!editPetitionTitle.trim() || !editPetitionContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/petitions/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editPetitionTitle,
          content: editPetitionContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPetition({ ...petition!, ...data.petition });
        setIsEditingPetition(false);
        setEditPetitionTitle('');
        setEditPetitionContent('');
        alert('소통함이 수정되었습니다.');
      } else {
        const data = await res.json();
        alert(data.error || '소통함 수정 중 오류가 발생했습니다.');
      }
    } catch {
      alert('소통함 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePetition = async () => {
    if (!confirm('정말로 이 소통함을 삭제하시겠습니까?')) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/petitions/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/petitions');
      } else {
        const data = await res.json();
        alert(data.error || '소통함 삭제 중 오류가 발생했습니다.');
      }
    } catch {
      alert('소통함 삭제 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const canDeletePetition = () => {
    const userId = (session?.user as any)?.id;
    return petition?.authorId === userId && petition?.status === 'OPEN';
  };

  const handleCommentAdded = async () => {
    try {
      const res = await fetch(`/api/petitions/${params.id}/comments`);
      const data = await res.json();
      if (res.ok && data.comments) {
        setComments(data.comments);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 flex items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (error || !petition) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error || '소통함을 찾을 수 없습니다.'}
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min(
    (petition.agreedCount / threshold) * 100,
    100
  );
  const isThresholdReached = petition.agreedCount >= threshold;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex items-center gap-2">
          <StatusBadge
            status={
              petition.status as
                | 'OPEN'
                | 'PENDING_ANSWER'
                | 'ANSWERED'
                | 'CLOSED'
                | 'MERGED'
            }
          />
          {petition.status === 'MERGED' && petition.mergedTo && (
            <Link
              href={`/petitions/${petition.mergedTo.id}`}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              → 병합된 소통함 보기
            </Link>
          )}
          {petition.isHidden && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              숨겨짐
            </span>
          )}
          {petition._count?.reports ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
              🚨 신고 {petition._count.reports}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{petition.title}</h1>
          {(canEditPetition() || canDeletePetition()) && (
            <div className="flex gap-2">
              {canEditPetition() && (
                <Link href={`/petitions/${petition.id}/edit`}>
                  <Button variant="outline" size="sm">
                    수정
                  </Button>
                </Link>
              )}
              {canDeletePetition() && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeletePetition}
                  disabled={submitting}
                >
                  삭제
                </Button>
              )}
            </div>
          )}
        </div>

        {!session && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <p>
              👋 소통함에 동의를 하거나 의견을 남기려면{' '}
              <a href="/auth/login" className="font-semibold underline">
                로그인
              </a>{' '}
              이 필요합니다.
              <br />
              아직 계정이 없으신가요?{' '}
              <a href="/auth/signup" className="font-semibold underline">
                회원가입
              </a>
              하세요!
            </p>
          </div>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap text-muted-foreground">
              {petition.content}
            </p>
          </CardContent>
        </Card>

        {/* 진행률 바 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-semibold text-foreground">
                  동의 현황
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {petition.agreedCount}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    / {threshold}명
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-500 dark:to-blue-400 transition-all duration-700 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {isThresholdReached ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      달성 완료
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      목표까지{' '}
                      <span className="font-semibold text-foreground">
                        {threshold - petition.agreedCount}
                      </span>
                      명 더 필요
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            {isStaff() ? (
              <div className="px-4 py-2 bg-white rounded-md text-sm text-black border">
                선생님, 원장, 관리자는 동의할 수 없습니다
              </div>
            ) : (
              <>
                <Button
                  onClick={handleAgree}
                  disabled={agreed || petition.status !== 'OPEN'}
                  variant={agreed ? 'secondary' : 'default'}
                >
                  {agreed ? '✓ 동의 완료' : '👍 동의하기'}
                </Button>
                {agreed && petition.status === 'OPEN' && (
                  <Button
                    onClick={handleCancelAgree}
                    variant="outline"
                    size="sm"
                  >
                    취소
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div>
              작성일: {new Date(petition.createdAt).toLocaleDateString('ko-KR')}
            </div>
            <ReportButton petitionId={petition.id} />
          </div>
        </div>

        {/* Answers List */}
        {answers.length > 0 && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">답변</h3>
              <div className="space-y-4">
                {answers.map((answer) => (
                  <div key={answer.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {answer.author.name || '관리자'}
                        </span>
                        {answer.author.role === 'DIRECTOR' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            원장
                          </span>
                        )}
                        {answer.author.role === 'TEACHER' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            선생님
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(answer.createdAt).toLocaleString('ko-KR')}
                        </span>
                        {canEditAnswer(answer) && !editingAnswerId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAnswer(answer)}
                          >
                            수정
                          </Button>
                        )}
                      </div>
                    </div>
                    {editingAnswerId === answer.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editAnswerContent}
                          onChange={(e) => setEditAnswerContent(e.target.value)}
                          className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background resize-y"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEditAnswer}
                          >
                            취소
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEditAnswer(answer.id)}
                            disabled={submitting}
                          >
                            저장
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{answer.content}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {canUserAnswer() &&
          (petition.status === 'PENDING_ANSWER' ||
            petition.status === 'ANSWERED') && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  {petition.status === 'ANSWERED'
                    ? '추가 답변 작성'
                    : '답변 작성'}
                </h3>
                <div className="space-y-4">
                  <textarea
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder={
                      petition.status === 'ANSWERED'
                        ? '추가 답변 내용을 입력해주세요...'
                        : '답변 내용을 입력해주세요...'
                    }
                    className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background resize-y"
                    disabled={submitting}
                  />
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !answerContent.trim()}
                  >
                    {submitting
                      ? '등록 중...'
                      : petition.status === 'ANSWERED'
                        ? '추가 답변 등록'
                        : '답변 등록'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {petition.status !== 'CLOSED' && (
          <CommentSection
            petitionId={petition.id}
            comments={comments}
            currentUser={
              session?.user
                ? {
                    id: ((session.user as any).id as string) || '',
                    name: session.user.name ?? null,
                    role: ((session.user as any).role as string) || 'USER',
                  }
                : null
            }
            petitionAuthorId={petition.authorId || ''}
            onCommentAdded={handleCommentAdded}
          />
        )}
      </div>
    </div>
  );
}
