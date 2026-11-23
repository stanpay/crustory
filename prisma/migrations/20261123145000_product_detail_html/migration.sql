-- AlterTable
ALTER TABLE "Product" ADD COLUMN "detailHtml" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "detailCss" TEXT NOT NULL DEFAULT '';

-- Seed existing products with the previous note-band as editable HTML/CSS
UPDATE "Product"
SET
  "detailHtml" = '<section class="note-band"><div class="note-band__inner"><blockquote>“' || REPLACE(COALESCE(NULLIF(TRIM("runieNote"), ''), '천천히 골라. 여긴 결승선 없어.'), '"', '&quot;') || '”<cite>— 러니, 은퇴한 제주 경주마</cite></blockquote></div></section>',
  "detailCss" = '.note-band{background:#1e1b17;color:#f3f0e8;padding:2.5rem 0}.note-band__inner{max-width:720px;margin:0 auto;padding:0 1.25rem}.note-band blockquote{margin:0;font-size:1.15rem;line-height:1.7;font-weight:600;letter-spacing:-0.02em}.note-band cite{display:block;margin-top:0.85rem;font-size:0.85rem;font-style:normal;opacity:0.7}'
WHERE "detailHtml" = '';
