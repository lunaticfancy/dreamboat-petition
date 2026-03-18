import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto max-w-4xl relative">
          <div className="flex flex-col items-center text-center">
            <div className="size-16 flex items-center justify-center bg-primary rounded-2xl text-primary-foreground mb-6 shadow-lg shadow-primary/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" x2="8" y1="13" y2="13" />
                <line x1="16" x2="8" y1="17" y2="17" />
                <line x1="10" x2="8" y1="9" y2="9" />
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              어린이집 소통 창구
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              학부모와 어린이집 관계자 간 투명하고 익명으로 소통하는 공간
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/petitions">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                  소통함 목록 보기
                </Button>
              </Link>
              <Link href="/petitions/new">
                <Button size="lg" variant="outline" className="gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                  새 소통함 작성
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-card border-y border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              어떻게 이용하나요?
            </h2>
            <p className="text-muted-foreground">
              간단한 3단계로 시작해 보세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="size-14 flex items-center justify-center bg-primary/10 rounded-xl mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">
                익명으로 소통함 작성
              </h3>
              <p className="text-muted-foreground text-sm">
                학부모는 누구나 익명으로 소통함을 작성할 수 있습니다
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="size-14 flex items-center justify-center bg-primary/10 rounded-xl mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M7 10v12" />
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.55l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3Z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">
                동의 수집
              </h3>
              <p className="text-muted-foreground text-sm">
                다른 학부모들에게 동의를 요청하고 필요 동의 수를 달성하세요
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="size-14 flex items-center justify-center bg-primary/10 rounded-xl mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">
                공식 답변
              </h3>
              <p className="text-muted-foreground text-sm">
                일정 수 이상의 동의가 모이면 관계자가 답변합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4">
            <div className="size-10 flex-shrink-0 flex items-center justify-center bg-primary/20 rounded-lg">
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
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="16" y2="12" />
                <line x1="12" x2="12.01" y1="8" y2="8" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-primary mb-1">익명성 보장</h3>
              <p className="text-sm text-muted-foreground">
                작성자 정보는 시스템 내부에서도 알 수 없으며 익명으로 표시
                됩니다.
              </p>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4 mt-6">
            <div className="size-10 flex-shrink-0 flex items-center justify-center bg-primary/20 rounded-lg">
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
                className="text-primary"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-primary mb-1">투명한 소통</h3>
              <p className="text-sm text-muted-foreground">
                소통하고 싶은 이야기, 편하게 말씀하세요.
                <br />
                열린 마음으로 기다리고 있어요.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            지금 시작하세요
          </h2>
          <p className="text-muted-foreground mb-6">
            학부모 여러분의 목소리를 들려주세요
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">회원가입</Button>
            </Link>
            <Link href="/petitions">
              <Button size="lg" variant="outline">
                둘러보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center text-muted-foreground text-sm">
          <p>Dreamboat X Puruni - 학부모와 어린이집의 투명한 소통을 위하여</p>
        </div>
      </footer>
    </div>
  );
}
