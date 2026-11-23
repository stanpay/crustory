"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginInner() {
  const params = useSearchParams();
  const error = params.get("error");
  const next = params.get("next") || "/";
  const href = `/api/auth/kakao?next=${encodeURIComponent(next)}`;

  return (
    <div className="wrap section narrow">
      <header className="page-head" style={{ paddingTop: 0 }}>
        <h1>로그인</h1>
        <p>카카오 계정으로 로그인하면 앱 알림·계정 관리를 이용할 수 있습니다.</p>
      </header>

      <div className="panel">
        {error && <p className="toast-error">{error}</p>}
        <a href={href} className="btn btn-kakao btn-block">
          카카오로 계속하기
        </a>
        <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "var(--muted, #666)" }}>
          상품 문의는 로그인 없이도 <Link href="/contact">문의하기</Link>에서 가능합니다.
        </p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
          <Link href="/account">회원탈퇴</Link>
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
