# 테스트 시나리오 자동화 계획

## TL;DR

> **작업 목표**: IP 마스킹, 직원 라벨, 폼 제출 등 6가지 기능에 대한 자동화 테스트 작성
>
> **산출물**:
>
> - `src/lib/mask-ip.test.ts` - IP 마스킹 단위 테스트
> - `src/components/__tests__/comment-section.test.tsx` - 댓글 컴포넌트 통합 테스트
> - `src/app/api/petitions/[id]/comments/__tests__/route.test.ts` - API 엔드포인트 테스트

## Context

### 원본 요청

사용자가 테스트 시나리오 작성을 요청하여 다음 6가지 영역에 대한 자동화 테스트를 계획함:

1. 댓글 IP 주소 마스킹
2. 직원 라벨 표시 (관리자/원장/선생님)
3. 다크모드 제거 확인
4. 댓글 작성 폼
5. 청원 목록 댓글 수
6. 알림 설정 메뉴

### 기존 테스트 인프라

- **프레임워크**: Vitest
- **테스트 라이브러리**: @testing-library/react
- **환경**: jsdom
- **설정 파일**: `vitest.config.ts`, `src/test/setup.ts`
- **기존 테스트**: `src/lib/email/*.test.ts`

---

## Work Objectives

### Core Objective

6가지 기능 영역에 대한 자동화 테스트 작성

### Concrete Deliverables

1. IP 마스킹 순수 함수 단위 테스트
2. CommentSection 컴포넌트 통합 테스트
3. Comments API 엔드포인트 테스트

### Definition of Done

- [ ] `npm run test` 실행 시 모든 테스트 통과
- [ ] IP 마스킹 12개 테스트 케이스 통과
- [ ] 직원 라벨 렌더링 테스트 통과
- [ ] API 응답 필드 테스트 통과

---

## Verification Strategy

- **단위 테스트**: Vitest로 함수 로직 검증
- **컴포넌트 테스트**: @testing-library/react로 렌더링 검증
- **API 테스트**: 모의 요청/응답으로 엔드포인트 검증

---

## TODOs

- [x] 1. IP 마스킹 함수 단위 테스트 작성

  **What to do**:
  - `src/lib/mask-ip.test.ts` 파일 생성
  - maskIpAddress 함수 테스트 케이스 작성
  - IPv4, IPv6, null, unknown, invalid 케이스 커버

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [] (순수 함수 테스트)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/lib/email/email.test.ts` - 기존 테스트 패턴 참고

  **Acceptance Criteria**:
  - [ ] IPv4 마스킹 테스트 (일반 IP, localhost)
  - [ ] IPv6 마스킹 테스트 (localhost, 일반 IPv6)
  - [ ] 예외 케이스 테스트 (null, unknown, invalid)

  **Commit**: YES
  - Message: `test: add IP masking unit tests`
  - Files: `src/lib/mask-ip.test.ts`

---

- [x] 2. 댓글 컴포넌트 통합 테스트 작성

  **What to do**:
  - `src/components/__tests__/comment-section.test.tsx` 파일 생성
  - CommentSection 컴포넌트 직원 라벨 렌더링 테스트
  - IP 마스킹 표시 테스트
  - 폼 제출 테스트

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/components/comment-section.tsx` - 테스트 대상 컴포넌트
  - `src/test/setup.ts` - 테스트 설정 파일

  **Acceptance Criteria**:
  - [ ] 관리자 댓글에 "관리자" 라벨 표시
  - [ ] 원장 댓글에 "원장" 라벨 표시
  - [ ] 선생님 댓글에 "선생님" 라벨 표시
  - [ ] 학부모 댓글에 IP 주소 마스킹 표시

  **Commit**: YES
  - Message: `test: add comment section integration tests`
  - Files: `src/components/__tests__/comment-section.test.tsx`

---

- [x] 3. Comments API 엔드포인트 테스트 작성

  **What to do**:
  - `src/app/api/petitions/[id]/comments/__tests__/route.test.ts` 파일 생성
  - GET 요청 응답 필드 테스트
  - IP 마스킹 응답 테스트
  - 직원 정보 응답 테스트

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/app/api/petitions/[id]/comments/route.ts` - 테스트 대상 API

  **Acceptance Criteria**:
  - [ ] GET 응답에 anonymousId 필드 포함
  - [ ] GET 응답에 isStaff, staffRole 필드 포함
  - [ ] IPv4 마스킹 응답 검증
  - [ ] IPv6 마스킹 응답 검증

  **Commit**: YES
  - Message: `test: add comments API endpoint tests`
  - Files: `src/app/api/petitions/[id]/comments/__tests__/route.test.ts`

---

## Final Verification Wave

- [x] F1. **테스트 실행 검증**
  ```bash
  npm run test:run
  ```
  모든 테스트 통과 확인 (60개 테스트 모두 통과)

---

## Success Criteria

### Verification Commands

```bash
npm run test:run
# Expected: All tests passed
```

### Final Checklist

- [x] 모든 테스트 파일 생성
- [x] `npm run test:run` 통과
- [x] IP 마스킹 12개 케이스 커버
- [x] 직원 라벨 4개 케이스 커버
