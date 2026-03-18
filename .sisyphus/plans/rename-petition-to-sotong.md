# 청원 → 소통함 용어 변경

## TL;DR

> **Quick Summary**: 홈페이지 전체에서 "청원"을 "소통함"으로 변경
>
> **Deliverables**:
>
> - 네비게이션, 대시보드, 관리자 페이지 등 모든 UI 텍스트 변경
>
> **Estimated Effort**: Quick
> **Parallel Execution**: YES - 파일별로 독립 작업 가능
> **Critical Path**: 파일 수정 → 검증

---

## Context

### Original Request

사용자가 "청원"이라는 용어가 학부모 중심적으로 느껴진다고 판단하여, 시스템 이름("어린이집 소통 창구")과 잘 어울리는 "소통함"으로 변경 요청

### Interview Summary

**Key Discussions**:

- "청원"은 무겁고 학부모가 일방적으로 요청하는 느낌
- "소통함"은 시스템 이름과 일치하며 가볍고 친근한 표현
- URL 경로(`/petitions`)는 유지, UI 텍스트만 변경

---

## Work Objectives

### Core Objective

홈페이지 모든 UI에서 "청원"을 "소통함"으로 변경

### Concrete Deliverables

- 네비게이션: "청원 목록/작성" → "소통함 목록/작성"
- 대시보드: "전체 청원" → "전체 소통함"
- 관리자 페이지: "청원 관리" → "소통함 관리"
- 설정: "청원 설정" → "소통함 설정"

### Must Have

- 모든 "청원" 텍스트를 "소통함"으로 변경

### Must NOT Have (Guardrails)

- URL 경로(`/petitions`) 변경 금지
- "동의" 등 다른 용어 변경 금지

---

## TODOs

- [x] 1. 네비게이션 컴포넌트 수정 (navigation.tsx)

  **What to do**:
  - "청원 목록" → "소통함 목록"
  - "청원 작성" → "소통함 작성"

  **Files**: `src/components/navigation.tsx`

- [x] 2. 대시보드 페이지 수정 (dashboard/page.tsx)

  **What to do**:
  - "전체 청원" → "전체 소통함"
  - "등록된 청원" → "등록된 소통함"
  - "답변 완료된 청원" → "답변 완료된 소통함"
  - "최근 청원" → "최근 소통함"
  - "청원 관리" → "소통함 관리"
  - "새 청원 작성" → "새 소통함 작성"

  **Files**: `src/app/dashboard/page.tsx`

- [x] 3. 관리자 페이지 수정 (admin/page.tsx, admin/petitions/page.tsx)

  **What to do**:
  - "청원 관리" → "소통함 관리"
  - "청원이 없습니다" → "소통함이 없습니다"
  - "청원 병합" → "소통함 병합"
  - 기타 모든 "청원" 텍스트

  **Files**: `src/app/admin/page.tsx`, `src/app/admin/petitions/page.tsx`

- [x] 4. 신고 페이지 수정 (admin/reports/page.tsx)

  **What to do**:
  - "신고된 청원" → "신고된 소통함"
  - "청원 보이기/숨기기" → "소통함 보이기/숨기기"
  - "청원에서 보기" → "소통함에서 보기"

  **Files**: `src/app/admin/reports/page.tsx`

- [x] 5. 설정 페이지 수정 (admin/settings/page.tsx, settings/notifications/page.tsx)

  **What to do**:
  - "청원 설정" → "소통함 설정"
  - "청원 관련 기본 설정" → "소통함 관련 기본 설정"
  - "새로운 청원 알림" → "새로운 소통함 알림"

  **Files**: `src/app/admin/settings/page.tsx`, `src/app/settings/notifications/page.tsx`

- [x] 6. 청원 상세/작성 페이지 수정

  **What to do**:
  - 페이지 제목 및 설명 텍스트에서 "청원" → "소통함"

  **Files**: `src/app/petitions/[id]/page.tsx`, `src/app/petitions/new/page.tsx`

- [x] 7. 홈페이지 메인 수정

  **What to do**:
  - 메인 페이지에서 "청원" → "소통함"

  **Files**: `src/app/page.tsx`

---

## Final Verification Wave

- [ ] F1. grep으로 모든 "청원" 검색 → 변경되지 않은 부분 확인

---

## Success Criteria

### Verification Commands

```bash
grep -r "청원" src/ --include="*.tsx" |
```

### Final Checklist

- [ ] 모든 UI에서 "청원"이 "소통함"으로 변경됨
- [ ] URL 경로는 `/petitions`로 유지됨
