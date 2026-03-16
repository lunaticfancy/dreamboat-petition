'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const userRole = (session?.user as any)?.role;
  const canCreatePetition =
    !userRole || !['TEACHER', 'DIRECTOR', 'ADMIN'].includes(userRole);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">Dreamboat</span>
          <span className="text-lg text-muted-foreground">X</span>
          <span className="text-lg text-muted-foreground">Puruni</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              🏠 대시보드
            </Link>
          ) : null}
          <Link
            href="/petitions"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            📋 청원 목록
          </Link>
          {canCreatePetition && (
            <Link
              href="/petitions/new"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ✏️ 청원 작성
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/settings/profile"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                title="프로필 설정"
              >
                ⚙️ 설정
              </Link>
              <span className="text-sm text-muted-foreground">
                {session?.user?.name || session?.user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                🚪 로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  🔑 로그인
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">👤 회원가입</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                🏠 대시보드
              </Link>
            )}
            <Link
              href="/petitions"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              📋 청원 목록
            </Link>
            <Link
              href="/petitions/new"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              ✏️ 청원 작성
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/settings/profile"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    ⚙️ 프로필 설정
                  </Link>
                  <Link
                    href="/settings/notifications"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    🔔 알림 설정
                  </Link>
                  <span className="text-sm text-muted-foreground py-2">
                    {session?.user?.name || session?.user?.email}
                  </span>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    🚪 로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      🔑 로그인
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">👤 회원가입</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
