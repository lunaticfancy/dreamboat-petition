import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommentSection } from '@/components/comment-section';

vi.mock('@/components/report-button', () => ({
  ReportButton: ({ commentId }: { commentId: string }) => (
    <button data-testid={`report-${commentId}`}>신고</button>
  ),
}));

describe('CommentSection', () => {
  const mockOnCommentAdded = vi.fn();

  const baseProps = {
    petitionId: 'petition-1',
    comments: [],
    currentUser: null,
    petitionAuthorId: 'author-1',
    onCommentAdded: mockOnCommentAdded,
  };

  const adminComment = {
    id: 'comment-1',
    content: '관리자 댓글입니다.',
    createdAt: '2024-01-15T10:00:00Z',
    anonymousId: '192.168.1.100',
    isHidden: false,
    user: {
      name: '관리자',
      role: 'ADMIN',
    },
    isStaff: true,
    staffRole: 'ADMIN',
    parentId: null,
  };

  const directorComment = {
    id: 'comment-2',
    content: '원장님 댓글입니다.',
    createdAt: '2024-01-15T11:00:00Z',
    anonymousId: '192.168.1.101',
    isHidden: false,
    user: {
      name: '원장님',
      role: 'DIRECTOR',
    },
    isStaff: true,
    staffRole: 'DIRECTOR',
    parentId: null,
  };

  const teacherComment = {
    id: 'comment-3',
    content: '선생님 댓글입니다.',
    createdAt: '2024-01-15T12:00:00Z',
    anonymousId: '192.168.1.102',
    isHidden: false,
    user: {
      name: '김선생',
      role: 'TEACHER',
    },
    isStaff: true,
    staffRole: 'TEACHER',
    parentId: null,
  };

  const parentComment = {
    id: 'comment-4',
    content: '학부모 댓글입니다.',
    createdAt: '2024-01-15T13:00:00Z',
    anonymousId: '192.168.1.103',
    isHidden: false,
    user: {
      name: null,
      role: 'PARENT',
    },
    isStaff: false,
    staffRole: null,
    parentId: null,
  };

  describe('Staff badge rendering', () => {
    it('should display "관리자" badge for admin comment', () => {
      render(<CommentSection {...baseProps} comments={[adminComment]} />);

      const badges = screen.getAllByText('관리자');
      const badge = badges.find((el) => el.className.includes('bg-blue-100'));
      expect(badge).toBeInTheDocument();
    });

    it('should display "원장" badge for director comment', () => {
      render(<CommentSection {...baseProps} comments={[directorComment]} />);

      const badges = screen.getAllByText('원장');
      const badge = badges.find((el) => el.className.includes('bg-blue-100'));
      expect(badge).toBeInTheDocument();
    });

    it('should display "선생님" badge for teacher comment', () => {
      render(<CommentSection {...baseProps} comments={[teacherComment]} />);

      const badges = screen.getAllByText('선생님');
      const badge = badges.find((el) => el.className.includes('bg-blue-100'));
      expect(badge).toBeInTheDocument();
    });

    it('should display masked IP address for parent comment', () => {
      render(<CommentSection {...baseProps} comments={[parentComment]} />);

      expect(screen.getByText('192.168.1.103')).toBeInTheDocument();
    });
  });

  describe('Multiple comments with different roles', () => {
    it('should display correct badges for multiple staff roles', () => {
      render(
        <CommentSection
          {...baseProps}
          comments={[adminComment, directorComment, teacherComment]}
        />
      );

      const adminBadges = screen.getAllByText('관리자');
      expect(
        adminBadges.find((el) => el.className.includes('bg-blue-100'))
      ).toBeInTheDocument();

      const directorBadges = screen.getAllByText('원장');
      expect(
        directorBadges.find((el) => el.className.includes('bg-blue-100'))
      ).toBeInTheDocument();

      const teacherBadges = screen.getAllByText('선생님');
      expect(
        teacherBadges.find((el) => el.className.includes('bg-blue-100'))
      ).toBeInTheDocument();
    });

    it('should show both staff badges and parent anonymousId', () => {
      render(
        <CommentSection
          {...baseProps}
          comments={[adminComment, parentComment]}
        />
      );

      const adminBadges = screen.getAllByText('관리자');
      expect(
        adminBadges.find((el) => el.className.includes('bg-blue-100'))
      ).toBeInTheDocument();
      expect(screen.getByText('192.168.1.103')).toBeInTheDocument();
    });
  });

  describe('Reply comments', () => {
    const adminReply = {
      ...adminComment,
      id: 'reply-1',
      parentId: 'comment-4',
    };

    it('should display "관리자" badge for admin reply', () => {
      render(
        <CommentSection {...baseProps} comments={[parentComment, adminReply]} />
      );

      const badges = screen.getAllByText('관리자');
      expect(
        badges.find((el) => el.className.includes('bg-blue-100'))
      ).toBeInTheDocument();
    });
  });
});
