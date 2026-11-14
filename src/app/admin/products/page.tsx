import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ProductStockForm } from "@/components/admin/ProductStockForm";

export default async function AdminProductsPage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "0.75rem",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
            상품 관리
          </h1>
          <p className="section-text">
            목록에서 가격·재고·공개를 빠르게 바꾸거나, 수정으로 전체 정보를 편집할 수 있습니다.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-dark">
          상품 추가
        </Link>
      </div>

      <table className="admin-table" style={{ marginTop: "1.25rem" }}>
        <thead>
          <tr>
            <th>상품</th>
            <th>유형</th>
            <th>가격</th>
            <th>재고</th>
            <th>공개</th>
            <th>저장</th>
            <th>편집</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <ProductStockForm
              key={p.id}
              product={{
                slug: p.slug,
                name: p.name,
                saleType: p.saleType,
                price: p.price,
                stock: p.stock,
                published: p.published,
              }}
            />
          ))}
        </tbody>
      </table>

      {products.length === 0 && (
        <p style={{ marginTop: "1rem", color: "#6b6560" }}>
          등록된 상품이 없습니다.{" "}
          <Link href="/admin/products/new">첫 상품을 추가</Link>
          해 주세요.
        </p>
      )}

      <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#6b6560" }}>
        표시 가격: 참고용 · 실제 수정은 각 행의 입력 후 저장
        {products[0] ? ` (예: ${formatPrice(products[0].price)})` : ""}
      </p>
    </div>
  );
}
