"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";

function SuccessInner() {
  const params = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  const paymentKey = params.get("paymentKey");
  const orderId = params.get("orderId");
  const amount = params.get("amount");

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setMessage("결제 정보가 올바르지 않습니다.");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "승인 실패");
        clearCart();
        setStatus("ok");
      } catch (e) {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "승인 실패");
      }
    })();
  }, [paymentKey, orderId, amount, clearCart]);

  return (
    <div className="wrap section narrow center">
      {status === "loading" && <p className="muted">결제를 확인하고 있어요…</p>}
      {status === "ok" && (
        <>
          <header className="page-head" style={{ paddingTop: 0 }}>
            <h1>결제가 완료됐어요</h1>
          </header>
          <p className="muted">
            주문번호 <strong>{orderId}</strong>
          </p>
          <div className="actions-row">
            <Link href={`/order/lookup?orderId=${orderId}`} className="btn btn-dark">
              주문 조회
            </Link>
            <Link href="/shop" className="btn btn-dark">
              쇼핑 계속
            </Link>
          </div>
        </>
      )}
      {status === "error" && (
        <>
          <header className="page-head" style={{ paddingTop: 0 }}>
            <h1>결제 승인에 실패했어요</h1>
          </header>
          <p className="toast-error">{message}</p>
          <Link href="/cart" className="btn btn-dark" style={{ marginTop: "1rem" }}>
            장바구니로
          </Link>
        </>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="wrap section">로딩 중…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
