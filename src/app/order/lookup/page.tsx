"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
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

type Me = {
  id: string;
  email: string | null;
  name: string | null;
};

function OrderCard({ order }: { order: OrderResult }) {
  return (
    <div className="panel">
      <h2>주문 {order.orderId}</h2>
      <p>
        상태: <span className={`status-pill ${order.status}`}>{order.status}</span>
      </p>
      <p>주문자: {order.customerName}</p>
      <p>금액: {formatPrice(order.amount)}</p>
      <p style={{ fontSize: "0.875rem", color: "var(--muted, #666)" }}>
        {new Date(order.createdAt).toLocaleString("ko-KR")}
      </p>
      <ul>
        {order.items.map((item, idx) => (
          <li key={idx}>
            {item.name} × {item.quantity} ({formatPrice(item.price)})
            {item.option ? ` · ${item.option}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LookupInner() {
  const params = useSearchParams();
  const [user, setUser] = useState<Me | null | undefined>(undefined);
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [orderId, setOrderId] = useState(params.get("orderId") || "");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGuest, setShowGuest] = useState(Boolean(params.get("orderId")));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (cancelled) return;
        setUser(meData.user);

        if (meData.user) {
          setLoading(true);
          const res = await fetch("/api/orders/mine");
          const data = await res.json();
          if (!cancelled) {
            if (res.ok) setOrders(data.orders || []);
            else setError(data.error || "주문 목록을 불러오지 못했습니다.");
          }
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onGuestSubmit(e: React.FormEvent) {
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

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOrders([]);
    setOrder(null);
  }

  if (user === undefined) {
    return <div className="wrap section narrow">로딩 중…</div>;
  }

  if (user) {
    return (
      <div className="wrap section narrow">
        <header className="page-head" style={{ paddingTop: 0 }}>
          <h1>내 주문</h1>
          <p>
            {user.name || "회원"}님{user.email ? ` · ${user.email}` : ""}
          </p>
        </header>

        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            로그아웃
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowGuest((v) => !v)}
          >
            {showGuest ? "비회원 조회 닫기" : "비회원 주문 조회"}
          </button>
        </div>

        {error && <p className="toast-error">{error}</p>}
        {loading && <p>주문 불러오는 중…</p>}
        {!loading && orders.length === 0 && !order && (
          <div className="panel">
            <p>아직 연결된 주문이 없습니다.</p>
            <p style={{ marginTop: "0.75rem" }}>
              <Link href="/shop" className="btn btn-dark">
                쇼핑하기
              </Link>
            </p>
          </div>
        )}
        {orders.map((o) => (
          <OrderCard key={o.orderId} order={o} />
        ))}

        {showGuest && (
          <form className="panel" onSubmit={onGuestSubmit}>
            <h2>비회원 주문 조회</h2>
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
          </form>
        )}
        {order && <OrderCard order={order} />}
      </div>
    );
  }

  return (
    <div className="wrap section narrow">
      <header className="page-head" style={{ paddingTop: 0 }}>
        <h1>주문 조회</h1>
        <p>카카오 로그인 후 내 주문을 한눈에 확인하세요.</p>
      </header>

      <div className="panel">
        <a
          href={`/api/auth/kakao?next=${encodeURIComponent("/order/lookup")}`}
          className="btn btn-kakao btn-block"
        >
          카카오로 로그인하고 조회
        </a>
        <button
          type="button"
          className="btn btn-ghost btn-block"
          style={{ marginTop: "0.75rem" }}
          onClick={() => setShowGuest((v) => !v)}
        >
          {showGuest ? "비회원 조회 닫기" : "비회원으로 조회"}
        </button>
      </div>

      {showGuest && (
        <form className="panel" onSubmit={onGuestSubmit}>
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
      )}

      {order && <OrderCard order={order} />}
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
