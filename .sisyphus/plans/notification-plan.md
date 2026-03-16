# 웹 브라우저 알림 기능 구현 계획

## 요구사항

1. 새로운 청원 등록 시 알림
2. 신고 발생 시 알림
3. 청원 목표 인원 달성 시 알림
4. 알림 설정 메뉴 (개별 활성화/비활성화)

## 구현 계획

### Phase 1: 데이터베이스 설정

1. User 테이블에 알림 설정 필드 추가
   - notifyNewPetition: boolean
   - notifyNewReport: boolean
   - notifyThresholdReached: boolean
   - pushSubscription: string (JSON)

### Phase 2: 웹 푸시 설정

1. Service Worker 등록
2. VAPID 키 생성 및 환경변수 추가
3. PushSubscription 관리 API

### Phase 3: 백엔드 API

1. POST /api/notifications/subscribe - 푸시 구독
2. DELETE /api/notifications/unsubscribe - 푸시 구독 해지
3. GET /api/notifications/settings - 알림 설정 조회
4. PUT /api/notifications/settings - 알림 설정 수정

### Phase 4: 알림 트리거

1. 새 청원 작성 시 -notifyNewPetition=true인 사용자에게 알림
2. 신고 발생 시 -notifyNewReport=true인 사용자에게 알림
3. 동의 수 달성 시 -notifyThresholdReached=true인 사용자에게 알림

### Phase 5: 프론트엔드

1. 알림 설정 페이지 (/settings/notifications)
2. 대시보드에 알림 설정 링크
3. 브라우저 알림 권한 요청 UI

### Phase 6: Service Worker

1. service-worker.js 생성
2. 푸시 메시지 수신 및 알림 표시
