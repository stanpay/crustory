"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductImageField } from "@/components/admin/ProductImageField";

export type ProductOptionDraft = { name: string; values: string };

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  saleType: "NORMAL" | "PREORDER";
  category: string;
  published: boolean;
  featured: boolean;
  options: ProductOptionDraft[];
};

type Props = {
  mode: "create" | "edit";
  initial: ProductFormValues;
};

function toPayload(values: ProductFormValues) {
  const options = values.options
    .map((opt) => ({
      name: opt.name.trim(),
      values: opt.values
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    }))
    .filter((opt) => opt.name && opt.values.length > 0);

  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
    price: Number(values.price),
    stock: Number(values.stock),
    images: values.images.filter(Boolean),
    saleType: values.saleType,
    category: values.category.trim() || "goods",
    published: values.published,
    featured: values.featured,
    options,
  };
}

export function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function setField<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateOption(index: number, patch: Partial<ProductOptionDraft>) {
    setValues((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? { ...opt, ...patch } : opt)),
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const payload = toPayload(values);
      if (!payload.name || !payload.slug || !payload.description) {
        throw new Error("이름, 슬러그, 설명을 입력해 주세요.");
      }
      if (Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
        throw new Error("가격과 재고는 숫자여야 합니다.");
      }

      const res =
        mode === "create"
          ? await fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/products/${initial.slug}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: payload.name,
                description: payload.description,
                price: payload.price,
                stock: payload.stock,
                images: payload.images,
                saleType: payload.saleType,
                category: payload.category,
                published: payload.published,
                featured: payload.featured,
                options: payload.options,
              }),
            });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "저장 실패");

      setMsg("저장되었습니다.");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 720, marginTop: "1.25rem" }}>
      <div className="form-field">
        <label htmlFor="product-name">상품명</label>
        <input
          id="product-name"
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="product-slug">슬러그 (URL)</label>
        <input
          id="product-slug"
          value={values.slug}
          onChange={(e) => setField("slug", e.target.value)}
          required
          disabled={mode === "edit"}
          placeholder="runie-plush-keyring"
        />
        {mode === "edit" && (
          <p style={{ marginTop: 6, fontSize: "0.8rem", color: "#6b6560" }}>
            슬러그는 수정할 수 없습니다.
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="product-description">설명</label>
        <textarea
          id="product-description"
          rows={4}
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="form-field">
          <label htmlFor="product-price">가격 (원)</label>
          <input
            id="product-price"
            type="number"
            min={0}
            value={values.price}
            onChange={(e) => setField("price", Number(e.target.value))}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="product-stock">재고</label>
          <input
            id="product-stock"
            type="number"
            min={0}
            value={values.stock}
            onChange={(e) => setField("stock", Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="form-field">
          <label htmlFor="product-sale-type">판매 유형</label>
          <select
            id="product-sale-type"
            value={values.saleType}
            onChange={(e) => setField("saleType", e.target.value as "NORMAL" | "PREORDER")}
          >
            <option value="NORMAL">NORMAL (일반)</option>
            <option value="PREORDER">PREORDER (예약)</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="product-category">카테고리</label>
          <input
            id="product-category"
            value={values.category}
            onChange={(e) => setField("category", e.target.value)}
            placeholder="goods"
          />
        </div>
      </div>

      <ProductImageField
        images={values.images}
        onChange={(images) => setField("images", images)}
      />

      <div className="form-field">
        <label>옵션</label>
        {values.options.map((opt, index) => (
          <div
            key={index}
            style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 8, marginBottom: 8 }}
          >
            <input
              placeholder="옵션명 (색상)"
              value={opt.name}
              onChange={(e) => updateOption(index, { name: e.target.value })}
            />
            <input
              placeholder="값 (콤마 구분: 크림, 러스트)"
              value={opt.values}
              onChange={(e) => updateOption(index, { values: e.target.value })}
            />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setValues((prev) => ({
                  ...prev,
                  options: prev.options.filter((_, i) => i !== index),
                }))
              }
            >
              삭제
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            setValues((prev) => ({
              ...prev,
              options: [...prev.options, { name: "", values: "" }],
            }))
          }
        >
          옵션 추가
        </button>
      </div>

      <div className="form-field" style={{ display: "flex", gap: "1.5rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={values.published}
            onChange={(e) => setField("published", e.target.checked)}
          />
          공개
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => setField("featured", e.target.checked)}
          />
          추천(메인 노출)
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: "0.5rem" }}>
        <button type="submit" className="btn btn-dark" disabled={saving}>
          {saving ? "저장 중…" : mode === "create" ? "상품 등록" : "수정 저장"}
        </button>
        <Link href="/admin/products" className="btn btn-ghost">
          목록
        </Link>
        {msg && <span style={{ fontSize: "0.85rem" }}>{msg}</span>}
      </div>
    </form>
  );
}
