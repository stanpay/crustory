# CRUSTORY 작업 기록 — 다국어(i18n) + 관리자 회원 관리

작성일: 2026-03-25  
브랜치: `dev` (Vercel Preview → `crustory_dev` DB)

---

## 1. 사이트 다국어(i18n)

### 목적
헤더 로그인/로그아웃 버튼 왼쪽에 언어 변경 UI를 두고,  
사용자 브라우저 기본 언어에 맞춰 사이트가 자동으로 해당 언어를 쓰도록 한다.

### 지원 언어
| 코드 | 표시 | 비고 |
|------|------|------|
| `ko` | 한국어 | |
| `en` | English | |
| `zh` | 中文 (간체) | |
| `ja` | 日本語 | |
| 그 외 | → **영어(`en`)** 로 폴백 | fr, de, es 등 |

### 자동 감지 흐름
1. **미들웨어** (`src/middleware.ts`)  
   - 쿠키 `crustory-locale`가 없으면 `Accept-Language` 헤더를 파싱해 로케일을 정하고 쿠키에 저장 (1년, `SameSite=Lax`).
2. **루트 레이아웃** (`src/app/layout.tsx`)  
   - 쿠키 → 없으면 `Accept-Language` 순으로 `initialLocale` 결정.  
   - `<html lang={...}>` 에 반영하고 `SiteChrome`에 전달.
3. **클라이언트** (`LocaleProvider`)  
   - `localStorage`에 저장된 값이 있으면 우선 (사용자가 직접 고른 언어 유지).  
   - 없으면 `navigator.languages` / `navigator.language`로 재감지.  
   - 선택·감지 결과를 쿠키 + `localStorage` + `document.documentElement.lang`에 동기화.

### UI
- 위치: 헤더 `hd__util` 안, **로그인/로그아웃 버튼 왼쪽**
- 버튼: 현재 언어 짧은 코드 (`KO` / `EN` / `ZH` / `JA`) + ▾
- 클릭 시 드롭다운에서 4개 언어 선택
- 바깥 클릭·Esc로 닫힘

### 현재 번역 범위 (1차)
전체 페이지 본문이 아니라 **공통 크롬(헤더·푸터)** 위주.

- 헤더: 메뉴, 로그인/로그아웃, 문의, 네비 라벨, 모바일 메뉴 노트 등
- 푸터: 둘러보기/고객지원/소식, 슬로건 한글 문장, 이용약관·개인정보처리방침 등

메뉴 영문 브랜드명(`Shop`, `Meet Runie` 등)은 언어와 관계없이 브랜드 표기를 유지.

### 주요 파일
```
src/lib/i18n/locales.ts          # 로케일 타입, Accept-Language/브라우저 감지
src/lib/i18n/messages.ts         # ko/en/zh/ja 메시지 사전
src/lib/i18n/index.ts            # re-export
src/components/i18n/LocaleProvider.tsx
src/components/i18n/LanguageSwitcher.tsx
src/middleware.ts
src/app/layout.tsx               # initialLocale 주입
src/components/layout/SiteChrome.tsx  # LocaleProvider 래핑 (admin 제외)
src/components/layout/Header.tsx
src/components/layout/Footer.tsx
src/app/globals.css              # .hd__lang* 스타일
```

### 아직 안 한 것 (후속)
- 홈 / Our Story / Meet Runie / Pizza / Shop PDP 등 **페이지 본문** 번역
- 관리자(`/admin`) 화면은 의도적으로 i18n 대상 제외
- URL 기반 로케일 라우팅 (`/en/...`) 미도입 — 쿠키·localStorage 방식

---

## 2. 관리자 회원 관리

### 목적
카카오 로그인한 고객(`Customer`)을 관리자에서 목록·상세 확인하고, 필요 시 강제 삭제할 수 있게 한다.

### 기능
- **대시보드** (`/admin`): 회원 수 카드 +「회원 관리」바로가기
- **네비** (`AdminShell`):「회원」메뉴
- **목록** (`/admin/members`): 프로필·이름·이메일·주문 수·푸시 디바이스 수·가입일
- **상세** (`/admin/members/[id]`): 회원 정보 및 관련 데이터
- **삭제** (`DELETE /api/admin/customers/[id]`):  
  - 관리자 인증 필수  
  - 푸시 디바이스 unlink 후 Customer 삭제  
  - 주문은 `userId` SetNull로 남김 (고객 자기삭제와 동일 시맨틱)

### 주요 파일
```
src/app/admin/members/page.tsx
src/app/admin/members/[id]/page.tsx
src/app/api/admin/customers/[id]/route.ts
src/components/admin/MemberDeleteButton.tsx
src/app/admin/page.tsx           # memberCount 카드
src/components/admin/AdminShell.tsx
```

---

## 3. 배포 메모

| 환경 | Git | DB |
|------|-----|-----|
| Vercel Preview | `dev` 푸시 | `crustory_dev` |
| Vercel Production | `main` 머지/푸시 | `postgres` |

이번 배포는 **`dev` 브랜치 Preview** 기준.

### 배포 후 확인 체크
- [ ] Preview URL에서 헤더 언어 버튼(로그아웃/로그인 왼쪽) 노출
- [ ] 브라우저 언어를 ko/en/zh/ja로 바꿔 첫 방문(쿠키·스토리지 삭제 후) 시 자동 적용
- [ ] 그 외 언어(예: fr) → English
- [ ] 언어 수동 변경 후 새로고침해도 유지
- [ ] 헤더·푸터 문구가 선택한 언어로 바뀜
- [ ] `/admin/members` 목록·상세·삭제(테스트 계정) 동작
- [ ] 관리자 화면은 언어 스위처 없이 기존 한국어 UI 유지
