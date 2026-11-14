import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { OrderActions } from "@/components/admin/OrderActions";


export default async function AdminOrdersPage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="section-title" style={{ fontSize: "1.75rem" }}>주문 관리</h1>
      <table className="admin-table" style={{ marginTop: "1.25rem" }}>
        <thead>
          <tr>
            <th>주문</th>
            <th>고객</th>
            <th>상품</th>
            <th>금액</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <div>{o.orderId}</div>
                <div style={{ fontSize: "0.75rem", color: "#6b6560" }}>
                  {o.createdAt.toLocaleString("ko-KR")}
                </div>
              </td>
              <td>
                {o.customerName}
                <div style={{ fontSize: "0.75rem" }}>{o.customerEmail}</div>
              </td>
              <td>
                {o.items.map((i) => (
                  <div key={i.id}>
                    {i.name} × {i.quantity}
                  </div>
                ))}
              </td>
              <td>{formatPrice(o.amount)}</td>
              <td>
                <span className={`status-pill ${o.status}`}>{o.status}</span>
              </td>
              <td>
                <OrderActions
                  orderId={o.orderId}
                  status={o.status}
                  hasPaymentKey={Boolean(o.paymentKey)}
                />
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={6}>주문이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
