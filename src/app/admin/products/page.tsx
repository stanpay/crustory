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
      <h1 className="section-title" style={{ fontSize: "1.75rem" }}>상품 관리</h1>
      <p className="section-text">가격·재고·공개 여부를 수정할 수 있습니다.</p>
      <table className="admin-table" style={{ marginTop: "1.25rem" }}>
        <thead>
          <tr>
            <th>상품</th>
            <th>유형</th>
            <th>가격</th>
            <th>재고</th>
            <th>공개</th>
            <th>저장</th>
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
      <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#6b6560" }}>
        표시 가격: 참고용 · 실제 수정은 각 행의 입력 후 저장
        {products[0] ? ` (예: ${formatPrice(products[0].price)})` : ""}
      </p>
    </div>
  );
}
