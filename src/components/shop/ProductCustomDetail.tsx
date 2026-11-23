import {
  hasDetailContent,
  sanitizeDetailHtml,
  scopeDetailCss,
} from "@/lib/product-detail";

type Props = {
  html: string;
  css: string;
};

export function ProductCustomDetail({ html, css }: Props) {
  const safeHtml = sanitizeDetailHtml(html);
  if (!hasDetailContent(safeHtml)) return null;

  const scopedCss = scopeDetailCss(css);

  return (
    <section className="pdp-custom-detail" aria-label="상품 상세">
      {scopedCss ? (
        <style
          // Admin-authored CSS, already scoped to .pdp-custom-detail
          dangerouslySetInnerHTML={{ __html: scopedCss }}
        />
      ) : null}
      <div
        className="pdp-custom-detail__body"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </section>
  );
}
