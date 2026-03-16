'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  ADMIN: '관리자',
  DIRECTOR: '원장',
  TEACHER: '선생님',
  PARENT: '학부모',
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('TEACHER');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (
      status === 'authenticated' &&
      (session?.user as any)?.role !== 'ADMIN'
    ) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (
      status === 'authenticated' &&
      (session?.user as any)?.role === 'ADMIN'
    ) {
      fetchUsers();
    }
  }, [status, session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess('사용자가 성공적으로 생성되었습니다.');
      setEmail('');
      setPassword('');
      setName('');
      setRole('TEACHER');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditRole(user.role);
    setError('');
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditName('');
    setEditRole('');
  };

  const handleEditSave = async () => {
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, role: editRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user');
      }

      setSuccess('사용자 정보가 수정되었습니다.');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) return;

    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      setSuccess('사용자가 삭제되었습니다.');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">사용자 관리</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>새 사용자 생성</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">이메일</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">비밀번호</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 (6자 이상)"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                이름 (선택)
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">역할</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="TEACHER">선생님</option>
                <option value="DIRECTOR">원장</option>
                <option value="ADMIN">관리자</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}

            <Button type="submit" disabled={submitting}>
              {submitting ? '생성 중...' : '사용자 생성'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground">사용자가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="rounded-lg border p-4">
                  {editingUser?.id === user.id ? (
                    <div className="space-y-3">
                      <div className="font-medium text-sm">{user.email}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">
                            이름
                          </label>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="이름"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">
                            역할
                          </label>
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="w-full h-8 rounded-lg border px-2 text-sm"
                          >
                            <option value="PARENT">학부모</option>
                            <option value="TEACHER">선생님</option>
                            <option value="DIRECTOR">원장</option>
                            <option value="ADMIN">관리자</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleEditSave}>
                          저장
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.name || '이름 없음'} •{' '}
                          {roleLabels[user.role] || user.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs ${
                            user.isVerified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {user.isVerified ? '인증됨' : '미인증'}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(user)}
                        >
                          수정
                        </Button>
                        {user.id !== (session?.user as any)?.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(user.id)}
                            disabled={deletingId === user.id}
                            className="text-red-500 hover:text-red-600"
                          >
                            {deletingId === user.id ? '삭제 중...' : '삭제'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
