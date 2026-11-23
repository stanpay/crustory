-- AlterTable
ALTER TABLE "Notice" ADD COLUMN "linkHref" TEXT;
ALTER TABLE "Notice" ADD COLUMN "linkLabel" TEXT;

-- Backfill current announcement bar copy for existing rows without a link
UPDATE "Notice"
SET
  "title" = '러니 여행노트 예약판매 중 · 5만원 이상 무료배송',
  "linkHref" = '/shop?type=PREORDER',
  "linkLabel" = '보러 가기'
WHERE "active" = true
  AND ("linkHref" IS NULL OR "linkHref" = '');

