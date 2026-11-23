"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function ContactInner() {
  const params = useSearchParams();
  const subject = params.get("subject");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subject) return;
    setForm((f) =>
      f.message ? f : { ...f, message: `[${subject}]\n` },
    );
  }, [subject]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "실패");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "전송 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap section narrow">
      <header className="page-head" style={{ paddingTop: 0 }}>
        <h1>문의하기</h1>
      </header>
      <p className="muted center" style={{ marginTop: -8, marginBottom: 32 }}>
        상품·매장·협업 문의를 남겨 주세요. 온라인 주문은 받지 않습니다.
      </p>

      {done ? (
        <div className="panel">
          <p>문의가 잘 접수됐어요. 확인하는 대로 답장드릴게요.</p>
        </div>
      ) : (
        <form className="panel" onSubmit={onSubmit}>
          <div className="form-field">
            <label htmlFor="name">이름</label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="form-field">
            <label htmlFor="message">내용</label>
            <textarea
              id="message"
              rows={5}
              required
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-dark btn-block" disabled={loading}>
            {loading ? "전송 중…" : "보내기"}
          </button>
          {error && <p className="toast-error">{error}</p>}
        </form>
      )}
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="wrap section">로딩 중…</div>}>
      <ContactInner />
    </Suspense>
  );
}
