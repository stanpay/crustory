import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";


export default async function AdminDashboardPage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const [productCount, orderCount, paidSum, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

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
          <h3>결제 합계</h3>
          <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111" }}>
            {formatPrice(paidSum._sum.amount || 0)}
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
