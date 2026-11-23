"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function deleteAccount() {
    if (
      !confirm(
        "회원탈퇴하면 로그인 정보가 제거됩니다. 계속할까요?",
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/account", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "회원탈퇴 실패");
      router.replace("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "회원탈퇴 실패");
      setBusy(false);
    }
  }

  return (
    <div className="wrap section narrow">
      <header className="page-head" style={{ paddingTop: 0 }}>
        <h1>계정</h1>
        <p>스토어 정책에 따라 회원탈퇴를 제공합니다.</p>
      </header>
      <div className="panel">
        <p className="muted" style={{ marginBottom: "1rem" }}>
          회원탈퇴 시 카카오 연동 회원 정보와 푸시 토큰이 삭제됩니다.
        </p>
        {error && <p className="toast-error">{error}</p>}
        <button
          type="button"
          className="btn btn-ghost btn-block"
          disabled={busy}
          onClick={deleteAccount}
        >
          {busy ? "처리 중…" : "회원탈퇴"}
        </button>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/policies/privacy">개인정보처리방침</Link>
        </p>
      </div>
    </div>
  );
}
