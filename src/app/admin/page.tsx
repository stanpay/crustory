import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

type DashboardRow = {
  productCount: number;
  orderCount: number;
  paidSum: number;
  recentOrders: Array<{
    id: string;
    orderId: string;
    status: string;
    amount: number;
    createdAt: string | Date;
  }> | null;
};

export default async function AdminDashboardPage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  // Prisma Promise.all은 단일 커넥션에서 순차 실행되어 RTT가 누적됨 → 1쿼리로 묶음
  const [row] = await prisma.$queryRaw<DashboardRow[]>`
    SELECT
      (SELECT COUNT(*)::int FROM "Product") AS "productCount",
      (SELECT COUNT(*)::int FROM "Order") AS "orderCount",
      (SELECT COALESCE(SUM(amount), 0)::int FROM "Order" WHERE status = 'PAID') AS "paidSum",
      (
        SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
        FROM (
          SELECT id, "orderId", status, amount, "createdAt"
          FROM "Order"
          ORDER BY "createdAt" DESC
          LIMIT 5
        ) r
      ) AS "recentOrders"
  `;

  const productCount = row?.productCount ?? 0;
  const orderCount = row?.orderCount ?? 0;
  const paidTotal = row?.paidSum ?? 0;
  const recentOrders = (row?.recentOrders ?? []).map((o) => ({
    ...o,
    createdAt: o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt),
  }));

  return (
    <div>
      <h1 className="section-title" style={{ fontSize: "1.75rem" }}>대시보드</h1>
      <div className="values-grid" style={{ marginTop: "1.5rem" }}>
        <article className="value-card">
          <h3>상품</h3>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111" }}>{productCount}</p>
        </article>
        <article className="value-card">
          <h3>주문</h3>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111" }}>{orderCount}</p>
        </article>
        <article className="value-card">
          <h3>확정 주문 합계</h3>
          <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111" }}>
            {formatPrice(paidTotal)}
          </p>
        </article>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
        <Link href="/admin/products" className="btn btn-dark">상품 관리</Link>
        <Link href="/admin/orders" className="btn btn-primary">주문 관리</Link>
      </div>

      <h2 style={{ marginTop: "2.5rem" }}>최근 주문</h2>
      <table className="admin-table" style={{ marginTop: "0.75rem" }}>
        <thead>
          <tr>
            <th>주문번호</th>
            <th>상태</th>
            <th>금액</th>
            <th>일시</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.map((o) => (
            <tr key={o.id}>
              <td>{o.orderId}</td>
              <td><span className={`status-pill ${o.status}`}>{o.status}</span></td>
              <td>{formatPrice(o.amount)}</td>
              <td>{o.createdAt.toLocaleString("ko-KR")}</td>
            </tr>
          ))}
          {recentOrders.length === 0 && (
            <tr>
              <td colSpan={4}>주문이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
