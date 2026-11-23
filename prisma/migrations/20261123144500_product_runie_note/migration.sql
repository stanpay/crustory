-- AlterTable
ALTER TABLE "Product" ADD COLUMN "runieNote" TEXT NOT NULL DEFAULT '';

-- Backfill existing product quotes
UPDATE "Product" SET "runieNote" = '가방에 매달려 다니는 것도 나쁘지 않아. 뛰지 않아도 되니까.' WHERE "slug" = 'runie-plush-keyring';
UPDATE "Product" SET "runieNote" = '투명해서 좋아. 숨길 게 없거든. 원래 별로 없지만.' WHERE "slug" = 'runie-acrylic-keyring';
UPDATE "Product" SET "runieNote" = '아무 데나 붙여. 거기가 오늘의 결승선 아닌 곳이야.' WHERE "slug" = 'runie-sticker-pack';
UPDATE "Product" SET "runieNote" = '보내도 되고, 안 보내도 돼. 써 두는 것만으로 충분할 때도 있어.' WHERE "slug" = 'runie-postcard-set';
UPDATE "Product" SET "runieNote" = '빈칸이 많아도 괜찮아. 여긴 결승선 없어.' WHERE "slug" = 'runie-travel-notebook';
