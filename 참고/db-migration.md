# DB 마이그레이션 — dev / main 동시 반영

스키마를 바꾸면 **코드만 배포하지 말고**, `crustory_dev`와 `postgres` **둘 다** 마이그레이션을 적용한다.  
한쪽만 적용하면 Production이 500으로 내려간다. (예: `Product.runieNote` 컬럼 없음 → P2022)

## 환경 매핑

같은 Supabase 프로젝트 · DB 이름만 다름.

| 대상 | Git / 배포 | DB 이름 | URL 경로 |
|------|------------|---------|----------|
| 로컬 + Vercel Preview | `dev` | `crustory_dev` | `.../crustory_dev` |
| Vercel Production | `main` | `postgres` | `.../postgres` |

- `DATABASE_URL` — pooler `:6543` + `pgbouncer=true` (앱 런타임)
- `DIRECT_URL` — session `:5432` (마이그레이션용, DB 이름은 `DATABASE_URL`과 **동일**)

Vercel에는 Production / Preview에 각각 다른 `DATABASE_URL`·`DIRECT_URL`이 이미 들어 있다.

## 원칙

1. **마이그레이션 SQL은 한 번만 작성**하고 git에 커밋한다 (`prisma/migrations/`).
2. 그 SQL을 **dev DB → main DB 순으로 둘 다** `migrate deploy` 한다.
3. **main(Production)에 스키마를 안 올린 채** `main`에 코드만 머지·배포하지 않는다.
4. Production에서는 `migrate reset` / `db push` / 수동 DROP을 쓰지 않는다.

## 표준 절차 (스키마 변경할 때)

### 1) 로컬에서 마이그레이션 생성 + dev DB 적용

`.env`는 평소처럼 `crustory_dev`를 가리킨다.

```bash
# schema.prisma 수정 후
npm run db:migrate
# = prisma migrate dev  →  마이그레이션 파일 생성 + crustory_dev에 적용
```

확인:

```bash
npx prisma migrate status
# Database schema is up to date
```

마이그레이션 폴더(`prisma/migrations/YYYYMMDDHHMMSS_*/migration.sql`)를 **반드시 커밋**한다.

### 2) Production(main) DB에도 같은 마이그레이션 적용

배포 **직전** 또는 `main` 머지 **직후·트래픽 받기 전**에 한다.  
로컬 `.env`를 잠시 Production URL로 바꿔 실행하거나, 일회성 env로 넘긴다.

```bash
# DIRECT_URL / DATABASE_URL 모두 DB 이름이 postgres 인 Production 값 사용
DATABASE_URL="postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1" \
DIRECT_URL="postgresql://...@...pooler.supabase.com:5432/postgres" \
npx prisma migrate deploy
```

또는 Vercel Production env를 잠시 pull한 뒤:

```bash
npx vercel env pull .env.production --environment=production
# .env.production 의 URL이 /postgres 인지 확인 (시크릿 출력·커밋 금지)
set -a && source .env.production && set +a
npx prisma migrate deploy
rm .env.production
```

확인:

```bash
# 같은 Production URL로
npx prisma migrate status
```

### 3) 코드 배포

1. `dev`에 푸시 → Preview로 동작 확인 (`crustory_dev`는 1단계에서 이미 반영됨)
2. Production DB migrate deploy 완료 확인
3. `main` 머지 → Vercel Production 배포

**순서 요약:** `migrate(dev DB)` → 커밋 → (필요 시 Preview 검증) → `migrate(prod DB)` → Production 코드 배포

## 체크리스트 (PR / 배포 전)

- [ ] `prisma/schema.prisma` 변경이 있으면 `prisma/migrations/` 새 폴더가 같이 있는가
- [ ] `npx prisma migrate status` 를 **dev URL**로 돌렸을 때 up to date인가
- [ ] `npx prisma migrate status` 를 **prod URL**로 돌렸을 때 up to date인가 (또는 deploy 직후 확인)
- [ ] Production에만 있는 데이터에 안전한 마이그레이션인가 (DROP/NOT NULL 없이 default 등)
- [ ] 시드(`db:seed`)는 로컬/dev 전용 — Production에 함부로 돌리지 않음

## 자주 쓰는 명령

| 목적 | 명령 | 대상 |
|------|------|------|
| 개발 중 새 마이그레이션 만들기 | `npm run db:migrate` | `.env` → `crustory_dev` |
| 이미 있는 마이그레이션만 적용 | `npm run db:migrate:deploy` | 현재 env의 DB |
| 적용 상태 확인 | `npx prisma migrate status` | 현재 env의 DB |
| 로컬 초기화 (데이터 삭제) | `npm run db:reset` | **dev만**. Production 금지 |

## 장애 패턴 (이번에 난 것)

| 증상 | 원인 | 조치 |
|------|------|------|
| Production `/`, `/api/products` 500 | 코드는 새 컬럼을 읽는데 prod DB에 컬럼 없음 | prod에 `prisma migrate deploy` |
| Prisma `P2022` / column does not exist | 위와 동일 | 누락된 migration SQL을 prod에 적용 |
| 로컬·Preview는 정상, www만 죽음 | `crustory_dev`만 마이그레이션됨 | prod(`postgres`)에도 동일 적용 |

Vercel 배포 상태가 Ready여도, **런타임 DB 스키마가 안 맞으면 사이트는 다운**이다.

## 하지 말 것

- Production에서 `prisma migrate reset` / `prisma db push`
- 마이그레이션 파일 없이 `schema.prisma`만 커밋하고 배포
- dev에만 `migrate dev` 하고 main 머지
- Production `DATABASE_URL`을 git·채팅·이슈에 그대로 붙이기

## 관련 파일

- `prisma/schema.prisma`
- `prisma/migrations/`
- `.env.example` (DB 이름 주석)
- `README.md` — 데이터베이스 (main / dev) 절
