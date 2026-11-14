"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";

type OrderResult = {
  orderId: string;
  status: string;
  amount: number;
  customerName: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number; option?: string | null }[];
};

function LookupInner() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState(params.get("orderId") || "");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}?email=${encodeURIComponent(email)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "조회 실패");
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "조회 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap section narrow">
      <header className="page-head" style={{ paddingTop: 0 }}>
        <h1>주문 조회</h1>
      </header>
      <form className="panel" onSubmit={onSubmit}>
        <div className="form-field">
          <label htmlFor="orderId">주문번호</label>
          <input
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="email">주문 이메일</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-dark btn-block" disabled={loading}>
          {loading ? "조회 중…" : "조회하기"}
        </button>
        {error && <p className="toast-error">{error}</p>}
      </form>

      {order && (
        <div className="panel">
          <h2>주문 {order.orderId}</h2>
          <p>
            상태: <span className={`status-pill ${order.status}`}>{order.status}</span>
          </p>
          <p>주문자: {order.customerName}</p>
          <p>금액: {formatPrice(order.amount)}</p>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.name} × {item.quantity} ({formatPrice(item.price)})
                {item.option ? ` · ${item.option}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function OrderLookupPage() {
  return (
    <Suspense fallback={<div className="wrap section">로딩 중…</div>}>
      <LookupInner />
    </Suspense>
  );
}
