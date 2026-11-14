import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, parseImages } from "@/lib/format";
import { runieNote } from "@/lib/runie-notes";
import { AddToCartBuy } from "@/components/shop/AddToCartBuy";
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
                <b>예약판매</b> 상품이에요. 제작이 끝나는 대로 주문 순서대로 보내드려요.
              </p>
            )}

            <AddToCartBuy
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image,
                saleType: product.saleType,
                options: product.options,
                stock: product.stock,
              }}
            />

            <DetailTabs
              tabs={[
                {
                  id: "ship",
                  label: "배송 안내",
                  content: (
                    <ul>
                      <li>기본 배송비 3,000원, 50,000원 이상 무료배송</li>
                      <li>
                        {isPre
                          ? "예약판매 상품은 제작 완료 후 순차 출고됩니다."
                          : "결제 확인 후 순차 출고됩니다."}
                      </li>
                    </ul>
                  ),
                },
                {
                  id: "return",
                  label: "교환·반품",
                  content: (
                    <ul>
                      <li>상품 수령 후 7일 이내 문의해 주세요.</li>
                      <li>단순 변심에 의한 교환·반품은 왕복 배송비가 발생합니다.</li>
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
