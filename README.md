# CRUSTORY

제주 혼행객을 위한 F&B 라이프스타일 브랜드 **크러스토리** 공식 웹 프로토타입입니다.

- Next.js App Router (웹 + API)
- Prisma + SQLite
- 토스페이먼츠 v2 주문서형 **샌드박스**

## 시작하기

```bash
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

## 환경 변수

`.env.example`을 참고해 `.env`를 구성합니다.

| 키 | 설명 |
|---|---|
| `DATABASE_URL` | SQLite 경로 (`file:./dev.db`) |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스 위젯 테스트 클라이언트 키 (`test_gck_...`) |
| `TOSS_SECRET_KEY` | 토스 시크릿 키 (`test_gsk_...`) — 서버 전용 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | 관리자 계정 |
| `ADMIN_SESSION_SECRET` | 세션 서명 시크릿 |
| `NEXT_PUBLIC_GA_ID` | (선택) GA 측정 ID |

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
| `/admin` | 관리자 |

## 에셋 교체

로고·러니 최종 디자인은 브랜드 가이드 전달 후 교체합니다.  
현재는 `public/products/*.svg` 플레이스홀더를 사용합니다.

## 앱 전환

비즈니스 로직은 `src/app/api`에 두었습니다. 이후 React Native 앱은 동일 API를 호출하면 됩니다.
