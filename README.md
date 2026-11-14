# CRUSTORY

제주 혼행객을 위한 F&B 라이프스타일 브랜드 **크러스토리** 공식 웹 프로토타입입니다.

- Next.js App Router (웹 + API)
- Prisma + Supabase Postgres
- 토스페이먼츠 v2 주문서형 **샌드박스**

## 시작하기

```bash
npm install
cp .env.example .env   # Supabase DATABASE_URL / DIRECT_URL 입력
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

## 환경 변수

`.env.example`을 참고해 `.env`를 구성합니다.

| 키 | 설명 |
|---|---|
| `DATABASE_URL` | Supabase Transaction pooler (`:6543`, `pgbouncer=true`) |
| `DIRECT_URL` | Supabase Session pooler (`:5432`) — 마이그레이션용 |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스 위젯 테스트 클라이언트 키 (`test_gck_...`) |
| `TOSS_SECRET_KEY` | 토스 시크릿 키 (`test_gsk_...`) — 서버 전용 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | 관리자 계정 |
| `ADMIN_SESSION_SECRET` | 관리자 세션 서명 시크릿 |
| `CUSTOMER_SESSION_SECRET` | 회원 세션 서명 시크릿 |
| `KAKAO_REST_API_KEY` | 카카오 REST API 키 |
| `KAKAO_CLIENT_SECRET` | (선택) 카카오 Client Secret — 보안 설정에서 사용 시 |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL (로컬 `http://localhost:3000`, 배포 시 Vercel URL) |
| `NEXT_PUBLIC_GA_ID` | (선택) GA 측정 ID |

### 카카오 로그인

1. [카카오 개발자](https://developers.kakao.com)에서 앱 생성
2. **플랫폼**에 사이트 도메인 등록 (`http://localhost:3000`, 배포 도메인)
3. **Redirect URI**: `{NEXT_PUBLIC_SITE_URL}/api/auth/kakao/callback`
4. **카카오 로그인** 활성화, 동의항목: 닉네임(필수), 이메일(선택)
5. REST API 키를 `.env`의 `KAKAO_REST_API_KEY`에 넣기

Vercel에는 위 변수를 Production에 등록하고, `NEXT_PUBLIC_SITE_URL`은 `https://crustory.vercel.app`으로 둡니다.

시크릿 키에 `NEXT_PUBLIC_` 접두어를 붙이지 마세요.

## 토스 샌드박스 결제 테스트

1. SHOP에서 상품을 장바구니에 담습니다.
2. `/checkout`에서 배송 정보를 입력합니다.
3. 토스 결제 UI(테스트)로 결제합니다. 실제 청구는 되지 않습니다.
4. 성공 시 `/order/success`에서 서버 승인 API가 호출됩니다.

개발자센터에서 발급한 본인 테스트 키로 교체하는 것을 권장합니다.  
문서용 키가 동작하지 않으면 [API 키](https://developers.tosspayments.com/my/api-keys)의 개발 연동 체험 상점 키를 사용하세요.

## 관리자

- URL: `/admin/login`
- 기본 계정: `admin@crustory.com` / `crustoryadmin` (시드·`.env` 기준)

상품 가격·재고·공개 여부, 주문 상태·결제 취소를 처리할 수 있습니다.

## 주요 경로

| 경로 | 설명 |
|---|---|
| `/` | 홈 |
| `/our-story` | 브랜드 스토리 |
| `/meet-runie` | 러니 IP |
| `/shop` | 쇼핑몰 |
| `/pizza` | 피자·매장 소개 |
| `/jeju-guide` | 확장용 스텁 |
| `/login` | 카카오 로그인 |
| `/order/lookup` | 내 주문 / 주문 조회 |
| `/admin` | 관리자 |

## 에셋 교체

로고·러니 최종 디자인은 브랜드 가이드 전달 후 교체합니다.  
현재는 `public/products/*.svg` 플레이스홀더를 사용합니다.

## 앱 전환

비즈니스 로직은 `src/app/api`에 두었습니다. 이후 React Native 앱은 동일 API를 호출하면 됩니다.
