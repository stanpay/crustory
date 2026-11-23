import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/format";
import { ProductStockForm } from "@/components/admin/ProductStockForm";

export default async function AdminProductsPage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="section-title" style={{ fontSize: "clamp(1.35rem, 4vw, 1.75rem)" }}>
            상품 관리
          </h1>
          <p className="section-text">
            카드를 누르면 수정 페이지로 이동합니다. 판매유형·공개·추천은 바로 반영되고, 재고는 확인을 눌러 저장합니다.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-dark">
          상품 추가
        </Link>
      </div>

      <div className="admin-product-list">
        {products.map((p) => (
          <ProductStockForm
            key={p.id}
            product={{
              slug: p.slug,
              name: p.name,
              saleType: p.saleType,
              stock: p.stock,
              published: p.published,
              featured: p.featured,
              imageUrl: parseImages(p.images)[0] ?? null,
            }}
          />
        ))}
      </div>

      {products.length === 0 && (
        <p style={{ marginTop: "1rem", color: "#6b6560" }}>
          등록된 상품이 없습니다.{" "}
          <Link href="/admin/products/new">첫 상품을 추가</Link>
          해 주세요.
        </p>
      )}
    </div>
  );
}
