# 동상일몽 Monorepo

동상일몽 (同床一夢) is a travel companion matching service built with a pnpm-based monorepo. It currently ships:
- Next.js 15 + Tailwind 프론트엔드 (App Router)
- Nest.js 10 + Prisma + PostgreSQL 백엔드
- Shared TS types (auth DTO, JWT payload, User/Profile/TravelPost, etc.)
- JWT 기반 인증(액세스/리프레시 분리, CSRF 쿠키), 프로필/여행 글/팔로우/채팅/알림 기본 구현

## Workspaces

- `apps/frontend`: Next.js 15 App Router application styled with TailwindCSS.
- `apps/backend`: Nest.js API server prepared for PostgreSQL integrations.
- `packages/shared`: Shared TypeScript types and helpers consumed by both frontend and backend.

## Features (현재 상태)
- Auth: `/auth/signup`, `/auth/signin`, `/auth/me`, `/auth/refresh`, `/auth/logout` (쿠키에 토큰 저장, CSRF 토큰 헤더 체크, 리프레시 회전)
- Profiles: 프로필 조회/업서트, 아바타(Base64 업로드 임시), 여행 스타일/페이스/예산/언어/관심사 필드
- Travel Posts: 생성/목록/상세, Explore 페이지 카드+모달, 작성자 프로필 연동
- Follow: 팔로우/언팔로우, 팔로워·팔로잉 목록, 모달/프로필 화면 표시
- Chat: 방 생성, 메시지 송수신, SSE 실시간 스트림, 초대/검색/수락/거절, 프로필 클릭 조회, 아바타 표시
- Notifications: 단순 알림 생성/조회/읽음 처리 (채팅 초대, 팔로우, 참여 요청)
- Frontend IA: 홈(/home), 탐색(/explore), 내 프로필(/me/profile), 여행 작성(/travel/new), 채팅(/chat)

## Quickstart
1) Install
```bash
pnpm install
```
2) Environment
- `apps/backend/.env` (예시)
  - `PORT=4000`
  - `FRONTEND_ORIGIN=http://localhost:3000`
  - `DATABASE_URL=postgresql://user:password@localhost:5432/dongsangilmong`
  - `JWT_SECRET=change-me`
- `apps/frontend/.env.local`
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`
3) DB
```bash
cd apps/backend
pnpm prisma migrate dev --name init
pnpm prisma generate
```
4) Run
```bash
pnpm --filter backend start:dev   # Nest dev with hot reload
pnpm --filter frontend dev        # Next dev
```

## Key endpoints (백엔드)
- Auth: `POST /auth/signup`, `POST /auth/signin`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout`
- Profiles: `GET /profiles/:userId`, `POST /profiles` (upsert)
- Travel posts: `GET /travel-posts`, `GET /travel-posts/:id`, `POST /travel-posts`
- Follow: `POST /follows/:userId`, `DELETE /follows/:userId`, `GET /follows/followers`, `GET /follows/following`
- Chat: `POST /chat/rooms`, `GET /chat/rooms`, `GET /chat/rooms/:id/messages`, `POST /chat/rooms/:id/messages`, `GET /chat/rooms/:id/stream` (SSE), 초대 관련 `/chat/rooms/:id/invitations`, `/chat/invitations`
- Notifications: `GET /notifications`, `POST /notifications`, `PATCH /notifications/:id/read`
- Health: `GET /health`

## Frontend pages (요약)
- `/` 랜딩, `/home` 개인화 홈, `/explore` 여행 글 탐색(카드/모달), `/me/profile` 프로필 보기/수정, `/travel/new` 여행 글 작성, `/chat` 채팅/초대/프로필 조회, `/signin`, `/signup`

## Notes
- 아바타는 현재 Base64 본문으로 업로드하므로 `.env`의 본문 제한(10MB) 내에서 사용 권장. 향후 S3 등 외부 스토리지로 교체 권장.
- CORS와 쿠키가 필요하므로 프런트 요청 시 `credentials: 'include'`를 유지하세요.
- CI/테스트는 최소 구성 상태이며, lint/test 워크플로 추가 필요.***
