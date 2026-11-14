import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import type { SaleType } from "@prisma/client";

export const metadata: Metadata = {
  title: "Shop",
  description: "러니 굿즈 온라인 샵",
};

type Props = {
  searchParams: Promise<{ type?: string; category?: string }>;
};

export default async function ShopPage({ searchParams }: Props) {
  await connection();
  const params = await searchParams;
  const type =
    params.type === "NORMAL" || params.type === "PREORDER"
      ? (params.type as SaleType)
      : undefined;

  const products = await prisma.product.findMany({
    where: { published: true, ...(type ? { saleType: type } : {}) },
    orderBy: { createdAt: "asc" },
  });

  const filters = [
    { href: "/shop", label: "전체", active: !type },
    { href: "/shop?type=NORMAL", label: "바로 구매", active: type === "NORMAL" },
    { href: "/shop?type=PREORDER", label: "예약판매", active: type === "PREORDER" },
  ];

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>러니 굿즈</h1>
        <p>혼자 떠난 여행에 하나쯤 챙겨 가기 좋은 것들.</p>
      </header>

      <nav className="tabs-row" aria-label="상품 분류">
        {filters.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={f.active ? "is-active" : undefined}
            aria-current={f.active ? "page" : undefined}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <div className="shop-meta">
        <span>상품 {products.length}개</span>
        <span>5만원 이상 무료배송</span>
      </div>

      {products.length === 0 ? (
        <p className="empty-state">아직 준비된 상품이 없어요.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
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
      )}
    </div>
  );
}
