"use client";

import { useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const params = useSearchParams();
  const error = params.get("error");
  const href = `/api/auth/kakao?next=${encodeURIComponent("/admin")}`;

  return (
    <div className="container section" style={{ maxWidth: 420 }}>
      <p className="section-label">Admin</p>
      <h1 className="section-title">로그인</h1>
      <div className="panel" style={{ marginTop: "1.5rem" }}>
        {error && <p className="toast-error">{error}</p>}
        <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "var(--muted, #666)" }}>
          허용된 카카오 계정으로만 관리자 페이지에 접속할 수 있습니다.
        </p>
        <a href={href} className="btn btn-kakao btn-block">
          카카오로 로그인
        </a>
      </div>
    </div>
  );
}
