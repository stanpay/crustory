import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseImages } from "@/lib/format";
import { runieNote } from "@/lib/runie-notes";
import { ProductInquiry } from "@/components/shop/ProductInquiry";
import { DetailTabs } from "@/components/shop/DetailTabs";
import { ProductCard } from "@/components/shop/ProductCard";
import { Runie } from "@/components/brand/Runie";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product" };
  return { title: product.name, description: product.description };
}

export default async function ProductDetailPage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.published) notFound();

  const images = parseImages(product.images);
  const image = images[0] || "/products/plush-keyring.svg";
  const isPre = product.saleType === "PREORDER";

  const related = await prisma.product.findMany({
    where: { published: true, NOT: { id: product.id } },
    orderBy: { createdAt: "asc" },
    take: 4,
  });

  return (
    <div className="pdp-page">
      <div className="wrap">
        <nav className="crumbs" aria-label="경로">
          <Link href="/shop">Shop</Link>
          <span aria-hidden>/</span>
          <Link href={isPre ? "/shop?type=PREORDER" : "/shop"}>
            {isPre ? "예약판매" : "러니 굿즈"}
          </Link>
        </nav>

        <div className="pdp">
          <div className="pdp__gallery">
            <div className="pdp__shot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={product.name} width={800} height={800} />
            </div>
            {images.slice(1).map((src) => (
              <div className="pdp__shot" key={src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" width={800} height={800} loading="lazy" />
              </div>
            ))}
          </div>

          <div className="pdp__info">
            <p className="pdp__cat">{isPre ? "러니 굿즈 · 예약판매" : "러니 굿즈"}</p>
            <h1 className="pdp__name">{product.name}</h1>
            <p className="pdp__price">{formatPrice(product.price)}</p>
            <p className="pdp__lead">{product.description}</p>

            {isPre && (
              <p className="pdp__notice">
                <b>예약판매</b> 예정 상품이에요. 판매·수령 일정은 문의로 안내드려요.
              </p>
            )}

            <ProductInquiry productName={product.name} />

            <DetailTabs
              tabs={[
                {
                  id: "buy",
                  label: "구매 안내",
                  content: (
                    <ul>
                      <li>현재 온라인 주문·결제는 제공하지 않습니다.</li>
                      <li>
                        상품 문의는 <Link href="/contact" style={{ textDecoration: "underline" }}>문의하기</Link>로
                        남겨 주세요.
                      </li>
                    </ul>
                  ),
                },
                {
                  id: "return",
                  label: "교환·반품",
                  content: (
                    <ul>
                      <li>오프라인·별도 안내로 구매한 경우에만 적용됩니다.</li>
                      <li>
                        자세한 내용은 <Link href="/policies/guide" style={{ textDecoration: "underline" }}>이용안내</Link>를 확인해 주세요.
                      </li>
                    </ul>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <section className="note-band" aria-label="러니의 한마디">
        <div className="wrap note-band__inner">
          <Runie className="note-band__runie" title="" />
          <blockquote>
            “{runieNote(product.slug)}”
            <cite>— 러니, 은퇴한 제주 경주마</cite>
          </blockquote>
        </div>
      </section>

      {related.length > 0 && (
        <section className="wrap block">
          <div className="sec-head">
            <h2>함께 보면 좋은 것</h2>
            <Link href="/shop">전체 보기</Link>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                images={p.images}
                saleType={p.saleType}
                stock={p.stock}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
