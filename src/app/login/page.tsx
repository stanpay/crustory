"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginInner() {
  const params = useSearchParams();
  const error = params.get("error");
  const next = params.get("next") || "/order/lookup";
  const href = `/api/auth/kakao?next=${encodeURIComponent(next)}`;

  return (
    <div className="wrap section narrow">
      <header className="page-head" style={{ paddingTop: 0 }}>
        <h1>로그인</h1>
        <p>카카오 계정으로 로그인하면 내 주문을 바로 확인할 수 있습니다.</p>
      </header>

      <div className="panel">
        {error && <p className="toast-error">{error}</p>}
        <a href={href} className="btn btn-kakao btn-block">
          카카오로 계속하기
        </a>
        <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "var(--muted, #666)" }}>
          비회원으로 구매한 주문은 로그인 후 이메일·주문번호로도 확인할 수 있습니다.
        </p>
        <p style={{ marginTop: "0.75rem" }}>
          <Link href="/order/lookup">주문 조회로 이동</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="wrap section">로딩 중…</div>}>
      <LoginInner />
    </Suspense>
  );
}
