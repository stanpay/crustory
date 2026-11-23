"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  status: string;
};

export function OrderActions({ orderId, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function setStatus(next: string) {
    if (next === "CANCELLED" && !confirm("주문을 취소하고 재고를 복구할까요?")) {
      return;
    }
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

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", alignItems: "center" }}>
      {status === "PENDING" && (
        <>
          <button
            type="button"
            className="btn btn-dark"
            disabled={busy}
            onClick={() => setStatus("PAID")}
          >
            접수 확인
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => setStatus("CANCELLED")}
          >
            취소
          </button>
        </>
      )}
      {status === "PAID" && (
        <>
          <button
            type="button"
            className="btn btn-dark"
            disabled={busy}
            onClick={() => setStatus("SHIPPED")}
          >
            배송중
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => setStatus("CANCELLED")}
          >
            취소
          </button>
        </>
      )}
      {msg && <span style={{ fontSize: "0.8rem", color: "#C62828" }}>{msg}</span>}
    </div>
  );
}
