# CRUSTORY

제주 혼행객을 위한 F&B 라이프스타일 브랜드 **크러스토리** 공식 웹·Android 앱입니다.

- Next.js App Router (웹 + API)
- Prisma + Supabase Postgres (프로젝트 하나 · DB 둘: `postgres` / `crustory_dev`)
- Capacitor Android 셸 (스플래시·오프라인·카카오 딥링크·FCM 푸시)
- Shop은 **상품 소개**만 — 온라인 장바구니·주문·결제 없음 (문의하기 사용)

## 시작하기

```bash
npm install
cp .env.example .env   # 로컬은 crustory_dev URL 사용
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

## 데이터베이스 (main / dev)

같은 Supabase 프로젝트 안에 DB 두 개를 둡니다. 백엔드 서버는 분리하지 않고 **환경변수만** 바꿉니다.

| 환경 | Git | DB |
|---|---|---|
| 로컬 `npm run dev` | — | `crustory_dev` |
| Vercel Preview | `dev` 브랜치 | `crustory_dev` |
| Vercel Production | `main` 브랜치 | `postgres` |

Vercel에서는 Production / Preview 환경에 각각 다른 `DATABASE_URL`·`DIRECT_URL`을 넣습니다.  
URL의 경로만 `/postgres` ↔ `/crustory_dev`로 바꾸면 됩니다.

마이그레이션은 로컬(dev DB)에 먼저 적용한 뒤, Production 배포 시 main DB에 `npx prisma migrate deploy` 합니다.

## 환경 변수

`.env.example`을 참고해 `.env`를 구성합니다.

| 키 | 설명 |
|---|---|
| `DATABASE_URL` | Supabase Transaction pooler (`:6543`, `pgbouncer=true`) — 로컬/Preview는 `/crustory_dev` |
| `DIRECT_URL` | Supabase Session pooler (`:5432`) — 마이그레이션용, DB 이름은 `DATABASE_URL`과 동일 |
| `ADMIN_SESSION_SECRET` | 관리자 세션 서명 시크릿 |
| `CUSTOMER_SESSION_SECRET` | 회원 세션 서명 시크릿 |
| `KAKAO_REST_API_KEY` | 카카오 REST API 키 |
| `KAKAO_CLIENT_SECRET` | (선택) 카카오 Client Secret — 보안 설정에서 사용 시 |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL (로컬 `http://localhost:3000`, 배포 시 Vercel URL) |
| `NEXT_PUBLIC_GTM_ID` | (선택) Google Tag Manager 컨테이너 ID (예: `GTM-XXXX`) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | (앱 푸시) Firebase 서비스 계정 JSON 문자열 |

### 카카오 로그인

1. [카카오 개발자](https://developers.kakao.com)에서 앱 생성
2. **플랫폼**에 사이트 도메인 등록
3. **Redirect URI**: `{NEXT_PUBLIC_SITE_URL}/api/auth/kakao/callback`
4. Android 앱 복귀는 `crustory://auth/callback` 딥링크
5. REST API 키를 `.env`의 `KAKAO_REST_API_KEY`에 넣기

Vercel Production의 `NEXT_PUBLIC_SITE_URL`은 `https://crustory.vercel.app`으로 둡니다.  
시크릿 키에 `NEXT_PUBLIC_` 접두어를 붙이지 마세요.

## 관리자

- URL: `/admin/login` → **카카오 로그인**
- 권한은 Supabase `AdminUser` 테이블의 `kakaoId`만 본다 (env에 ID를 두지 않음)
- 등록: 사이트 카카오 로그인 후 `Customer.kakaoId` 확인 → Table Editor/`AdminUser`에 insert

상품 공개 여부·재고 등을 관리할 수 있습니다.

## 주요 경로

| 경로 | 설명 |
|---|---|
| `/` | 홈 |
| `/our-story` | 브랜드 스토리 |
| `/meet-runie` | 러니 IP |
| `/shop` | 상품 소개 |
| `/pizza` | 피자·매장 소개 |
| `/contact` | 문의하기 |
| `/login` | 카카오 로그인 |
| `/account` | 회원탈퇴 |
| `/admin` | 관리자 (웹) |

## Android 앱

```bash
npm run cap:sync
npm run android:open   # Android Studio
# 또는
npm run android:debug  # 디버그 APK → dist/crustory-debug.apk
```

제출·서명·스토어 체크리스트: [`참고/android-store-checklist.md`](참고/android-store-checklist.md)
