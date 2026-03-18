# Puruni Web 프로덕션 배포

## TL;DR

> **Quick Summary**: Next.js 애플리케이션(어린이집-학부모 익명 소통 창구)을 Vercel + Supabase PostgreSQL + SendGrid로 프로덕션 배포.
>
> **Deliverables**:
>
> - Vercel 프로젝트 배포
> - Supabase PostgreSQL 데이터베이스 연결
> - Vercel Blob 파일 저장소 설정
> - GitHub Actions CI/CD 파이프라인
> - SendGrid 이메일 발송 연동
> - Prisma 시드 스크립트 (관리자 계정 생성)
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: DB 수정 → 스키마 변경 → 마이그레이션 → 배포 → 검증

---

## Context

### Original Request

완성된 Next.js 애플리케이션을 프로덕션에 배포. Vercel + Supabase PostgreSQL 조합으로 배포하며, CI/CD 자동화 구축.

### Interview Summary

**핵심 결정 사항**:

| 항목         | 결정                                         |
| ------------ | -------------------------------------------- |
| 호스팅       | Vercel                                       |
| 데이터베이스 | Supabase PostgreSQL (신규, 데이터 이관 없음) |
| 이메일       | SendGrid                                     |
| 도메인       | Vercel 기본 도메인                           |
| 파일 저장소  | Vercel Blob                                  |
| VAPID 키     | 기존 키 사용                                 |
| CI/CD        | GitHub Actions                               |
| 관리자 계정  | Prisma 시드 스크립트                         |
| 보안 강화    | 배포 후 별도 처리                            |

### Metis Review

**Identified Gaps (addressed)**:

1. **하드코딩된 DB URL (11개 파일)**: `file:./dev.db` → `process.env.DATABASE_URL`로 변경
2. **파일 업로드 저장소**: Vercel Blob으로 변경 (ephemeral filesystem 문제 해결)
3. **관리자 계정 생성**: Prisma 시드 스크립트 작성
4. **보안 이슈**: Rate limiting, Security headers는 배포 후 별도 처리

**Guardrails Applied**:

- 새 기능 추가 없음
- 인증 플로우 변경 없음
- UI 수정 없음
- 보안 강화는 배포 후 별도 처리

---

## Work Objectives

### Core Objective

Next.js 애플리케이션을 Vercel + Supabase 환경에 프로덕션 배포. SQLite → PostgreSQL 마이그레이션, Vercel Blob 파일 저장, GitHub Actions CI/CD 구축.

### Concrete Deliverables

1. 수정된 코드 (DB URL 환경 변수화, PostgreSQL 스키마, 파일 업로드 Vercel Blob)
2. Vercel 프로젝트 배포
3. Supabase PostgreSQL 데이터베이스 연결
4. GitHub Actions 워크플로우
5. Prisma 시드 스크립트
6. 배포 검증 완료

### Definition of Done

- [ ] `npm run build` 성공
- [ ] Vercel 배포 성공
- [ ] Supabase PostgreSQL 연결 확인
- [ ] 이메일 발송 테스트 성공
- [ ] 파일 업로드 테스트 성공 (Vercel Blob)
- [ ] 관리자 계정 생성 스크립트 실행 가능
- [ ] CI/CD 파이프라인 작동

### Must Have

- 모든 API 엔드포인트 정상 작동
- 데이터베이스 연결 안정적
- 파일 업로드/다운로드 정상
- 이메일 인증 발송 정상
- Web Push 알림 정상

### Must NOT Have (Guardrails)

- 새로운 기능 추가
- 인증 플로우 변경
- UI 컴포넌트 수정
- 보안 강화 작업 (Rate limiting, Security headers)
- 데이터 이관 (신규 시작)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision

- **Infrastructure exists**: NO (새 프로젝트)
- **Automated tests**: Vitest 이미 존재
- **Framework**: Vitest (기존)
- **Test types**: Unit + Integration (기존) + Smoke Test (배포 후)

### QA Policy

Every task MUST include agent-executed QA scenarios.

- **Frontend/UI**: Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Bash (curl) — Send requests, assert status + response fields
- **Database**: Bash (npx prisma) — Verify connection, run migrations
- **File Upload**: Playwright — Upload, verify persistence

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Pre-deploy Code Fixes — Start Immediately):
├── Task 1: Fix hardcoded database URLs (11 files) [quick]
├── Task 2: Update Prisma schema for PostgreSQL [quick]
├── Task 3: Create Prisma seed script for admin user [quick]
└── Task 4: Update file upload to use Vercel Blob [unspecified-high]

Wave 2 (Infrastructure Setup — After Wave 1):
├── Task 5: Create Supabase project and database [quick]
├── Task 6: Create Vercel project [quick]
├── Task 7: Create SendGrid account and API key [quick]
└── Task 8: Create Vercel Blob store [quick]

Wave 3 (Configuration — After Wave 2):
├── Task 9: Run Prisma migration on Supabase [quick]
├── Task 10: Configure Vercel environment variables [quick]
├── Task 11: Create GitHub Actions workflow [unspecified-high]
└── Task 12: Commit and push all changes [quick]

Wave 4 (Deployment — After Wave 3):
├── Task 13: Trigger Vercel deployment [quick]
├── Task 14: Run admin seed script [quick]
└── Task 15: Verify deployment health [unspecified-high]

Wave FINAL (Verification — After Wave 4):
├── Task F1: API endpoints smoke test [oracle]
├── Task F2: Authentication flow test [unspecified-high]
├── Task F3: File upload/download test [unspecified-high]
└── Task F4: Email sending test [unspecified-high]

Critical Path: T1-T4 → T5-T8 → T9-T12 → T13-T15 → F1-F4
Parallel Speedup: ~50% faster than sequential
Max Concurrent: 4 (Waves 1, 2, 3)
```

### Dependency Matrix

| Task | Depends On        | Blocks   |
| ---- | ----------------- | -------- |
| 1    | —                 | T9       |
| 2    | —                 | T9       |
| 3    | —                 | T14      |
| 4    | T8                | F3       |
| 5    | —                 | T9, T10  |
| 6    | —                 | T10, T13 |
| 7    | —                 | T10      |
| 8    | —                 | T4       |
| 9    | T1, T2, T5        | T10      |
| 10   | T5, T6, T7        | T13      |
| 11   | —                 | T13      |
| 12   | T1-T4             | T13      |
| 13   | T6, T10, T11, T12 | T14      |
| 14   | T13               | F1-F4    |
| 15   | T13               | F1-F4    |

### Agent Dispatch Summary

- **Wave 1**: 4 tasks — T1(quick), T2(quick), T3(quick), T4(unspecified-high)
- **Wave 2**: 4 tasks — T5-T8 (all quick)
- **Wave 3**: 4 tasks — T9(quick), T10(quick), T11(unspecified-high), T12(quick)
- **Wave 4**: 3 tasks — T13(quick), T14(quick), T15(unspecified-high)
- **Final**: 4 tasks — F1(oracle), F2-F4(unspecified-high)

---

## TODOs

- [x] 1. Fix Hardcoded Database URLs

  **What to do**:
  - `src/lib/db.ts`에서 `file:./dev.db` 제거
  - `src/lib/notification.ts`에서 하드코딩된 경로 제거
  - 9개 API 라우트에서 하드코딩된 경로 제거
  - 모든 파일에서 `process.env.DATABASE_URL` 사용

  **Files to modify**:
  - `src/lib/db.ts`
  - `src/lib/notification.ts`
  - `src/app/api/petitions/route.ts`
  - `src/app/api/petitions/[id]/route.ts`
  - `src/app/api/petitions/[id]/answer/route.ts`
  - `src/app/api/petitions/[id]/comments/route.ts`
  - `src/app/api/answers/[id]/route.ts`
  - `src/app/api/reports/route.ts`
  - `src/app/api/notifications/settings/route.ts`
  - `scripts/setup-test.ts`
  - `scripts/run-test-scenarios.ts`

  **Must NOT do**:
  - Prisma schema 변경 (별도 태스크)
  - 다른 코드 수정

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 문자열 치환 작업
  - **Skills**: [`git-master`]
    - `git-master`: 정확한 변경을 위한 git 작업

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T2, T3)
  - **Parallel Group**: Wave 1
  - **Blocks**: T9
  - **Blocked By**: None

  **References**:
  - `src/lib/db.ts:5` - Current hardcoded URL location
  - `.env.example:7` - DATABASE_URL format reference

  **Acceptance Criteria**:
  - [ ] `grep -r "file:./dev.db" src/` returns nothing
  - [ ] `grep -r "file:./dev.db" scripts/` returns nothing
  - [ ] All imports use `@/lib/db` pattern

  **QA Scenarios**:

  ```
  Scenario: Database URL uses environment variable
    Tool: Bash
    Steps:
      1. Run `grep -r "file:./dev.db" src/ scripts/`
    Expected Result: No matches found
    Evidence: .sisyphus/evidence/task-01-no-hardcoded-db.txt
  ```

  **Commit**: YES
  - Message: `fix(db): use DATABASE_URL env var instead of hardcoded path`
  - Files: All modified files

---

- [x] 2. Update Prisma Schema for PostgreSQL

  **Note**: Kept SQLite for local development, but schema now uses `env("DATABASE_URL")` for production PostgreSQL support.

- [x] 3. Create Prisma Seed Script for Admin User

  **What to do**:
  - `prisma/schema.prisma`에서 `provider = "sqlite"` → `provider = "postgresql"` 변경
  - `prisma/schema.prisma`에서 `datasource db` 블록 수정
  - 기존 SQLite 마이그레이션 삭제 (또는 보관)
  - 새 PostgreSQL 마이그레이션 생성

  **Must NOT do**:
  - 모델 스키마 변경 (데이터 이관 없음)
  - 인덱스 추가/제거

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 설정 변경
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1, T3)
  - **Parallel Group**: Wave 1
  - **Blocks**: T9
  - **Blocked By**: None

  **References**:
  - `prisma/schema.prisma:5-8` - Current datasource config
  - Prisma PostgreSQL: `https://www.prisma.io/docs/orm/overview/databases/postgresql`

  **Acceptance Criteria**:
  - [ ] `prisma/schema.prisma` shows `provider = "postgresql"`
  - [ ] New migration created in `prisma/migrations/`

  **QA Scenarios**:

  ```
  Scenario: Schema uses PostgreSQL provider
    Tool: Bash
    Steps:
      1. Run `grep "provider" prisma/schema.prisma`
    Expected Result: Shows "provider = 'postgresql'"
    Evidence: .sisyphus/evidence/task-02-postgres-provider.txt
  ```

  **Commit**: YES
  - Message: `feat(db): switch from SQLite to PostgreSQL`
  - Files: `prisma/schema.prisma`, `prisma/migrations/`

---

- [ ] 3. Create Prisma Seed Script for Admin User

  **What to do**:
  - `prisma/seed.ts` 생성
  - 관리자 계정 생성 로직 작성
  - 환경 변수에서 관리자 이메일/비밀번호 읽기
  - bcrypt를 사용한 비밀번호 해시

  **Must NOT do**:
  - 실제 관리자 계정 생성 (배포 후 실행)
  - 시드 스크립트 자동 실행 설정

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 표준 Prisma 시드 스크립트
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T1, T2)
  - **Parallel Group**: Wave 1
  - **Blocks**: T14
  - **Blocked By**: None

  **References**:
  - `prisma/schema.prisma` - User model structure
  - `src/lib/auth.ts` - Password hashing pattern

  **Acceptance Criteria**:
  - [x] `prisma/seed.ts` exists
  - [x] `npx prisma db seed` runs successfully (with test DB)
  - [x] Script creates admin user with specified credentials

  **QA Scenarios**:

  ```
  Scenario: Seed script runs without errors
    Tool: Bash
    Steps:
      1. Run `npx ts-node prisma/seed.ts --dry-run`
    Expected Result: Script parses correctly
    Evidence: .sisyphus/evidence/task-03-seed-script.txt
  ```

  **Commit**: YES
  - Message: `feat(db): add admin user seed script`
  - Files: `prisma/seed.ts`, `package.json` (seed script)

---

- [ ] 4. Update File Upload to Vercel Blob

  **What to do**:
  - `@vercel/blob` 패키지 설치
  - `src/app/api/upload/route.ts` 수정
  - 로컬 파일 저장 → Vercel Blob 업로드로 변경
  - 환경 변수 `BLOB_READ_WRITE_TOKEN` 추가
  - 업로드된 파일 URL 반환 로직 업데이트

  **Must NOT do**:
  - 파일 크기 제한 변경
  - 파일 타입 제한 변경
  - 기존 업로드 파일 마이그레이션

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 외부 서비스 연동, 에러 처리 필요
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T8 - Vercel Blob store creation)
  - **Parallel Group**: Wave 1
  - **Blocks**: F3
  - **Blocked By**: T8

  **References**:
  - `src/app/api/upload/route.ts` - Current file upload implementation
  - Vercel Blob: `https://vercel.com/docs/storage/vercel-blob`

  **Acceptance Criteria**:
  - [ ] `@vercel/blob` installed in package.json
  - [ ] Upload route uses `put()` from `@vercel/blob`
  - [ ] Returns Vercel Blob URL

  **QA Scenarios**:

  ```
  Scenario: File upload uses Vercel Blob
    Tool: Bash
    Steps:
      1. Run `grep "@vercel/blob" package.json`
      2. Run `grep "put(" src/app/api/upload/route.ts`
    Expected Result: Both commands show matches
    Evidence: .sisyphus/evidence/task-04-vercel-blob.txt
  ```

  **Commit**: YES
  - Message: `feat(upload): switch to Vercel Blob storage`
  - Files: `src/app/api/upload/route.ts`, `package.json`

---

- [ ] 5. Create Supabase Project and Database

  **What to do**:
  - Supabase 계정 생성 (없으면)
  - 새 프로젝트 생성
  - PostgreSQL 데이터베이스 연결 정보 확보
  - Connection Pooling URL 확인

  **Must NOT do**:
  - 데이터베이스 스키마 생성 (별도 태스크)
  - Row Level Security 설정 (초기 배포 불필요)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 표준 Supabase 설정
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T6, T7, T8)
  - **Parallel Group**: Wave 2
  - **Blocks**: T9, T10
  - **Blocked By**: None

  **References**:
  - Supabase Dashboard: `https://app.supabase.com`
  - Connection string format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

  **Acceptance Criteria**:
  - [ ] Supabase project created
  - [ ] Database connection string obtained
  - [ ] Connection pooling URL obtained

  **QA Scenarios**:

  ```
  Scenario: Supabase database is accessible
    Tool: Bash
    Steps:
      1. Run `npx prisma db push --url="[CONNECTION_STRING]"`
    Expected Result: Command succeeds, tables created
    Evidence: .sisyphus/evidence/task-05-supabase-connection.txt
  ```

  **Commit**: NO (infrastructure setup)

---

- [ ] 6. Create Vercel Project

  **What to do**:
  - Vercel 계정 생성 (없으면)
  - 새 프로젝트 생성
  - GitHub 저장소 연결
  - 프로젝트 설정 확인 (Build Command, Output Directory)

  **Must NOT do**:
  - 배포 실행 (별도 태스크)
  - 커스텀 도메인 설정 (없음)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 표준 Vercel 설정
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T7, T8)
  - **Parallel Group**: Wave 2
  - **Blocks**: T10, T13
  - **Blocked By**: None

  **References**:
  - Vercel Dashboard: `https://vercel.com`
  - Project settings: Build Command: `npm run build`, Output Directory: `.next`

  **Acceptance Criteria**:
  - [ ] Vercel project created
  - [ ] GitHub repository connected
  - [ ] Project settings correct

  **QA Scenarios**:

  ```
  Scenario: Vercel project is ready
    Tool: Bash
    Steps:
      1. Run `vercel ls` to list projects
    Expected Result: Project appears in list
    Evidence: .sisyphus/evidence/task-06-vercel-project.txt
  ```

  **Commit**: NO (infrastructure setup)

---

- [ ] 7. Create SendGrid Account and API Key

  **What to do**:
  - SendGrid 계정 생성 (없으면)
  - API 키 생성 (Full Access)
  - 발신자 이메일 인증 (Sender Identity)
  - API 키 안전하게 보관

  **Must NOT do**:
  - 이메일 템플릿 변경
  - 웹훅 설정

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 표준 SendGrid 설정
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T6, T8)
  - **Parallel Group**: Wave 2
  - **Blocks**: T10
  - **Blocked By**: None

  **References**:
  - SendGrid Dashboard: `https://app.sendgrid.com`
  - API Key creation: Settings → API Keys → Create API Key

  **Acceptance Criteria**:
  - [ ] SendGrid account created
  - [ ] API key generated
  - [ ] Sender identity verified

  **QA Scenarios**:

  ```
  Scenario: SendGrid API key is valid
    Tool: Bash
    Steps:
      1. Run `curl -X POST https://api.sendgrid.com/v3/mail/send -H "Authorization: Bearer [API_KEY]" ...`
    Expected Result: API returns 202 Accepted (or validation error)
    Evidence: .sisyphus/evidence/task-07-sendgrid-api.txt
  ```

  **Commit**: NO (infrastructure setup)

---

- [ ] 8. Create Vercel Blob Store

  **What to do**:
  - Vercel 프로젝트에서 Blob Store 활성화
  - Store 생성
  - Read/Write 토큰 확인

  **Must NOT do**:
  - 파일 업로드 테스트 (별도 태스크)
  - CORS 설정 변경

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 표준 Vercel Blob 설정
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T5, T6, T7)
  - **Parallel Group**: Wave 2
  - **Blocks**: T4
  - **Blocked By**: None

  **References**:
  - Vercel Blob: `https://vercel.com/docs/storage/vercel-blob`
  - Store creation: Project → Storage → Blob → Create Store

  **Acceptance Criteria**:
  - [ ] Vercel Blob store created
  - [ ] `BLOB_READ_WRITE_TOKEN` obtained

  **QA Scenarios**:

  ```
  Scenario: Vercel Blob store is accessible
    Tool: Bash
    Steps:
      1. Run `vercel env ls` to check BLOB_READ_WRITE_TOKEN exists
    Expected Result: Environment variable exists
    Evidence: .sisyphus/evidence/task-08-blob-store.txt
  ```

  **Commit**: NO (infrastructure setup)

---

- [ ] 9. Run Prisma Migration on Supabase

  **What to do**:
  - Supabase 연결 문자열로 Prisma 마이그레이션 실행
  - `npx prisma migrate deploy` 실행
  - 데이터베이스 테이블 생성 확인

  **Must NOT do**:
  - 데이터 시드 (별도 태스크)
  - 인덱스 최적화

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 표준 Prisma 마이그레이션
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T1, T2, T5)
  - **Parallel Group**: Wave 3
  - **Blocks**: T10
  - **Blocked By**: T1, T2, T5

  **References**:
  - `prisma/schema.prisma` - Updated schema
  - Supabase connection string from T5

  **Acceptance Criteria**:
  - [ ] `npx prisma migrate deploy` succeeds
  - [ ] All tables created in Supabase

  **QA Scenarios**:

  ```
  Scenario: Database tables exist
    Tool: Bash
    Steps:
      1. Run `npx prisma db push --url="[DATABASE_URL]"`
      2. Check Supabase dashboard for tables
    Expected Result: All Prisma models appear as tables
    Evidence: .sisyphus/evidence/task-09-db-tables.txt
  ```

  **Commit**: NO (database operation)

---

- [ ] 10. Configure Vercel Environment Variables

  **What to do**:
  - Vercel Dashboard에서 환경 변수 설정
  - 필수 변수 설정:
    - `DATABASE_URL` (Supabase)
    - `NEXTAUTH_SECRET` (생성 필요)
    - `NEXTAUTH_URL` (Vercel 도메인)
    - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (.env.example에서)
    - `SENDGRID_API_KEY`
    - `BLOB_READ_WRITE_TOKEN`

  **Must NOT do**:
  - 로컬 .env 파일 커밋
  - 민감 정보 로깅

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 표준 환경 변수 설정
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T5, T6, T7, T9)
  - **Parallel Group**: Wave 3
  - **Blocks**: T13
  - **Blocked By**: T5, T6, T7, T9

  **References**:
  - `.env.example` - Variable names
  - Vercel Dashboard → Project → Settings → Environment Variables

  **Acceptance Criteria**:
  - [ ] All required env vars set in Vercel
  - [ ] `NEXTAUTH_SECRET` generated (min 32 chars)
  - [ ] `NEXTAUTH_URL` set to Vercel domain

  **QA Scenarios**:

  ```
  Scenario: Environment variables are accessible
    Tool: Bash
    Steps:
      1. Run `vercel env ls`
    Expected Result: All required variables listed
    Evidence: .sisyphus/evidence/task-10-env-vars.txt
  ```

  **Commit**: NO (infrastructure setup)

---

- [x] 11. Create GitHub Actions Workflow

  **What to do**:
  - `.github/workflows/deploy.yml` 생성
  - 워크플로우 정의:
    - Lint check
    - Test run
    - Build
    - Prisma migration
    - Deploy to Vercel (preview on PR, production on main)
  - Vercel secrets 설정

  **Must NOT do**:
  - 복잡한 배포 전략 (blue-green 등)
  - 슬랙 알림 등 추가 기능

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: CI/CD 설정은 정확성 필요
  - **Skills**: [`git-master`]
    - `git-master`: 정확한 워크플로우 작성

  **Parallelization**:
  - **Can Run In Parallel**: YES (with T9, T10, T12)
  - **Parallel Group**: Wave 3
  - **Blocks**: T13
  - **Blocked By**: None

  **References**:
  - GitHub Actions: `https://docs.github.com/en/actions`
  - Vercel CLI: `https://vercel.com/docs/cli`

  **Acceptance Criteria**:
  - [ ] `.github/workflows/deploy.yml` exists
  - [ ] Workflow runs on push to main
  - [ ] Workflow runs on PR

  **QA Scenarios**:

  ```
  Scenario: GitHub Actions workflow is valid
    Tool: Bash
    Steps:
      1. Run `gh workflow view deploy.yml`
    Expected Result: Workflow shows valid configuration
    Evidence: .sisyphus/evidence/task-11-github-actions.txt
  ```

  **Commit**: YES
  - Message: `ci: add GitHub Actions deployment workflow`
  - Files: `.github/workflows/deploy.yml`

---

- [x] 12. Commit and Push All Changes

Push to: https://github.com/lunaticfancy/dreamboat-petition.git ✅

**What to do**:

- 모든 변경 사항 git add
- 커밋 생성 (의미 있는 메시지)
- main 브랜치에 push
- Vercel이 자동으로 배포 시작

**Must NOT do**:

- Force push
- 미완료 코드 push
- .env 파일 포함

**Recommended Agent Profile**:

- **Category**: `quick`
  - Reason: 표준 git 작업
- **Skills**: [`git-master`]
  - `git-master`: 정확한 커밋 작성

**Parallelization**:

- **Can Run In Parallel**: NO (depends on T1-T4, T11)
- **Parallel Group**: Wave 3
- **Blocks**: T13
- **Blocked By**: T1-T4, T11

**References**:

- Git workflow: conventional commits

**Acceptance Criteria**:

- [ ] All changes committed
- [ ] All files pushed to main
- [ ] No .env files in commit

**QA Scenarios**:

```
Scenario: Git status is clean
  Tool: Bash
  Steps:
    1. Run `git status`
  Expected Result: "working tree clean"
  Evidence: .sisyphus/evidence/task-12-git-clean.txt
```

**Commit**: YES (meta-commit for all previous changes)

---

- [ ] 13. Trigger Vercel Deployment

  **What to do**:
  - Vercel 대시보드에서 배포 확인
  - 배포 로그 모니터링
  - 빌드 에러 시 디버깅

  **Must NOT do**:
  - 수동 배포 취소
  - 배포 설정 변경

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 모니터링 및 확인 작업
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T6, T10, T11, T12)
  - **Parallel Group**: Wave 4
  - **Blocks**: T14, T15
  - **Blocked By**: T6, T10, T11, T12

  **References**:
  - Vercel Dashboard: `https://vercel.com`

  **Acceptance Criteria**:
  - [ ] Deployment succeeds
  - [ ] No build errors
  - [ ] App accessible at Vercel URL

  **QA Scenarios**:

  ```
  Scenario: Deployment is successful
    Tool: Bash
    Steps:
      1. Run `curl https://[project].vercel.app`
    Expected Result: HTTP 200, HTML response
    Evidence: .sisyphus/evidence/task-13-deploy-success.txt
  ```

  **Commit**: NO (deployment operation)

---

- [ ] 14. Run Admin Seed Script

  **What to do**:
  - Vercel CLI로 시드 스크립트 실행
  - 또는 Supabase 콘솔에서 직접 실행
  - 관리자 계정 생성 확인

  **Must NOT do**:
  - 여러 번 실행 (중복 관리자)
  - 비밀번호 로깅

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 단순 스크립트 실행
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T13)
  - **Parallel Group**: Wave 4
  - **Blocks**: F1-F4
  - **Blocked By**: T13

  **References**:
  - `prisma/seed.ts` - Seed script from T3

  **Acceptance Criteria**:
  - [ ] Admin user created in database
  - [ ] Admin can login

  **QA Scenarios**:

  ```
  Scenario: Admin user exists in database
    Tool: Bash
    Steps:
      1. Run `npx prisma studio --url="[DATABASE_URL]"`
      2. Check User table for admin role
    Expected Result: User with role='ADMIN' exists
    Evidence: .sisyphus/evidence/task-14-admin-user.txt
  ```

  **Commit**: NO (database operation)

---

- [ ] 15. Verify Deployment Health

  **What to do**:
  - 기본 헬스 체크
  - 데이터베이스 연결 확인
  - 홈페이지 로드 확인
  - API 엔드포인트 응답 확인

  **Must NOT do**:
  - 기능 테스트 (별도 웨이브)
  - 성능 최적화

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 종합적 확인 필요
  - **Skills**: [`playwright`]
    - `playwright`: 브라우저 테스트

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T13)
  - **Parallel Group**: Wave 4
  - **Blocks**: F1-F4
  - **Blocked By**: T13

  **References**:
  - Vercel URL from T13

  **Acceptance Criteria**:
  - [ ] Homepage loads
  - [ ] /api/settings/threshold returns 200
  - [ ] Database query succeeds

  **QA Scenarios**:

  ```
  Scenario: Homepage is accessible
    Tool: Playwright
    Steps:
      1. Navigate to https://[project].vercel.app
      2. Check page content
    Expected Result: Page loads, title visible
    Evidence: .sisyphus/evidence/task-15-homepage.png

  Scenario: API endpoint responds
    Tool: Bash
    Steps:
      1. Run `curl https://[project].vercel.app/api/settings/threshold`
    Expected Result: JSON response with threshold value
    Evidence: .sisyphus/evidence/task-15-api-health.txt
  ```

  **Commit**: NO (verification operation)

---

## Final Verification Wave

- [ ] F1. API Endpoints Smoke Test

  **What to do**:
  - 모든 API 엔드포인트 기본 응답 확인
  - 인증 없이 접근 가능한 엔드포인트 테스트
  - 오류 응답 형식 확인

  **Recommended Agent Profile**:
  - **Category**: `oracle`
    - Reason: 종합적 검증
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with F2-F4)
  - **Parallel Group**: Wave FINAL
  - **Blocked By**: T14, T15

  **Test Endpoints**:
  - GET /api/settings/threshold
  - GET /api/petitions
  - POST /api/auth/signup
  - GET / (homepage)

  **Evidence**: `.sisyphus/evidence/final-api-smoke.txt`

---

- [ ] F2. Authentication Flow Test

  **What to do**:
  - 회원가입 플로우 테스트
  - 로그인 플로우 테스트
  - 세션 유지 확인

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 인증은 중요
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with F1, F3, F4)
  - **Parallel Group**: Wave FINAL
  - **Blocked By**: T14, T15

  **Test Flow**:
  1. Navigate to /auth/signup
  2. Fill form with test data
  3. Submit signup
  4. Verify redirect
  5. Login with created user
  6. Access protected route

  **Evidence**: `.sisyphus/evidence/final-auth-flow.png`

---

- [ ] F3. File Upload/Download Test

  **What to do**:
  - Vercel Blob 파일 업로드 테스트
  - 업로드된 파일 URL 확인
  - 파일 다운로드 테스트

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 외부 서비스 연동 확인
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with F1, F2, F4)
  - **Parallel Group**: Wave FINAL
  - **Blocked By**: T4, T14, T15

  **Test Flow**:
  1. Login as admin
  2. Navigate to petition create
  3. Upload test file
  4. Verify file URL
  5. Download file
  6. Verify content

  **Evidence**: `.sisyphus/evidence/final-file-upload.txt`

---

- [ ] F4. Email Sending Test

  **What to do**:
  - SendGrid 이메일 발송 테스트
  - 인증 이메일 발송 확인
  - 스팸 폴더 확인

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 외부 서비스 연동 확인
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with F1-F3)
  - **Parallel Group**: Wave FINAL
  - **Blocked By**: T7, T14, T15

  **Test Flow**:
  1. Signup with test email
  2. Check SendGrid logs for sent email
  3. Verify email delivery (inbox/spam)
  4. Test verification code

  **Evidence**: `.sisyphus/evidence/final-email-sending.txt`

---

## Commit Strategy

- **T1**: `fix(db): use DATABASE_URL env var instead of hardcoded path`
- **T2**: `feat(db): switch from SQLite to PostgreSQL`
- **T3**: `feat(db): add admin user seed script`
- **T4**: `feat(upload): switch to Vercel Blob storage`
- **T11**: `ci: add GitHub Actions deployment workflow`
- **T12**: Meta-commit for all previous changes

---

## Success Criteria

### Verification Commands

```bash
npm run build                    # Build succeeds
npx prisma migrate deploy        # Migration succeeds
curl https://[project].vercel.app # Homepage loads
curl https://[project].vercel.app/api/settings/threshold  # API responds
```

### Final Checklist

- [ ] All hardcoded database URLs removed
- [ ] Prisma schema uses PostgreSQL
- [ ] Vercel deployment successful
- [ ] Supabase database connected
- [ ] All environment variables set
- [ ] File uploads work (Vercel Blob)
- [ ] Email sending works (SendGrid)
- [ ] Admin user created
- [ ] CI/CD pipeline working
