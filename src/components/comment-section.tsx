'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    role: string;
  };
  isStaff: boolean;
  staffRole: string | null;
  parentId: string | null;
}

interface CommentSectionProps {
  petitionId: string;
  comments: Comment[];
  currentUser: {
    id: string;
    name: string | null;
    role: string;
  } | null;
  petitionAuthorId: string;
  onCommentAdded: () => void;
}

export function CommentSection({
  petitionId,
  comments,
  currentUser,
  petitionAuthorId,
  onCommentAdded,
}: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/petitions/${petitionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setContent('');
        onCommentAdded();
      } else {
        const data = await res.json();
        alert(data.error || '의견 작성 중 오류가 발생했습니다.');
      }
    } catch {
      alert('의견 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/petitions/${petitionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId }),
      });

      if (res.ok) {
        setReplyContent('');
        setReplyTo(null);
        onCommentAdded();
      } else {
        const data = await res.json();
        alert(data.error || '답글 작성 중 오류가 발생했습니다.');
      }
    } catch {
      alert('답글 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
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

  const getAuthorBadge = (comment: Comment) => {
    // Check if this user is the petition author
    const isAuthor = comment.user.name === petitionAuthorId; // This needs to be adjusted based on actual data

    if (comment.isStaff) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ml-2">
          {comment.staffRole === 'DIRECTOR' ? '원장' : '선생님'}
        </span>
      );
    }

    return null;
  };

  // Group comments by parent (top-level vs replies)
  const topLevelComments = comments.filter((c) => !c.parentId);
  const repliesByParent = comments.reduce(
    (acc, comment) => {
      if (comment.parentId) {
        if (!acc[comment.parentId]) acc[comment.parentId] = [];
        acc[comment.parentId].push(comment);
      }
      return acc;
    },
    {} as Record<string, Comment[]>
  );

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">
          의견 및 댓글 ({comments.length})
        </h3>

        {/* Comment Form */}
        {currentUser && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="의견을 작성해주세요..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting || !content.trim()}>
                {submitting ? '작성 중...' : '의견 작성'}
              </Button>
            </div>
          </form>
        )}

        {!currentUser && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
            의견을 작성하려면 로그인이 필요합니다.
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {topLevelComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              아직 의견이 없습니다. 첫 번째 의견을 작성해 보세요!
            </p>
          ) : (
            topLevelComments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Main Comment */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {comment.user.name || '익명'}
                      </span>
                      {getAuthorBadge(comment)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap mb-3">
                    {comment.content}
                  </p>
                  {currentUser && (
                    <button
                      onClick={() =>
                        setReplyTo(replyTo === comment.id ? null : comment.id)
                      }
                      className="text-xs text-primary hover:underline"
                    >
                      {replyTo === comment.id ? '취소' : '답글'}
                    </button>
                  )}

                  {/* Reply Form */}
                  {replyTo === comment.id && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="답글을 작성해주세요..."
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setReplyTo(null)}
                        >
                          취소
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={submitting || !replyContent.trim()}
                          onClick={() => handleReply(comment.id)}
                        >
                          {submitting ? '작성 중...' : '답글 작성'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Replies */}
                {repliesByParent[comment.id]?.map((reply) => (
                  <div
                    key={reply.id}
                    className="ml-8 p-4 bg-muted/30 rounded-lg border-l-2 border-primary/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-medium text-sm">
                          {reply.user.name || '익명'}
                        </span>
                        {reply.isStaff && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ml-2">
                            {reply.staffRole === 'DIRECTOR' ? '원장' : '선생님'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
