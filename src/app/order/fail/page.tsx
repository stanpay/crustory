"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function FailInner() {
  const params = useSearchParams();
  const code = params.get("code");
  const message = params.get("message");

  return (
    <div className="wrap section narrow center">
      <header className="page-head" style={{ paddingTop: 0 }}>
        <h1>결제가 완료되지 않았습니다</h1>
      </header>
      <p className="muted">
        {message || "결제가 취소되었거나 실패했습니다."}
      </p>
      {code && (
        <p className="note">코드: {code}</p>
      )}
      <div className="actions-row">
        <Link href="/checkout" className="btn btn-dark">
          다시 시도
        </Link>
        <Link href="/cart" className="btn btn-ghost">
          장바구니
        </Link>
      </div>
    </div>
  );
}

export default function OrderFailPage() {
  return (
    <Suspense fallback={<div className="wrap section">로딩 중…</div>}>
      <FailInner />
    </Suspense>
  );
}
