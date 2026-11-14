"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  status: string;
  hasPaymentKey: boolean;
};

export function OrderActions({ orderId, status, hasPaymentKey }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function setStatus(next: string) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "실패");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "실패");
    } finally {
      setBusy(false);
    }
  }

  async function cancelPayment() {
    if (!confirm("토스 결제를 취소하고 재고를 복구할까요?")) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/payments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, cancelReason: "관리자 취소" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "실패");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center" }}>
      {status === "PAID" && (
        <button type="button" className="btn btn-dark" disabled={busy} onClick={() => setStatus("SHIPPED")}>
          배송중
        </button>
      )}
      {hasPaymentKey && (status === "PAID" || status === "SHIPPED") && (
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={cancelPayment}>
          결제취소
        </button>
      )}
      {msg && <span style={{ fontSize: "0.8rem", color: "#C62828" }}>{msg}</span>}
    </div>
  );
}
