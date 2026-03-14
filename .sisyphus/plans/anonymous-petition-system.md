# 어린이집-학부모 익명 소통 창구 구축

## TL;DR

> **Quick Summary**: 국회 청원 스타일의 익명 소통 시스템 구축. 학부모가 청원 작성 → 동의 수집 → 임계값 도달 시 관계자 답변. GitHub PR 스타일 상태 관리.
>
> **Deliverables**:
>
> - 학부모/관계자 인증 시스템
> - 익명 청원 작성 및 동의 시스템
> - 댓글/대댓글 토론 시스템
> - 관계자 답변 시스템 (수정 이력 포함)
> - 관리자 대시보드
> - PWA 푸시 알림
> - 반응형 웹 (모바일 우선)
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES -4 waves
> **Critical Path**: Setup → Auth → Petition Core → Answer → Integration

---

## Context

### Original Request

어린이집과 학부모 간 소통을 위한 익명의 창구 구축. 국회 청원 시스템처럼 찬성 동의를 모아 N명 이상 동의 시 어린이집 관계자가 대답해야 하는 시스템. 모바일 접근 가능, 게시판은 추천 순 정렬, GitHub PR 스타일로 답변 관리.

### Interview Summary

**핵심 결정 사항**:

| 항목        | 결정                                                     |
| ----------- | -------------------------------------------------------- |
| 서비스 범위 | 단일 어린이집 전용                                       |
| 익명성      | 완전 익명 (작성자 식별 불가)                             |
| 동의 임계값 | 최초 10명, 관리자 조정 가능                              |
| UI 스타일   | GitHub PR 스타일                                         |
| 인증        | 이메일 회원가입 +인증 코드(학부모) / 관리자 생성(관계자) |
| 투표        | 찬성만                                                   |
| 관계자      | 원장, 선생님 (답변 권한)                                 |
| 청원 작성   | 학부모만 작성                                            |
| 의견 토론   | 동의 + 댓글 (모두 작성 가능)                             |
| 데이터 보관 | 영구 보관                                                |
| 수정/삭제   | 청원 수정 불가, 답변 수정 가능 (이력 표시)               |
| 신고 시스템 | 학부모 신고 → 관리자 검토                                |
| 파일 첨부   | 이미지/PDF, 10MB                                         |
| 알림        | PWA 푸시 알림                                            |
| 호스팅      | Vercel + Supabase                                        |
| 테스트      | TDD                                                      |

### Metis Review

**Identified Gaps (addressed)**:

1. **데이터 보관 정책**: 영구 보관으로 확정
2. **중복 청원 처리**: 관리자 병합 기능 추가
3. **답변 수정**: 수정 가능, 이력 표시
4. **댓글 시스템**: 모두 작성 가능 (학부모/선생님/원장)
5. **불건전 내용**: 신고 시스템 추가
6. **청원 수정**: 수정 불가로 확정
7. **호스팅**: Vercel + Supabase

**Guardrails Applied**:

- 다중 어린이집 지원 없음 (단일 어련이집)
- 실시간 채팅/DM 없음
- 반대 투표 없음
- 카테고리 시스템 없음
- 작성자 식별 정보노출 금지

---

## Work Objectives

### Core Objective

국회 청원 스타일의 익명 소통 창구 구축. 학부모가 익명으로 청원 작성, 동의 수집, 임계값 도달 시 관계자 필수 답변. 모바일 반응형, PWA 푸시 알림.

### Concrete Deliverables

1. **인증 시스템**
   - 학부모: 이메일 회원가입 → 어린이집 인증 코드 입력
   - 선생님/원장: 관리자가 직접 계정 생성
   - 익명 보장: 작성자 식별 불가

2. **청원 시스템**
   - 학부모 청원 작성 (제목, 본문, 파일 첨부)
   - 동의(찬성) 투표 + 댓글
   - 상태 관리: Open → Answered → Closed
   - 정렬: 동의 수 내림차순

3. **답변 시스템**
   - 관계자 답변 작성
   - 답변 수정 (이력 표시)
   - 답변 전 비공개, 답변 후 공개

4. **관리자 기능**
   - 동의 임계값 설정
   - 사용자 관리 (선생님/원장 계정 생성)
   - 청원 병합
   - 신고 처리

5. **알림 시스템**
   - PWA 푸시 알림 (임계값 도달 시)

### Definition of Done

- [ ] 학부모 회원가입 및 인증 코드 입력 플로우 작동
- [ ] 익명 청원 작성 및 동의 투표 가능
- [ ] 임계값 도달 시 관계자에게 푸시 알림 발송
- [ ] 관계자 답변 작성 및 수정 가능
- [ ] 관리자 대시보드에서 임계값, 사용자 관리 가능
- [ ] 모바일 반응형 UI 작동
- [ ] `bun test` 통과
- [ ] `bun run build` 성공

### Must Have

- 완전 익명성 보장 (작성자 식별 불가)
- 학부모만 청원 작성 가능
- 관계자(원장/선생님)만 답변 가능
- 동의 임계값 도달 시 필수 답변
- 영구 보관

### Must NOT Have (Guardrails)

- 다중 어린이집 지원 (단일만)
- 반대 투표
- 실시간 채팅/DM
- 카테고리 시스템
- 청원 작성자 수정/삭제
- 작성자 식별 정보 노출
- 대시보드 분석 (v2)
- 내보내기 기능 (v2)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision

- **Infrastructure exists**: NO (새 프로젝트)
- **Automated tests**: TDD (테스트 주도 개발)
- **Framework**: Vitest (Next.js 권장)
- **Test types**: Unit (Vitest) + Integration (Vitest) + E2E (Playwright)

### QA Policy

Every task MUST include agent-executed QA scenarios.

- **Frontend/UI**: Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Bash (curl) — Send requests, assert status + response fields
- **Integration**: Playwright E2E — Full user flows

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — Start Immediately):
├── Task 1: Project Scaffolding [quick]
├── Task 2: Database Schema Design [deep]
├── Task 3: Type Definitions [quick]
├── Task 4: Authentication Setup (NextAuth.js) [deep]
├── Task 5: Base UI Layout & Components [visual-engineering]
└── Task 6: PWA Setup (Service Worker) [quick]

Wave 2 (Core Features — After Wave 1):
├── Task 7: User Management - Parent Verification [unspecified-high]
├── Task 8: User Management - Admin Account Creation [quick]
├── Task 9: Petition CRUD - Create/Read [deep]
├── Task 10: Petition CRUD - List/Search [unspecified-high]
├── Task 11: Agreement System [quick]
├── Task 12: Comment System [deep]
├── Task 13: Answer System [unspecified-high]
└── Task 14: Answer Edit History [quick]

Wave 3 (Advanced Features — After Wave 2):
├── Task 15: File Upload System [unspecified-high]
├── Task 16: Push Notification System [deep]
├── Task 17: Report System [quick]
├── Task 18: Petition Merge (Admin) [unspecified-high]
├── Task 19: Admin Dashboard [visual-engineering]
└── Task 20: Threshold Management [quick]

Wave 4 (Integration & Polish — After Wave 3):
├── Task 21: Integration Tests [deep]
├── Task 22: E2E Tests (Playwright) [deep]
├── Task 23: Performance Optimization [unspecified-high]
└── Task 24: Accessibility (WCAG 2.1 AA) [unspecified-high]

Wave FINAL (Verification — After ALL tasks):
├── Task F1: Plan Compliance Audit [oracle]
├── Task F2: Code Quality Review [unspecified-high]
├── Task F3: Manual QA (Playwright) [unspecified-high]
└── Task F4: Scope Fidelity Check [deep]
```

### Dependency Matrix

| Task | Depends On      | Blocks   |
| ---- | --------------- | -------- |
| 1    | —               | 2-6      |
| 2    | 1               | 7-14     |
| 3    | 1               | 7-14     |
| 4    | 1, 3            | 7-8      |
| 5    | 1               | 9-10, 19 |
| 6    | 1               | 16       |
| 7    | 2, 3, 4         | 9-14     |
| 8    | 2, 3, 4         | 9-14     |
| 9    | 2, 3, 5, 7      | 10-14    |
| 10   | 9               | 11-14    |
| 11   | 2, 3, 9         | 13       |
| 12   | 2, 3, 9         | 13       |
| 13   | 2, 3, 9, 11, 12 | 14       |
| 14   | 13              | —        |
| 15   | 9               | —        |
| 16   | 6, 7            | —        |
| 17   | 2, 3, 9, 12     | —        |
| 18   | 2, 9            | —        |
| 19   | 5, 8            | —        |
| 20   | 2, 19           | —        |
| 21   | 7-14            | 22       |
| 22   | 21              | —        |
| 23   | 22              | —        |
| 24   | 22              | —        |

### Agent Dispatch Summary

- Wave 1: 6 tasks — T1(quick), T2(deep), T3(quick), T4(deep), T5(visual-engineering), T6(quick)
- Wave 2: 8 tasks — T7-T14
- Wave 3: 6 tasks — T15-T20
- Wave 4: 4 tasks — T21-T24
- Final: 4 tasks — F1-F4

---

## Design Reference

> **CRITICAL**: All UI tasks MUST reference the design examples in `.sisyphus/drafts/design_example/`

### Design Files

| File                            | Description                    | Tasks             |
| ------------------------------- | ------------------------------ | ----------------- |
| `code.html`                     | 청원 답변 페이지 (교직원 포털) | T13, T14          |
| `admin_dashboard/screen.png`    | 관리자 대시보드                | T19               |
| `create_petition/screen.png`    | 청원 작성 페이지               | T9                |
| `petition_detail/screen.png`    | 청원 상세 페이지               | T9, T11, T12, T13 |
| `petition_list_home/screen.png` | 청원 목록/홈 페이지            | T5, T10           |
| `screen.png` (루트)             | 메인 화면                      | T5                |

### Design Specifications (from code.html)

**Color Scheme**:

- Primary: `#2b8cee` (블루)
- Background Light: `#f6f7f8`
- Background Dark: `#101922`
- Border Light: `#e2e8f0` (slate-200)
- Border Dark: `#1e293b` (slate-800)

**Typography**:

- Font Family: Inter
- Dark Mode Support: YES

**Components**:

- Rounded corners: `xl` (0.75rem)
- Shadow: `shadow-sm`
- Icons: Material Symbols Outlined

**UI Patterns**:

- Expandable details (details/summary)
- Status badges (Open/Answered/Closed)
- Rich text editor toolbar
- File upload cards
- Dark mode toggle

---

## TODOs

- [x] 1. Project Scaffolding

  **What to do**:
  - Next.js 14 프로젝트 생성 (App Router)
  - TypeScript 설정
  - Tailwind CSS 설정
  - shadcn/ui 설치
  - Prisma 설치 및 초기화
  - Vitest 설정
  - ESLint/Prettier 설정
  - 디렉토리 구조 생성 (src/app, src/components, src/lib, src/types)

  **Must NOT do**:
  - 복잡한 설정 추가 (최소한으로 유지)
  - 불필요한 패키지 설치

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 표준 설정 작업, 복잡도 낮음
  - **Skills**: []
    - Standard setup, no special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: NO (foundation task)
  - **Parallel Group**: Wave 1 Start
  - **Blocks**: T2, T3, T4, T5, T6
  - **Blocked By**: None

  **References**:
  - Next.js Docs: `https://nextjs.org/docs/getting-started/installation`
  - Tailwind Docs: `https://tailwindcss.com/docs/installation`
  - Prisma Docs: `https://www.prisma.io/docs/getting-started`

  **Acceptance Criteria**:
  - [ ] 프로젝트 생성 완료
  - [ ] `bun dev` 실행 성공
  - [ ] `bun test` 실행 성공 (빈 테스트)
  - [ ] `bun run build` 성공

  **QA Scenarios**:

  ```
  Scenario: Project runs successfully
    Tool: Bash
    Steps:
      1. Run `bun dev`
      2. Curl localhost:3000
    Expected Result: HTTP 200, HTML response
    Evidence: .sisyphus/evidence/task-01-server-start.txt
  ```

  **Commit**: YES
  - Message: `chore: initialize Next.js project with TypeScript, Tailwind, Prisma`
  - Pre-commit: `bun run lint && bun test`

---

- [x] 2. Database Schema Design

  **What to do**:
  - Prisma 스키마 설계
  - User 모델 (role: PARENT, TEACHER, DIRECTOR, ADMIN)
  - Petition 모델 (title, content, status, anonymousId, agreedCount)
  - Agreement 모델 (userId, petitionId, anonymousKey)
  - Comment 모델 (content, userId, petitionId, parentId)
  - Answer 모델 (content, authorId, petitionId, editHistory)
  - AnswerEditHistory 모델 (answerId, previousContent, editedAt)
  - Report 모델 (petitionId, commentId, reporterId, status)
  - VerificationCode 모델 (code, expiresAt, used)
  - Setting 모델 (key, value - 임계값 저장)
  - FileUpload 모델 (url, type, size, petitionId)
  - PushSubscription 모델 (userId, endpoint, keys)
  - 초기 마이그레이션 생성

  **Must NOT do**:
  - 작성자 식별 정보를 Petition에 직접 저장 (익명성 위배)
  - 과도한 정규화

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 스키마 설계는 도메인 로직 이해 필요, 신중한 설계 요구
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T1)
  - **Parallel Group**: Wave 1
  - **Blocks**: T7-T20
  - **Blocked By**: T1

  **References**:
  - Prisma Schema: `https://www.prisma.io/docs/reference/models`
  - 익명성 보장: 작성자 ID는 별도 테이블에 분리, 해시화된 anonymousId 사용

  **Acceptance Criteria**:
  - [ ] 모든 모델 정의 완료
  - [ ] 관계 설정 정확 (User-Petition, Petition-Agreement 등)
  - [ ] `bunx prisma migrate dev --name init` 성공
  - [ ] Prisma Studio에서 테이블 확인

  **QA Scenarios**:

  ```
  Scenario: Schema generates valid migration
    Tool: Bash
    Steps:
      1. Run `bunx prisma migrate dev --name init`
      2. Check prisma/migrations directory
    Expected Result: Migration file created, no errors
    Evidence: .sisyphus/evidence/task-02-migration.txt
  ```

  **Commit**: YES
  - Message: `feat: add database schema for petition system`
  - Pre-commit: `bunx prisma validate`

---

- [x] 3. Type Definitions

  **What to do**:
  - 공통 타입 정의 (src/types/index.ts)
  - UserRole 타입 ('PARENT' | 'TEACHER' | 'DIRECTOR' | 'ADMIN')
  - PetitionStatus 타입 ('OPEN' | 'ANSWERED' | 'CLOSED')
  - Petition, Agreement, Comment, Answer 인터페이스
  - API 응답 타입 (ApiResponse<T>)
  - 폼 데이터 타입 (CreatePetitionInput, LoginInput 등)

  **Must NOT do**:
  - 실제 DB 모델과不一致한 타입 정의
  - `any` 타입 사용

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 타입 정의는 직관적이고 빠르게 완료 가능
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2)
  - **Parallel Group**: Wave 1
  - **Blocks**: T7-T14
  - **Blocked By**: T1

  **References**:
  - TypeScript Handbook: `https://www.typescriptlang.org/docs/handbook/2/types-from-types.html`

  **Acceptance Criteria**:
  - [ ] 모든 주요 타입 정의 완료
  - [ ] `tsc --noEmit` 성공
  - [ ] Prisma 타입과 일치

  **QA Scenarios**:

  ```
  Scenario: Types compile without errors
    Tool: Bash
    Steps:
      1. Run `tsc --noEmit`
    Expected Result: No type errors
    Evidence: .sisyphus/evidence/task-03-types.txt
  ```

  **Commit**: YES
  - Message: `feat: add TypeScript type definitions`
  - Pre-commit: `tsc --noEmit`

---

- [x] 4. Authentication Setup (NextAuth.js)

  **What to do**:
  - NextAuth.js 설치 및 설정
  - 이메일/비밀번호 인증 Provider 설정
  - 세션 전략 (JWT)
  - 로그인/회원가입 페이지 (src/app/auth/login, src/app/auth/signup)
  - 인증 미들웨어 (src/middleware.ts)
  - 역할 기반 접근 제어 (RBAC) 기본 구조

  **Must NOT do**:
  - 소셜 로그인 Provider 추가 (범위 외)
  - 과도한 보안 설정 (초기 버전)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 인증은 보안에 중요, 신중한 설계 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T1, T3)
  - **Parallel Group**: Wave 1
  - **Blocks**: T7, T8
  - **Blocked By**: T1, T3

  **References**:
  - NextAuth.js Docs: `https://authjs.dev/getting-started/installation`
  - Next.js Middleware: `https://nextjs.org/docs/app/building-your-application/routing/middleware`

  **Acceptance Criteria**:
  - [ ] NextAuth 설정 완료
  - [ ] 로그인 페이지 렌더링
  - [ ] 회원가입 페이지 렌더링
  - [ ] 세션 생성 확인

  **QA Scenarios**:

  ```
  Scenario: User can access login page
    Tool: Playwright
    Steps:
      1. Navigate to /auth/login
      2. Check page content
    Expected Result: Login form visible
    Evidence: .sisyphus/evidence/task-04-login-page.png
  ```

  **Commit**: YES
  - Message: `feat: add NextAuth.js authentication setup`
  - Pre-commit: `bun test`

---

- [x] 5. Base UI Layout & Components

  **What to do**:
  - 기본 레이아웃 (src/app/layout.tsx)
  - 반응형 네비게이션 컴포넌트
  - 상태 배지 컴포넌트 (Open/Answered/Closed)
  - 버튼, 입력 필드, 카드 컴포넌트 (shadcn/ui)
  - 모바일 반응형 디자인 적용
  - 다크/라이트 모드 토글 (선택적)
  - 디자인 시스템 설정 (색상, 폰트, 아이콘)

  **Must NOT do**:
  - 과도한 컴포넌트 생성 (필요한 것만)
  - 디자인 시스템 과잉 설계

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI/UX 디자인 요구, 시각적 품질 중요
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 디자인 시스템 구축 전문 지원

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2-T4)
  - **Parallel Group**: Wave 1
  - **Blocks**: T9, T10, T19
  - **Blocked By**: T1

  **References**:
  - **Design Example**: `.sisyphus/drafts/design_example/petition_list_home/screen.png` - 홈/목록 페이지 레이아웃 참고
  - **Design Example**: `.sisyphus/drafts/design_example/code.html` - 컬러 스킴, 폰트, 컴포넌트 참고
  - shadcn/ui Docs: `https://ui.shadcn.com/docs`
  - Tailwind Responsive: `https://tailwindcss.com/docs/responsive-design`

  **Acceptance Criteria**:
  - [ ] 기본 레이아웃 렌더링
  - [ ] 모바일 뷰포트에서 적절한 반응형
  - [ ] 상태 배지 정상 표시
  - [ ] Primary 색상 `#2b8cee` 적용
  - [ ] Inter 폰트 적용

  **QA Scenarios**:

  ```
  Scenario: Layout matches design reference
    Tool: Playwright
    Steps:
      1. Navigate to /
      2. Compare with petition_list_home/screen.png
      3. Set viewport to 375px (mobile)
      4. Check navigation menu collapsed
    Expected Result: Layout matches design reference
    Evidence: .sisyphus/evidence/task-05-layout.png
  ```

  **Commit**: YES
  - Message: `feat: add base UI layout and responsive components`
  - Pre-commit: `bun test`

---

- [x] 6. PWA Setup (Service Worker)

  **What to do**:
  - next-pwa 패키지 설치
  - manifest.json 생성 (아이콘, 이름, 테마)
  - Service Worker 설정
  - 푸시 알림 구독 기본 구조
  - 오프라인 폴백 페이지

  **Must NOT do**:
  - 복잡한 오프라인 캐싱 전략 (초기 버전)
  - 푸시 알림 로직 (T16에서 구현)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: PWA 설정은 표준적인 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2-T5)
  - **Parallel Group**: Wave 1
  - **Blocks**: T16
  - **Blocked By**: T1

  **References**:
  - next-pwa: `https://github.com/shadowwalker/next-pwa`
  - Web Push API: `https://developer.mozilla.org/en-US/docs/Web/API/Push_API`

  **Acceptance Criteria**:
  - [ ] PWA 설치 가능 (manifest.json)
  - [ ] Service Worker 등록
  - [ ] Lighthouse PWA 점수 > 80

  **QA Scenarios**:

  ```
  Scenario: PWA is installable
    Tool: Playwright
    Steps:
      1. Navigate to /
      2. Check for web app manifest
      3. Check for service worker registration
    Expected Result: PWA installable, SW registered
    Evidence: .sisyphus/evidence/task-06-pwa.txt
  ```

  **Commit**: YES
  - Message: `feat: add PWA setup with service worker`
  - Pre-commit: `bun run build`

---

- [x] 7. User Management - Parent Verification

  **What to do**:
  - 학부모 회원가입 플로우 (이메일, 비밀번호)
  - 이메일 인증 (인증 코드 발송 - mock for now)
  - 어린이집 인증 코드 입력 페이지
  - 인증 코드 검증 API (/api/auth/verify-code)
  - 인증 코드 생성 (관리자 생성, 6자리 숫자)
  - 로그아웃 기능
  - 테스트: 회원가입 → 인증 코드 입력 → 로그인

  **Must NOT do**:
  - 실제 이메일 발송 (mock으로 대체)
  - 소셜 로그인

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 인증 플로우는 복잡하고 보안 중요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T2, T3, T4)
  - **Parallel Group**: Wave 2
  - **Blocks**: T9-T14
  - **Blocked By**: T2, T3, T4

  **References**:
  - NextAuth.js Session: `https://authjs.dev/guides/session-management`
  - Prisma Create: `prisma.schema.prisma` - VerificationCode model

  **Acceptance Criteria**:
  - [ ] 회원가입 페이지 작동
  - [ ] 인증 코드 입력 페이지 작동
  - [ ] 로그인 성공 시 세션 생성
  - [ ] `bun test src/__tests__/auth.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: Parent can signup and verify
    Tool: Playwright
    Steps:
      1. Navigate to /auth/signup
      2. Fill email: test@example.com, password: Test123!
      3. Submit form
      4. Navigate to /auth/verify
      5. Enter verification code: 123456
    Expected Result: Account created, redirected to dashboard
    Evidence: .sisyphus/evidence/task-07-signup.png
  ```

  **Commit**: YES
  - Message: `feat: add parent signup and verification flow`
  - Pre-commit: `bun test`

---

- [x] 8. User Management - Admin Account Creation

  **What to do**:
  - 관리자 대시보드 사용자 관리 페이지 (/admin/users)
  - 선생님/원장 계정 생성 폼
  - 계정 생성 API (/api/admin/users)
  - 역할 선택 (TEACHER, DIRECTOR)
  - 임시 비밀번호 생성 및 이메일 발송 (mock)
  - 첫 로그인 시 비밀번호 변경 강제
  - 비밀번호 변경 페이지 (/auth/change-password)

  **Must NOT do**:
  - 실제 이메일 발송 (mock으로 대체)
  - 관리자 권한 상승 로직 (초기 관리자는 시드 데이터)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 표준 CRUD 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T2, T3, T4)
  - **Parallel Group**: Wave 2
  - **Blocks**: T9-T14
  - **Blocked By**: T2, T3, T4

  **References**:
  - Prisma User Model: `prisma.schema.prisma` - User model
  - NextAuth.js RBAC: `https://authjs.dev/guides/role-based-access-control`

  **Acceptance Criteria**:
  - [ ] 관리자가 선생님/원장 계정 생성 가능
  - [ ] 생성된 계정으로 로그인 가능
  - [ ] 첫 로그인 시 비밀번호 변경 강제
  - [ ] `bun test src/__tests__/admin-users.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: Admin can create teacher account
    Tool: Playwright
    Steps:
      1. Login as admin
      2. Navigate to /admin/users
      3. Click "Create User"
      4. Fill email: teacher@example.com, role: TEACHER
      5. Submit form
    Expected Result: Teacher account created
    Evidence: .sisyphus/evidence/task-08-admin-users.png
  ```

  **Commit**: YES
  - Message: `feat: add admin user creation flow`
  - Pre-commit: `bun test`

---

- [x] 9. Petition CRUD - Create/Read

  **What to do**:
  - 청원 작성 페이지 (/petitions/new)
  - 청원 작성 폼 (제목, 본문, 파일 첨부)
  - 청원 작성 API (/api/petitions, POST)
  - 익명 ID 생성 (UUIDv4, 해시화)
  - 청원 상세 페이지 (/petitions/[id])
  - 청원 상세 API (/api/petitions/[id], GET)
  - 상태 표시 (Open/Answered/Closed)
  - 작성자 익명성 보장 (anonymousId만 표시)
  - 디자인 예시 참고: petition_detail, create_petition
  - TDD: 테스트 먼저 작성

  **Must NOT do**:
  - 작성자 식별 정보 노출
  - 카테고리 시스템 추가
  - 청원 수정 기능 (수정 불가 정책)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 핵심 기능, 도메인 로직 복잡
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 디자인 예시 참고하여 UI 구현

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T2, T3, T5, T7)
  - **Parallel Group**: Wave 2
  - **Blocks**: T10-T14
  - **Blocked By**: T2, T3, T5, T7

  **References**:
  - **Design Example**: `.sisyphus/drafts/design_example/create_petition/screen.png` - 청원 작성 페이지 디자인
  - **Design Example**: `.sisyphus/drafts/design_example/petition_detail/screen.png` - 청원 상세 페이지 디자인
  - **Design Example**: `.sisyphus/drafts/design_example/code.html` - 상태 배지, 레이아웃 참고
  - Prisma Petition Model: `prisma.schema.prisma` - Petition model
  - File Upload: T15에서 구현 (여기서는 파일 필드만)

  **Acceptance Criteria**:
  - [ ] 청원 작성 페이지 렌더링 (create_petition 디자인 참고)
  - [ ] 청원 생성 API 작동
  - [ ] 청원 상세 페이지에서 익명 ID 표시
  - [ ] 작성자 실제 정보 미노출
  - [ ] 상태 배지 디자인 일치 (Open/Answered/Closed)
  - [ ] `bun test src/__tests__/petition-crud.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: Petition creation matches design
    Tool: Playwright
    Steps:
      1. Login as parent
      2. Navigate to /petitions/new
      3. Compare with create_petition/screen.png
      4. Fill title: "급식 개선 요청", content: "내용..."
      5. Submit form
      6. View petition detail
      7. Compare with petition_detail/screen.png
    Expected Result: UI matches design reference
    Evidence: .sisyphus/evidence/task-09-petition-create.png
  ```

  Scenario: Parent can create anonymous petition
  Tool: Playwright
  Steps: 1. Login as parent 2. Navigate to /petitions/new 3. Fill title: "급식 개선 요청", content: "내용..." 4. Submit form 5. View petition detail page
  Expected Result: Petition created, anonymous author shown
  Evidence: .sisyphus/evidence/task-09-petition-create.png

  ```

  **Commit**: YES
  - Message: `feat: add petition create and read functionality`
  - Pre-commit: `bun test`
  ```

---

- [x] 10. Petition CRUD - List/Search

  **What to do**:
  - 청원 목록 페이지 (/petitions)
  - 동의 수 내림차순 정렬
  - 상태 필터 (All/Open/Answered/Closed)
  - 검색 기능 (제목, 본문 검색)
  - 페이지네이션 (무한 스크롤 또는 페이지네이션)
  - 목록 API (/api/petitions, GET)
  - 검색 API (/api/petitions/search, GET)
  - 디자인 예시 참고: petition_list_home
  - TDD: 테스트 먼저 작성

  **Must NOT do**:
  - 고급 검색 필터 (날짜 등)
  - 카테고리 필터

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 목록/검색은 성능 고려 필요
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 디자인 예시 참고하여 목록 UI 구현

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T9)
  - **Parallel Group**: Wave 2
  - **Blocks**: T11-T14
  - **Blocked By**: T9

  **References**:
  - **Design Example**: `.sisyphus/drafts/design_example/petition_list_home/screen.png` - 목록 페이지 디자인
  - Prisma Query: `prisma.petition.findMany` with orderBy
  - Next.js Pagination: Server-side pagination

  **Acceptance Criteria**:
  - [ ] 청원 목록 페이지 렌더링 (petition_list_home 디자인 참고)
  - [ ] 동의 수 내림차순 정렬 확인
  - [ ] 상태 필터 작동
  - [ ] 검색 기능 작동
  - [ ] 페이지네이션 작동
  - [ ] `bun test src/__tests__/petition-list.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: Petition list matches design
    Tool: Playwright
    Steps:
      1. Create 5 petitions with different agreement counts
      2. Navigate to /petitions
      3. Compare with petition_list_home/screen.png
      4. Check order (descending by agreement)
    Expected Result: List matches design, sorted correctly
    Evidence: .sisyphus/evidence/task-10-petition-list.png
  ```

  **Commit**: YES
  - Message: `feat: add petition list and search functionality`
  - Pre-commit: `bun test`

---

- [x] 11. Agreement System

  **What to do**:
  - 동의 버튼 컴포넌트
  - 동의 API (/api/petitions/[id]/agree, POST)
  - 중복 동의 방지 (IP + Device Fingerprint + Account)
  - 동의 수 증가 로직
  - 동의 수 표시
  - 동의자 목록 (관리자용, 익명)
  - 임계값 도달 시 이벤트 발생 (T16에서 처리)
  - TDD: 테스트 먼저 작성

  **Must NOT do**:
  - 동의자 실명 노출
  - 반대 투표

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 상대적으로 단순한 로직
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T12, after T9)
  - **Parallel Group**: Wave 2
  - **Blocks**: T13
  - **Blocked By**: T2, T3, T9

  **References**:
  - Prisma Agreement Model: `prisma.schema.prisma` - Agreement model
  - Device Fingerprint: FingerprintJS or simple canvas fingerprint

  **Acceptance Criteria**:
  - [ ] 동의 버튼 표시
  - [ ] 동의 시 동의 수 증가
  - [ ] 중복 동의 방지 확인
  - [ ] `bun test src/__tests__/agreement.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: User can agree once per petition
    Tool: Playwright
    Steps:
      1. Login as parent A
      2. Agree to petition
      3. Check agreement count = 1
      4. Try to agree again
    Expected Result: Second agree blocked
    Evidence: .sisyphus/evidence/task-11-agreement.png
  ```

  **Commit**: YES
  - Message: `feat: add agreement system with duplicate prevention`
  - Pre-commit: `bun test`

---

- [x] 12. Comment System

  **What to do**:
  - 댓글 작성 컴포넌트
  - 댓글 API (/api/petitions/[id]/comments, GET/POST)
  - 대댓글 기능 (parentId)
  - 댓글 목록 표시 (스레드 형식)
  - 댓글 작성자 표시 (학부모: 익명, 관계자: 역할 표시)
  - 댓글 삭제 (작성자만)
  - TDD: 테스트 먼저 작성

  **Must NOT do**:
  - 댓글 수정 (삭제만)
  - 댓글 투표 (찬성/반대)
  - 관계자 익명 표시 (역할 표시)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 스레드 구조 복잡, 권한 관리 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T11)
  - **Parallel Group**: Wave 2
  - **Blocks**: T13
  - **Blocked By**: T2, T3, T9

  **References**:
  - Prisma Comment Model: `prisma.schema.prisma` - Comment model
  - Thread Structure: Nested Set or Adjacency List

  **Acceptance Criteria**:
  - [ ] 댓글 작성 가능
  - [ ] 대댓글 작성 가능
  - [ ] 스레드 형식으로 표시
  - [ ] 작성자 정보 올바르게 표시 (익명/역할)
  - [ ] `bun test src/__tests__/comment.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: User can add nested comments
    Tool: Playwright
    Steps:
      1. Login as parent
      2. Add comment to petition
      3. Reply to the comment
      4. Check thread structure
    Expected Result: Nested comments displayed correctly
    Evidence: .sisyphus/evidence/task-12-comment.png
  ```

  **Commit**: YES
  - Message: `feat: add comment system with threading`
  - Pre-commit: `bun test`

---

- [ ] 13. Answer System

  **What to do**:
  - 답변 작성 페이지 (/petitions/[id]/answer)
  - 답변 작성 API (/api/petitions/[id]/answer, POST)
  - 답변 표시 (청원 상세 페이지)
  - 상태 변경 (Open → Answered)
  - 답변 작성 권한 확인 (TEACHER, DIRECTOR)
  - 리치 텍스트 에디터 (굵게, 기울임, 리스트, 링크)
  - 파일 첨부 (이미지, PDF)
  - 디자인 예시 참고: code.html (답변 페이지)
  - TDD: 테스트 먼저 작성

  **Must NOT do**:
  - 학부모 답변 작성
  - 답변 수정 (T14에서 구현)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 권한 관리 중요, 리치 에디터 복잡
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 디자인 예시 참고하여 답변 UI 구현

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T9, T11, T12)
  - **Parallel Group**: Wave 2
  - **Blocks**: T14
  - **Blocked By**: T9, T11, T12

  **References**:
  - **Design Example**: `.sisyphus/drafts/design_example/code.html` - 답변 작성 페이지 전체 UI
    - 리치 텍스트 에디터 툴바 (format_bold, format_italic, format_list, link, image)
    - 답변 상태 선택 (답변 완료 / 청원 종료)
    - 파일 첨부 UI
    - 공개 범위 안내
  - Prisma Answer Model: `prisma.schema.prisma` - Answer model
  - Role Check: `src/lib/auth.ts` - hasRole function

  **Acceptance Criteria**:
  - [ ] 관계자만 답변 작성 가능
  - [ ] 답변 작성 시 상태 변경 (Answered)
  - [ ] 답변이 청원 상세에 표시
  - [ ] 리치 텍스트 에디터 작동
  - [ ] 파일 첨부 가능
  - [ ] UI가 code.html 디자인과 일치
  - [ ] `bun test src/__tests__/answer.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: Answer page matches design reference
    Tool: Playwright
    Steps:
      1. Login as teacher
      2. Navigate to /petitions/1/answer
      3. Compare with code.html design
      4. Check rich text editor toolbar
      5. Check status radio buttons
      6. Check file attachment UI
    Expected Result: UI matches code.html design
    Evidence: .sisyphus/evidence/task-13-answer.png
  ```

  **Commit**: YES
  - Message: `feat: add answer system with role-based access`
  - Pre-commit: `bun test`

---

- [ ] 14. Answer Edit History

  **What to do**:
  - 답변 수정 API (/api/answers/[id], PUT)
  - 수정 이력 저장 (AnswerEditHistory)
  - 수정 이력 표시 (타임라인)
  - 수정 이력 API (/api/answers/[id]/history, GET)
  - TDD: 테스트 먼저 작성

  **Must NOT do**:
  - 이력 삭제
  - 학부모 수정

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: CRUD에 이력 저장 로직 추가
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T13)
  - **Parallel Group**: Wave 2
  - **Blocks**: Nothing
  - **Blocked By**: T13

  **References**:
  - Prisma AnswerEditHistory Model: `prisma.schema.prisma`

  **Acceptance Criteria**:
  - [ ] 답변 수정 가능
  - [ ] 수정 시 이력 자동 저장
  - [ ] 이력 타임라인 표시
  - [ ] `bun test src/__tests__/answer-history.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: Answer edit saves history
    Tool: Playwright
    Steps:
      1. Login as teacher
      2. Create answer
      3. Edit answer
      4. Check edit history
    Expected Result: Edit history displayed
    Evidence: .sisyphus/evidence/task-14-answer-history.png
  ```

  **Commit**: YES
  - Message: `feat: add answer edit history tracking`
  - Pre-commit: `bun test`

---

- [ ] 15. File Upload System

  **What to do**:
  - 파일 업로드 컴포넌트 (이미지, PDF)
  - 파일 업로드 API (/api/upload, POST)
  - 파일 검증 (크기 ≤ 10MB, 타입: jpg/png/gif/pdf)
  - 파일 저장 (로컬 파일 시스템 또는 Supabase Storage)
  - 파일 URL 반환
  - 청원 작성 시 파일 첨부
  - 파일 미리보기 (이미지)
  - TDD: 테스트 먼저 작성

  **Must NOT do**:
  - 동영상 업로드
  - 파일 크기 제한 초과 허용
  - 바이러스 스캔 (초기 버전)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 보안 고려 필요, 파일 검증 중요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T16-T18, after Wave 2)
  - **Parallel Group**: Wave 3
  - **Blocks**: Nothing
  - **Blocked By**: T9

  **References**:
  - Next.js File Upload: `https://nextjs.org/docs/app/building-your-application/routing/route-handlers`
  - Supabase Storage: `https://supabase.com/docs/guides/storage`

  **Acceptance Criteria**:
  - [ ] 이미지 업로드 성공 (≤10MB)
  - [ ] PDF 업로드 성공 (≤10MB)
  - [ ] 잘못된 파일 타입 차단
  - [ ] 크기 초과 파일 차단
  - [ ] `bun test src/__tests__/file-upload.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: Image upload with size limit
    Tool: Playwright
    Steps:
      1. Login as parent
      2. Create petition
      3. Upload image (5MB)
      4. Upload image (15MB)
    Expected Result: 5MB success, 15MB blocked
    Evidence: .sisyphus/evidence/task-15-file-upload.png
  ```

  **Commit**: YES
  - Message: `feat: add file upload system with validation`
  - Pre-commit: `bun test`

---

- [ ] 16. Push Notification System

  **What to do**:
  - Web Push API 설정 (VAPID keys)
  - 푸시 구독 API (/api/notifications/subscribe, POST)
  - 푸시 구독 저장 (PushSubscription 테이블)
  - 임계값 도달 시 푸시 발송 로직
  - 푸시 알림 구독 UI (알림 받기 버튼)
  - 푸시 알림 템플릿
  - TDD: 테스트 먼저 작성

  **Must NOT do**:
  - 이메일 알림 (v2)
  - SMS 알림
  - 푸시 알림 강제

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Web Push API 복잡, 브라우저 호환성 고려
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T15, T17-T18, after Wave 2)
  - **Parallel Group**: Wave 3
  - **Blocks**: Nothing
  - **Blocked By**: T6, T7

  **References**:
  - Web Push API: `https://developer.mozilla.org/en-US/docs/Web/API/Push_API`
  - VAPID: `https://web.dev/articles/push-notifications-web-push-protocol`

  **Acceptance Criteria**:
  - [ ] 푸시 구독 가능
  - [ ] 임계값 도달 시 관계자에게 푸시 발송
  - [ ] 푸시 알림 수신 확인
  - [ ] `bun test src/__tests__/push-notification.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: Push notification on threshold reached
    Tool: Playwright
    Steps:
      1. Login as teacher
      2. Subscribe to notifications
      3. Create petition with threshold = 2
      4. Have 2 users agree
    Expected Result: Teacher receives push notification
    Evidence: .sisyphus/evidence/task-16-push.png
  ```

  **Commit**: YES
  - Message: `feat: add push notification system`
  - Pre-commit: `bun test`

---

- [ ] 17. Report System

  **What to do**:
  - 신고 버튼 컴포넌트
  - 신고 API (/api/reports, POST)
  - 신고 사유 입력 (선택)
  - 관리자 신고 목록 페이지 (/admin/reports)
  - 신고 처리 API (/api/admin/reports/[id], PUT)
  - 신고 상태 (PENDING, REVIEWED, ACTIONED, DISMISSED)
  - 신고된 청원/댓글 숨김 처리 (관리자)
  - TDD: 테스트 먼저 작성

  **Must NOT do**:
  - 자동 필터링
  - 신고자 정보 노출

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 표준 CRUD 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T15-T16, T18-T20, after Wave 2)
  - **Parallel Group**: Wave 3
  - **Blocks**: Nothing
  - **Blocked By**: T2, T3, T9, T12

  **References**:
  - Prisma Report Model: `prisma.schema.prisma` - Report model

  **Acceptance Criteria**:
  - [ ] 사용자가 청원/댓글 신고 가능
  - [ ] 관리자가 신고 목록 확인 가능
  - [ ] 관리자가 신고 처리 가능
  - [ ] `bun test src/__tests__/report.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: User can report inappropriate content
    Tool: Playwright
    Steps:
      1. Login as parent
      2. View petition
      3. Click "Report"
      4. Enter reason
      5. Submit
      6. Login as admin
      7. View /admin/reports
    Expected Result: Report appears in admin list
    Evidence: .sisyphus/evidence/task-17-report.png
  ```

  **Commit**: YES
  - Message: `feat: add report system for content moderation`
  - Pre-commit: `bun test`

---

- [ ] 18. Petition Merge (Admin)

  **What to do**:
  - 관리자 청원 병합 페이지 (/admin/petitions/merge)
  - 병합할 청원 선택 UI
  - 병합 API (/api/admin/petitions/merge, POST)
  - 동의 수 합산 로직
  - 원본 청원 숨김 처리
  - 병합 이력 저장
  - TDD: 테스트 먼저 작성

  **Must NOT do**:
  - 자동 병합
  - 학부모 병합

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 복잡한 비즈니스 로직
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T15-T17, T19-T20, after Wave 2)
  - **Parallel Group**: Wave 3
  - **Blocks**: Nothing
  - **Blocked By**: T2, T9

  **References**:
  - Prisma Petition Model: `prisma.schema.prisma`

  **Acceptance Criteria**:
  - [ ] 관리자가 유사 청원 병합 가능
  - [ ] 동의 수 합산 확인
  - [ ] 원본 청원 숨김 확인
  - [ ] `bun test src/__tests__/petition-merge.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: Admin can merge similar petitions
    Tool: Playwright
    Steps:
      1. Login as admin
      2. Navigate to /admin/petitions/merge
      3. Select petition A (agreements: 5)
      4. Select petition B (agreements: 3)
      5. Click "Merge"
      6. Check merged petition (agreements: 8)
    Expected Result: Petitions merged, agreements summed
    Evidence: .sisyphus/evidence/task-18-merge.png
  ```

  **Commit**: YES
  - Message: `feat: add admin petition merge functionality`
  - Pre-commit: `bun test`

---

- [ ] 19. Admin Dashboard

  **What to do**:
  - 관리자 대시보드 페이지 (/admin)
  - 청원 통계 (전체, 상태별)
  - 사용자 통계 (학부모, 선생님, 원장)
  - 최근 청원 목록
  - 임계값 설정 UI (/admin/settings)
  - 임계값 변경 API (/api/admin/settings/threshold, PUT)
  - 디자인 예시 참고: admin_dashboard
  - TDD: 테스트 먼저 작성

  **Must NOT do**:
  - 복잡한 분석 차트 (v2)
  - 내보내기 기능 (v2)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 대시보드 UI/UX 중요
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 디자인 예시 참고하여 대시보드 UI 구현

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T5, T8)
  - **Parallel Group**: Wave 3
  - **Blocks**: T20
  - **Blocked By**: T5, T8

  **References**:
  - **Design Example**: `.sisyphus/drafts/design_example/admin_dashboard/screen.png` - 관리자 대시보드 디자인
  - shadcn/ui Charts: `https://ui.shadcn.com/docs/components/charts`

  **Acceptance Criteria**:
  - [ ] 대시보드 페이지 렌더링 (admin_dashboard 디자인 참고)
  - [ ] 통계 데이터 표시
  - [ ] 임계값 변경 가능
  - [ ] `bun test src/__tests__/admin-dashboard.test.ts` 통포

  **QA Scenarios**:

  ```
  Scenario: Admin dashboard matches design reference
    Tool: Playwright
    Steps:
      1. Login as admin
      2. Navigate to /admin
      3. Compare with admin_dashboard/screen.png
      4. Check statistics display
      5. Navigate to /admin/settings
      6. Change threshold to 15
      7. Save
      8. Verify new threshold
    Expected Result: Dashboard matches design, threshold updated
    Evidence: .sisyphus/evidence/task-19-admin-dashboard.png
  ```

  **Commit**: YES
  - Message: `feat: add admin dashboard with threshold settings`
  - Pre-commit: `bun test`

---

- [ ] 20. Threshold Management

  **What to do**:
  - 임계값 설정 API (/api/admin/settings/threshold, PUT)
  - 임계값 조회 API (/api/settings/threshold, GET)
  - 임계값 변경 시 이벤트 발생
  - 임계값 도달 체크 로직 (Agreement 증가 시)
  - 동의 수 표시 (현재/임계값)
  - TDD: 테스트 먼저 작성

  **Must NOT do**:
  - 동적 임계값 (시간별)
  - 사용자별 임계값

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 설정 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T2, T19)
  - **Parallel Group**: Wave 3
  - **Blocks**: Nothing
  - **Blocked By**: T2, T19

  **References**:
  - Prisma Setting Model: `prisma.schema.prisma` - Setting model

  **Acceptance Criteria**:
  - [ ] 임계값 변경 가능
  - [ ] 임계값 조회 가능
  - [ ] 동의 수 표시 (5/10 형태)
  - [ ] `bun test src/__tests__/threshold.test.ts` 통과

  **QA Scenarios**:

  ```
  Scenario: Threshold affects answer requirement
    Tool: Playwright
    Steps:
      1. Set threshold to 3
      2. Create petition
      3. Have 2 users agree (below threshold)
      4. Check no push notification
      5. Have 1 more user agree (reaches threshold)
      6. Check push notification sent
    Expected Result: Push sent at threshold
    Evidence: .sisyphus/evidence/task-20-threshold.png
  ```

  **Commit**: YES
  - Message: `feat: add threshold management system`
  - Pre-commit: `bun test`

---

- [ ] 21. Integration Tests

  **What to do**:
  - 통합 테스트 설정 (Vitest)
  - 인증 플로우 테스트 (회원가입 → 로그인 → 로그아웃)
  - 청원 플로우 테스트 (작성 → 동의 → 답변 → 종료)
  - 댓글 플로우 테스트 (작성 → 대댓글 → 삭제)
  - 관리자 플로우 테스트 (계정 생성 → 임계값 설정)
  - DB 트랜잭션 테스트

  **Must NOT do**:
  - 단위 테스트 중복 (이미 작성됨)
  - E2E 테스트 (T22에서 작성)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 통합 테스트는 시스템 전반 이해 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T7-T14)
  - **Parallel Group**: Wave 4
  - **Blocks**: T22
  - **Blocked By**: T7-T14

  **References**:
  - Vitest Integration: `https://vitest.dev/guide/features.html#in-source-testing`
  - Testing Library: `https://testing-library.com/docs/react-testing-library/intro`

  **Acceptance Criteria**:
  - [ ] `bun test:integration` 통과
  - [ ] 모든 주요 플로우 커버
  - [ ] DB 롤백 테스트 포함

  **QA Scenarios**:

  ```
  Scenario: Full petition lifecycle
    Tool: Vitest
    Steps:
      1. Create parent account
      2. Create petition
      3. Multiple users agree
      4. Threshold reached
      5. Teacher answers
      6. Petition closed
    Expected Result: All steps pass without errors
    Evidence: .sisyphus/evidence/task-21-integration.txt
  ```

  **Commit**: YES
  - Message: `test: add integration tests for core flows`
  - Pre-commit: `bun test`

---

- [ ] 22. E2E Tests (Playwright)

  **What to do**:
  - Playwright 설정
  - E2E 테스트 시나리오 작성
  - 학부모 플로우 (회원가입 → 인증 → 청원 작성 → 동의)
  - 관계자 플로우 (로그인 → 답변 작성)
  - 관리자 플로우 (계정 생성 → 임계값 설정)
  - 크로스 브라우저 테스트 (Chrome, Firefox, Safari)
  - 모바일 뷰포트 테스트

  **Must NOT do**:
  - 단위/통합 테스트 중복
  - 모든 엣지 케이스 (주요 플로우만)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: E2E 테스트는 사용자 경험 전체 이해 필요
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T21)
  - **Parallel Group**: Wave 4
  - **Blocks**: T23, T24
  - **Blocked By**: T21

  **References**:
  - Playwright Docs: `https://playwright.dev/docs/intro`
  - Testing Library: `https://testing-library.com/docs/react-testing-library/intro`

  **Acceptance Criteria**:
  - [ ] `bun test:e2e` 통과
  - [ ] 모든 주요 사용자 플로우 커버
  - [ ] 모바일 뷰포트 테스트 포함
  - [ ] 크로스 브라우저 테스트 포함

  **QA Scenarios**:

  ```
  Scenario: E2E parent petition flow
    Tool: Playwright
    Steps:
      1. Navigate to /auth/signup
      2. Fill signup form
      3. Verify email
      4. Enter verification code
      5. Navigate to /petitions/new
      6. Create petition
      7. View petition
      8. Agree to petition
    Expected Result: All steps pass in real browser
    Evidence: .sisyphus/evidence/task-22-e2e.mp4
  ```

  **Commit**: YES
  - Message: `test: add E2E tests with Playwright`
  - Pre-commit: `bun test:e2e`

---

- [ ] 23. Performance Optimization

  **What to do**:
  - 번들 사이즈 최적화 (번들 분석)
  - 이미지 최적화 (Next.js Image)
  - 데이터베이스 쿼리 최적화 (인덱스)
  - API 응답 캐싱 (SWR/React Query)
  - 페이지 로딩 속도 개선
  - Lighthouse 점수 측정 (목표: > 90)

  **Must NOT do**:
  - 과도한 캐싱 (데이터 신선도 유지)
  - CDN 설정 (Vercel 자동 처리)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 성능 최적화는 복잡하고 사용자 경험에 중요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T22)
  - **Parallel Group**: Wave 4
  - **Blocks**: Nothing
  - **Blocked By**: T22

  **References**:
  - Next.js Performance: `https://nextjs.org/docs/app/building-your-application/optimizing`
  - Prisma Indexes: `https://www.prisma.io/docs/concepts/components/prisma-schema/indexes`

  **Acceptance Criteria**:
  - [ ] Lighthouse Performance > 80
  - [ ] Lighthouse Accessibility > 90
  - [ ] Bundle size < 500KB (gzipped)
  - [ ] First Contentful Paint < 2s

  **QA Scenarios**:

  ```
  Scenario: Lighthouse performance score
    Tool: Playwright
    Steps:
      1. Run Lighthouse audit
      2. Check performance score
    Expected Result: Performance > 80
    Evidence: .sisyphus/evidence/task-23-performance.txt
  ```

  **Commit**: YES
  - Message: `perf: optimize bundle size and database queries`
  - Pre-commit: `bun run build`

---

- [ ] 24. Accessibility (WCAG 2.1 AA)

  **What to do**:
  - 키보드 네비게이션 지원
  - 스크린 리더 호환성 (ARIA labels)
  - 색상 대비 확인 (WCAG AA 기준)
  - 포커스 표시 명확화
  - 이미지 alt 텍스트
  - 폼 라벨 연결
  - 에러 메시지 명확화

  **Must NOT do**:
  - AAA 기준 (과도함)
  - 음성 명령 지원 (초기 버전)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 접근성은 사용자 경험에 중요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T23)
  - **Parallel Group**: Wave 4
  - **Blocks**: Nothing
  - **Blocked By**: T22

  **References**:
  - WCAG 2.1: `https://www.w3.org/WAI/WCAG21/quickref/`
  - ARIA: `https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA`

  **Acceptance Criteria**:
  - [ ] axe DevTools 접근성 검사 통과
  - [ ] 키보드만으로 전체 플로우 가능
  - [ ] 스크린 리더로 주요 기능 사용 가능
  - [ ] 색상 대비 4.5:1 이상

  **QA Scenarios**:

  ```
  Scenario: Keyboard-only navigation
    Tool: Playwright
    Steps:
      1. Navigate to /
      2. Use Tab key only to navigate
      3. Create petition without mouse
      4. Agree to petition without mouse
    Expected Result: All actions accessible via keyboard
    Evidence: .sisyphus/evidence/task-24-a11y.txt
  ```

  **Commit**: YES
  - Message: `a11y: add WCAG 2.1 AA accessibility support`
  - Pre-commit: `bun test`

---

- [ ] F1. Plan Compliance Audit (oracle)

  **What to do**:
  - 계획의 모든 "Must Have" 기능이 구현되었는지 확인
  - 모든 "Must NOT Have" 기능이 구현되지않았는지 확인
  - evidence 파일 존재 확인
  - TODO 항목별 구현 상태 확인
  - 범위 이탈(creep) 감지

  **Must NOT do**:
  - 새 기능 추가
  - 코드 수정

  **Recommended Agent Profile**:
  - **Category**: `oracle`
    - Reason: 독립적인 검증 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with F2-F4)
  - **Parallel Group**: Wave FINAL
  - **Blocks**: Nothing
  - **Blocked By**: T1-T24

  **Acceptance Criteria**:
  - [ ] Must Have[N/N] 확인
  - [ ] Must NOT Have[N/N] 확인
  - [ ] evidence 파일 존재
  - [ ] VERDICT: APPROVE

---

- [ ] F2. Code Quality Review (unspecified-high)

  **What to do**:
  - `tsc --noEmit` 실행 (타입 에러 확인)
  - `bun run lint` 실행 (린트 에러 확인)
  - `bun test` 실행 (테스트 통과 확인)
  - AI slop 패턴 확인 (`as any`, `@ts-ignore`, 콘솔 로그, 빈 catch)
  - 과도한 주석 확인
  - 미사용 import 확인

  **Must NOT do**:
  - 새 기능 추가
  - 코드 수정 (보고만)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 코드 품질 검증 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with F1, F3-F4)
  - **Parallel Group**: Wave FINAL
  - **Blocks**: Nothing
  - **Blocked By**: T1-T24

  **Acceptance Criteria**:
  - [ ] Build [PASS]
  - [ ] Lint [PASS]
  - [ ] Tests [N pass / 0 fail]
  - [ ] Files [N clean /0 issues]
  - [ ] VERDICT: APPROVE

---

- [ ] F3. Manual QA (unspecified-high + playwright)

  **What to do**:
  - 모든 QA 시나리오 실행
  - 크로스 태스크 통합 테스트
  - 엣지 케이스 테스트
  - 모바일 뷰포트 테스트
  - evidence 캡처

  **Must NOT do**:
  - 새 기능 추가
  - 코드 수정

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 수동 QA 필요
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with F1-F2, F4)
  - **Parallel Group**: Wave FINAL
  - **Blocks**: Nothing
  - **Blocked By**: T1-T24

  **Acceptance Criteria**:
  - [ ] Scenarios [N/N pass]
  - [ ] Integration [N/N]
  - [ ] Edge Cases [N tested]
  - [ ] VERDICT: APPROVE

---

- [ ] F4. Scope Fidelity Check (deep)

  **What to do**:
  - 각 태스크의 "What to do"와 실제 diff 비교
  - 1:1 구현 확인 (모두 구현, 초과 없음)
  - "Must NOT do" 준수 확인
  - 태스크 간 컨테이너이션 확인
  - 미설명 변경 감지

  **Must NOT do**:
  - 새 기능 추가
  - 코드 수정

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 깊은 분석 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with F1-F3)
  - **Parallel Group**: Wave FINAL
  - **Blocks**: Nothing
  - **Blocked By**: T1-T24

  **Acceptance Criteria**:
  - [ ] Tasks [N/N compliant]
  - [ ] Contamination [CLEAN]
  - [ ] Unaccounted [CLEAN]
  - [ ] VERDICT: APPROVE

## Final Verification Wave

### F1. Plan Compliance Audit (oracle)

Read plan end-to-end. Verify all Must Have implemented, all Must NOT Have absent. Check evidence files.

### F2. Code Quality Review (unspecified-high)

Run `tsc --noEmit`, linter, tests. Check for AI slop patterns.

### F3. Manual QA (unspecified-high + playwright)

Execute every QA scenario from every task. Cross-task integration testing.

### F4. Scope Fidelity Check (deep)

Verify 1:1 implementation vs spec. Detect scope creep.

---

## Commit Strategy

Commits grouped by wave. Each task has pre-commit test requirement.

---

## Success Criteria

### Verification Commands

```bash
bun test                    # All tests pass
bun run build              # Build succeeds
bun run lint               # No lint errors
tsc --noEmit               # No type errors
```

### Final Checklist

- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] PWA installable
- [ ] Push notifications working
- [ ] Mobile responsive
- [ ] Anonymous guarantee verified
