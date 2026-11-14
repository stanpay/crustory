"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@crustory.com");
  const [password, setPassword] = useState("crustoryadmin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "로그인 실패");
      // Soft nav + refresh는 세션 쿠키 반영이 늦고 이중 fetch가 나서 전체 이동
      window.location.assign("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 실패");
      setLoading(false);
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 420 }}>
      <p className="section-label">Admin</p>
      <h1 className="section-title">로그인</h1>
      <form className="panel" style={{ marginTop: "1.5rem" }} onSubmit={onSubmit}>
        <div className="form-field">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-dark btn-block" disabled={loading}>
          {loading ? "확인 중…" : "로그인"}
        </button>
        {error && <p className="toast-error">{error}</p>}
      </form>
    </div>
  );
}
