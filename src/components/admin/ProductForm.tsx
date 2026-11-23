"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductImageField } from "@/components/admin/ProductImageField";
import { ProductDetailEditor } from "@/components/admin/ProductDetailEditor";

export type ProductOptionDraft = { name: string; values: string };

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  detailHtml: string;
  detailCss: string;
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

type FieldKey =
  | "name"
  | "slug"
  | "description"
  | "price"
  | "stock"
  | "category"
  | "saleType"
  | "options"
  | "images";

type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_ORDER: FieldKey[] = [
  "name",
  "slug",
  "description",
  "price",
  "stock",
  "saleType",
  "category",
  "options",
  "images",
];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
    slug: values.slug.trim().toLowerCase(),
    description: values.description.trim(),
    detailHtml: values.detailHtml,
    detailCss: values.detailCss,
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

function validateForm(values: ProductFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  const slug = values.slug.trim().toLowerCase();
  const description = values.description.trim();
  const category = values.category.trim();
  const price = Number(values.price);
  const stock = Number(values.stock);

  if (!name) errors.name = "상품명을 입력해 주세요.";
  if (!slug) errors.slug = "슬러그를 입력해 주세요.";
  else if (!SLUG_RE.test(slug)) {
    errors.slug = "영문 소문자, 숫자, 하이픈만 사용하세요. (예: runie-plush-keyring)";
  }
  if (!description) errors.description = "설명을 입력해 주세요.";

  if (values.price === undefined || values.price === null || Number.isNaN(price)) {
    errors.price = "가격은 숫자여야 합니다.";
  } else if (!Number.isInteger(price) || price < 0) {
    errors.price = "가격은 0 이상의 정수여야 합니다.";
  }

  if (values.stock === undefined || values.stock === null || Number.isNaN(stock)) {
    errors.stock = "재고는 숫자여야 합니다.";
  } else if (!Number.isInteger(stock) || stock < 0) {
    errors.stock = "재고는 0 이상의 정수여야 합니다.";
  }

  if (!values.saleType || (values.saleType !== "NORMAL" && values.saleType !== "PREORDER")) {
    errors.saleType = "판매 유형을 선택해 주세요.";
  }

  if (!category) errors.category = "카테고리를 입력해 주세요.";

  const incompleteOption = values.options.some((opt) => {
    const n = opt.name.trim();
    const v = opt.values
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    return (n && v.length === 0) || (!n && v.length > 0);
  });
  if (incompleteOption) {
    errors.options = "옵션명과 값을 함께 입력하거나, 빈 옵션 행을 삭제해 주세요.";
  }

  return errors;
}

function mapServerErrorToField(message: string): FieldKey | null {
  if (/슬러그/.test(message)) return "slug";
  if (/상품명|이름/.test(message)) return "name";
  if (/설명/.test(message)) return "description";
  if (/가격/.test(message)) return "price";
  if (/재고/.test(message)) return "stock";
  if (/카테고리/.test(message)) return "category";
  if (/판매\s*유형|saleType/i.test(message)) return "saleType";
  if (/옵션/.test(message)) return "options";
  if (/이미지/.test(message)) return "images";
  return null;
}

function firstErrorField(errors: FieldErrors): FieldKey | null {
  return FIELD_ORDER.find((key) => errors[key]) ?? null;
}

function focusField(field: FieldKey) {
  const el = document.querySelector<HTMLElement>(`[data-field="${field}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusable = el.querySelector<HTMLElement>("input, textarea, select, button");
  focusable?.focus({ preventScroll: true });
}

function FieldHint({
  error,
  hint,
}: {
  error?: string;
  hint?: string;
}) {
  if (error) return <p className="form-field__error">{error}</p>;
  if (hint) {
    return <p style={{ marginTop: 6, fontSize: "0.8rem", color: "#6b6560" }}>{hint}</p>;
  }
  return null;
}

export function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState<"ok" | "error">("ok");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function setField<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    if (FIELD_ORDER.includes(key as FieldKey)) {
      setFieldErrors((prev) => {
        if (!prev[key as FieldKey]) return prev;
        const next = { ...prev };
        delete next[key as FieldKey];
        return next;
      });
    }
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateOption(index: number, patch: Partial<ProductOptionDraft>) {
    setFieldErrors((prev) => {
      if (!prev.options) return prev;
      const next = { ...prev };
      delete next.options;
      return next;
    });
    setValues((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? { ...opt, ...patch } : opt)),
    }));
  }

  function applyErrors(errors: FieldErrors, footerMessage?: string) {
    setFieldErrors(errors);
    const first = firstErrorField(errors);
    const message = footerMessage || (first ? errors[first] : "입력값을 확인해 주세요.") || "저장 실패";
    setMsg(message);
    setMsgTone("error");
    if (first) setTimeout(() => focusField(first), 50);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setMsgTone("ok");
    setFieldErrors({});

    try {
      const localErrors = validateForm(values);
      if (Object.keys(localErrors).length > 0) {
        applyErrors(localErrors);
        return;
      }

      const payload = toPayload(values);

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
                slug: payload.slug,
                description: payload.description,
                detailHtml: payload.detailHtml,
                detailCss: payload.detailCss,
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
      if (!res.ok) {
        const message = (data.error as string) || "저장 실패";
        const field = mapServerErrorToField(message);
        if (field) applyErrors({ [field]: message }, message);
        else {
          setMsg(message);
          setMsgTone("error");
        }
        return;
      }

      setMsg("저장되었습니다.");
      setMsgTone("ok");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "저장 실패";
      const field = mapServerErrorToField(message);
      if (field) applyErrors({ [field]: message }, message);
      else {
        setMsg(message);
        setMsgTone("error");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-product-form" noValidate>
      <div
        className={`form-field${fieldErrors.name ? " is-error" : ""}`}
        data-field="name"
      >
        <label htmlFor="product-name">상품명</label>
        <input
          id="product-name"
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          aria-invalid={fieldErrors.name ? true : undefined}
        />
        <FieldHint error={fieldErrors.name} />
      </div>

      <div
        className={`form-field${fieldErrors.slug ? " is-error" : ""}`}
        data-field="slug"
      >
        <label htmlFor="product-slug">슬러그 (URL)</label>
        <input
          id="product-slug"
          value={values.slug}
          onChange={(e) => setField("slug", e.target.value)}
          placeholder="runie-plush-keyring"
          title="영문 소문자, 숫자, 하이픈만 사용 (예: runie-plush-keyring)"
          aria-invalid={fieldErrors.slug ? true : undefined}
        />
        <FieldHint
          error={fieldErrors.slug}
          hint="상품 상세 URL에 쓰입니다. 바꾸면 기존 링크는 더 이상 열리지 않습니다."
        />
      </div>

      <div
        className={`form-field${fieldErrors.description ? " is-error" : ""}`}
        data-field="description"
      >
        <label htmlFor="product-description">설명</label>
        <textarea
          id="product-description"
          rows={4}
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          aria-invalid={fieldErrors.description ? true : undefined}
        />
        <FieldHint error={fieldErrors.description} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div
          className={`form-field${fieldErrors.price ? " is-error" : ""}`}
          data-field="price"
        >
          <label htmlFor="product-price">가격 (원)</label>
          <input
            id="product-price"
            type="number"
            min={0}
            step={1}
            value={values.price}
            onChange={(e) => setField("price", Number(e.target.value))}
            aria-invalid={fieldErrors.price ? true : undefined}
          />
          <FieldHint error={fieldErrors.price} />
        </div>
        <div
          className={`form-field${fieldErrors.stock ? " is-error" : ""}`}
          data-field="stock"
        >
          <label htmlFor="product-stock">재고</label>
          <input
            id="product-stock"
            type="number"
            min={0}
            step={1}
            value={values.stock}
            onChange={(e) => setField("stock", Number(e.target.value))}
            aria-invalid={fieldErrors.stock ? true : undefined}
          />
          <FieldHint error={fieldErrors.stock} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div
          className={`form-field${fieldErrors.saleType ? " is-error" : ""}`}
          data-field="saleType"
        >
          <label htmlFor="product-sale-type">판매 유형</label>
          <select
            id="product-sale-type"
            value={values.saleType}
            onChange={(e) => setField("saleType", e.target.value as "NORMAL" | "PREORDER")}
            aria-invalid={fieldErrors.saleType ? true : undefined}
          >
            <option value="NORMAL">NORMAL (일반)</option>
            <option value="PREORDER">PREORDER (예약)</option>
          </select>
          <FieldHint error={fieldErrors.saleType} />
        </div>
        <div
          className={`form-field${fieldErrors.category ? " is-error" : ""}`}
          data-field="category"
        >
          <label htmlFor="product-category">카테고리</label>
          <input
            id="product-category"
            value={values.category}
            onChange={(e) => setField("category", e.target.value)}
            placeholder="goods"
            aria-invalid={fieldErrors.category ? true : undefined}
          />
          <FieldHint error={fieldErrors.category} />
        </div>
      </div>

      <div
        className={`form-field${fieldErrors.options ? " is-error" : ""}`}
        data-field="options"
      >
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
        <FieldHint error={fieldErrors.options} />
      </div>

      <div
        className={`form-field${fieldErrors.images ? " is-error" : ""}`}
        data-field="images"
        style={{ marginBottom: 0 }}
      >
        <ProductImageField
          images={values.images}
          onChange={(images) => setField("images", images)}
        />
        <FieldHint error={fieldErrors.images} />
      </div>

      <ProductDetailEditor
        html={values.detailHtml}
        css={values.detailCss}
        onHtmlChange={(detailHtml) => setField("detailHtml", detailHtml)}
        onCssChange={(detailCss) => setField("detailCss", detailCss)}
      />

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

      <div
        className="admin-product-form__footer"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 45,
          display: "flex",
          justifyContent: "flex-end",
          padding: "10px 1rem",
          background: "rgba(246, 244, 241, 0.94)",
          borderTop: "1px solid var(--line)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="admin-product-form__footer-inner"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
            justifyContent: "flex-end",
            width: "100%",
            maxWidth: 720,
            marginLeft: "auto",
          }}
        >
          {msg && (
            <span
              className={`admin-product-form__footer-msg${msgTone === "error" ? " is-error" : " is-ok"}`}
              style={{
                marginRight: "auto",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: msgTone === "error" ? "#b71c1c" : "#2f6b3a",
              }}
            >
              {msg}
            </span>
          )}
          <button
            type="submit"
            className="btn btn-dark admin-product-form__footer-btn"
            style={{ minHeight: 44, height: 44, padding: "0 18px", fontSize: "0.9rem" }}
            disabled={saving}
          >
            {saving ? "저장 중…" : mode === "create" ? "상품 등록" : "수정 저장"}
          </button>
          <Link
            href="/admin/products"
            className="btn btn-ghost admin-product-form__footer-btn"
            style={{ minHeight: 44, height: 44, padding: "0 18px", fontSize: "0.9rem" }}
          >
            목록
          </Link>
        </div>
      </div>
    </form>
  );
}
