"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  memberId: string;
  memberName: string | null;
};

export function MemberDeleteButton({ memberId, memberName }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onDelete() {
    const label = memberName || "이 회원";
    if (
      !confirm(
        `${label} 계정을 삭제할까요?\n주문 기록은 남고, 계정 연결만 해제됩니다.`,
      )
    ) {
      return;
    }

    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/customers/${memberId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "삭제 실패");
      router.push("/admin/members");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "삭제 실패");
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={busy}
        onClick={onDelete}
        style={{ color: "#C62828" }}
      >
        {busy ? "삭제 중…" : "계정 삭제"}
      </button>
      {msg && <span style={{ fontSize: "0.8rem", color: "#C62828" }}>{msg}</span>}
    </div>
  );
}
