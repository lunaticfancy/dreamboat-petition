# 답변 후 의견 추가 기능 구현 계획

## 현재 상황 분석

### 이미 구현된 기능

1. **코멘트 API** (`/api/petitions/[id]/comments`)
   - GET: 코멘트 목록 조회
   - POST: 코멘트 작성
   - parentId 지원 (대댓글 기능)
   - isStaff 플래그로 선생님/원장 코멘트 구분

2. **답변(Answer) 시스템**
   - 선생님/원장/관리자만 작성 가능
   - PENDING_ANSWER → ANSWERED 상태 변경

3. **청원 상태**
   - OPEN → PENDING_ANSWER → ANSWERED → CLOSED

## 요구사항

### 기능 정의

1. **원장/선생님이 답변을 달았지만 완료되지 않은 경우**
   - ANSWERED 상태에서 추가 대화/의견 교환이 필요한 상황

2. **작성자가 답변에 재답변**
   - 답변에 대한 피드백, 추가 질문, 이의 제기 등

3. **다른 사용자가 의견 추가**
   - 관련된 다른 학부모들의 의견, 지지, 반대 등

## 구현 계획

### Phase 1: UI/UX 개선

**목표**: 청원 상세 페이지에 코멘트/의견 섹션 통합

1. **코멘트 섹션 추가** (청원 상세 페이지 하단)
   - 기존 답변(Answer) 아래에 위치
   - 탭 또는 섹션 구분: "답변" / "의견 및 댓글"

2. **코멘트 작성 폼**
   - 로그인한 모든 사용자 작성 가능
   - 익명 사용자는 익명키로 작성 가능 (선택적)
   - placeholder: "의견을 작성해주세요..."

3. **코멘트 목록 표시**
   - 작성자 역할 표시 (학부모/선생님/원장)
   - 작성 시간
   - 대댓글(답글) 기능
   - 무한 스크롤 또는 페이지네이션

4. **작성자 특별 표시**
   - 청원 작성자가 쓴 코멘트는 "작성자" 배지 표시
   - 선생님/원장 코멘트는 "공식" 배지 표시

### Phase 2: 상태 및 흐름 개선

**목표**: ANSWERED 상태에서도 의견 교환 가능

1. **상태별 코멘트 작성 권한**
   - OPEN: 모든 로그인 사용자
   - PENDING_ANSWER: 모든 로그인 사용자
   - ANSWERED: 모든 로그인 사용자 (새로 추가)
   - CLOSED: 코멘트 작성 불가 (읽기만 가능)

2. **선생님/원장의 추가 답변**
   - ANSWERED 상태에서도 코멘트로 추가 설명 가능
   - 기존 답변은 수정 불가 (이력 남기기 위해)
   - 새로운 코멘트로 추가 정보 제공

3. **작성자의 "해결됨" 표시**
   - 작성자가 답변에 만족하면 "해결됨" 표시 가능
   - 또는 관리자가 CLOSED 상태로 변경

### Phase 3: 알림 및 UX 개선

**목표**: 참여자들에게 변경사항 알림

1. **실시간 업데이트** (선택)
   - 새 코멘트 작성 시 자동 새로고침
   - 또는 폴링으로 주기적 업데이트

2. **참여자 알림**
   - 새 코멘트 작성 시 관련자에게 알림
   - 작성자, 기존 코멘트 작성자 등

### Phase 4: 데이터 모델 (현재 상태 확인)

**Prisma Schema에 이미 존재하는 Comment 모델:**

```prisma
model Comment {
  id         String    @id @default(cuid())
  content    String
  userId     String
  petitionId String
  parentId   String?   // 대댓글 지원
  isStaff    Boolean   @default(false)
  staffRole  String?   // TEACHER or DIRECTOR
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
```

### Phase 5: 구현할 파일 목록

1. **프론트엔드**
   - `src/app/petitions/[id]/page.tsx` - 코멘트 섹션 추가
   - `src/components/comment-section.tsx` - 새 컴포넌트 (권장)
   - `src/components/comment-form.tsx` - 코멘트 작성 폼
   - `src/components/comment-item.tsx` - 개별 코멘트 표시

2. **백엔드**
   - 이미 구현됨: `/api/petitions/[id]/comments`
   - 수정 필요: 상태 확인 로직 (ANSWERED 상태에서도 코멘트 가능하도록)

## 구현 우선순위

### High Priority (필수)

1. ✅ 코멘트 섹션 UI 추가
2. ✅ 코멘트 작성 폼
3. ✅ 코멘트 목록 표시
4. ✅ 작성자/관리자 배지 표시

### Medium Priority (권장)

5. 대댓글(답글) 기능 UI
6. ANSWERED 상태에서 코멘트 가능하도록 API 수정
7. "해결됨" 표시 기능

### Low Priority (선택)

8. 실시간 업데이트
9. 알림 기능
10. 무한 스크롤

## 성공 기준 (Acceptance Criteria)

1. ANSWERED 상태의 청원에서도 사용자가 코멘트를 작성할 수 있다
2. 청원 작성자는 자신의 청원에 "작성자" 표시로 코멘트를 남길 수 있다
3. 선생님/원장은 "공식" 표시로 추가 설명을 코멘트로 남길 수 있다
4. 모든 사용자는 기존 답변과 코멘트를 볼 수 있다
5. 대댓글(답글) 기능이 작동한다
6. CLOSED 상태에서는 코멘트 작성이 불가능하다 (읽기만 가능)

## 테스트 시나리오

1. **학부모 A**가 청원 작성 (OPEN)
2. **학부모 B, C**가 동의 (OPEN → PENDING_ANSWER)
3. **원장**이 답변 작성 (PENDING_ANSWER → ANSWERED)
4. **학부모 A**가 답변에 대한 재질문 코멘트 작성
5. **원장**이 추가 설명 코멘트 작성
6. **학부모 D**가 관련 의견 코멘트 작성
7. **학부모 A**가 "해결됨" 표시 (또는 관리자가 CLOSED로 변경)
8. 더 이상 코멘트 작성 불가 (읽기만 가능)
