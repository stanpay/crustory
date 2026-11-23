"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MarkdownInline } from "@/components/MarkdownInline";

export type NoticeFormValues = {
  title: string;
  active: boolean;
};

type Props = {
  mode: "create" | "edit";
  noticeId?: string;
  initial: NoticeFormValues;
};

export function NoticeForm({ mode, noticeId, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function setField<K extends keyof NoticeFormValues>(key: K, value: NoticeFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const title = values.title.trim();
      if (!title) {
        throw new Error("상단 공지 문구를 입력해 주세요.");
      }

      const payload = {
        title,
        active: values.active,
      };

      const res =
        mode === "create"
          ? await fetch("/api/admin/notices", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/notices/${noticeId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "저장 실패");

      setMsg("저장되었습니다.");
      router.push("/admin/notices");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!noticeId) return;
    if (!window.confirm("이 공지를 삭제할까요?")) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/notices/${noticeId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "삭제 실패");
      router.push("/admin/notices");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "삭제 실패");
      setSaving(false);
    }
  }

  const previewTitle = values.title.trim();

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 720, marginTop: "1.25rem" }}>
      <div className="form-field">
        <label htmlFor="notice-title">상단 공지 문구</label>
        <textarea
          id="notice-title"
          rows={4}
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
          required
          placeholder="러니 여행노트 예약판매 중 · [보러 가기](/shop?type=PREORDER)"
        />
        <p style={{ marginTop: 6, fontSize: "0.8rem", color: "#6b6560" }}>
          마크다운으로 작성합니다. 예: <code>**굵게**</code>,{" "}
          <code>[링크 문구](/shop)</code>
        </p>
      </div>

      <div className="form-field">
        <label>미리보기</label>
        <div className="announce" style={{ marginTop: 6, borderRadius: 4 }}>
          {previewTitle ? (
            <MarkdownInline source={previewTitle} />
          ) : (
            <span style={{ opacity: 0.55 }}>공지 문구를 입력하면 여기에 표시됩니다.</span>
          )}
        </div>
      </div>

      <div className="form-field">
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => setField("active", e.target.checked)}
          />
          상단에 노출
        </label>
        <p style={{ marginTop: 6, fontSize: "0.8rem", color: "#6b6560" }}>
          노출로 저장하면 다른 공지의 상단 노출은 자동으로 해제됩니다.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: "1.25rem" }}>
        <button type="submit" className="btn btn-dark" disabled={saving}>
          {saving ? "저장 중…" : "저장"}
        </button>
        <Link href="/admin/notices" className="btn btn-ghost">
          목록
        </Link>
        {mode === "edit" && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={saving}
            onClick={onDelete}
            style={{ color: "#c62828" }}
          >
            삭제
          </button>
        )}
      </div>
      {msg && (
        <p style={{ marginTop: 12, fontSize: "0.9rem", color: "#6b6560" }}>{msg}</p>
      )}
    </form>
  );
}
