"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

type Props = {
  product: {
    slug: string;
    name: string;
    saleType: string;
    stock: number;
    published: boolean;
    featured: boolean;
    imageUrl: string | null;
  };
};

export function ProductStockForm({ product }: Props) {
  const router = useRouter();
  const editHref = `/admin/products/${product.slug}/edit`;
  const [stock, setStock] = useState(product.stock);
  const [savedStock, setSavedStock] = useState(product.stock);
  const [saleType, setSaleType] = useState<"NORMAL" | "PREORDER">(
    product.saleType === "PREORDER" ? "PREORDER" : "NORMAL",
  );
  const [published, setPublished] = useState(product.published);
  const [featured, setFeatured] = useState(product.featured);
  const [savingStock, setSavingStock] = useState(false);
  const [patching, setPatching] = useState(false);
  const [msg, setMsg] = useState("");

  const stockDirty = stock !== savedStock;

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/products/${product.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "실패");
    router.refresh();
  }

  async function confirmStock(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!stockDirty || savingStock) return;
    setSavingStock(true);
    setMsg("");
    try {
      await patch({ stock });
      setSavedStock(stock);
      setMsg("저장됨");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "실패");
    } finally {
      setSavingStock(false);
    }
  }

  async function patchField(body: Record<string, unknown>, rollback: () => void) {
    if (patching) return;
    setPatching(true);
    setMsg("");
    try {
      await patch(body);
    } catch (err) {
      rollback();
      setMsg(err instanceof Error ? err.message : "실패");
    } finally {
      setPatching(false);
    }
  }

  function onCardClick(e: MouseEvent<HTMLElement>) {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, select, label, textarea")) return;
    router.push(editHref);
  }

  return (
    <article
      className="admin-product-card is-clickable"
      onClick={onCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          const target = e.target as HTMLElement;
          if (target.closest("a, button, input, select, label, textarea")) return;
          e.preventDefault();
          router.push(editHref);
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`${product.name} 수정 페이지로 이동`}
    >
      <div className="admin-product-card__media">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" />
        ) : (
          <div className="admin-product-card__media-empty" aria-hidden>
            No image
          </div>
        )}
      </div>

      <div className="admin-product-card__body">
        <div className="admin-product-card__head">
          <div className="admin-product-card__title-block">
            <h2 className="admin-product-card__name">{product.name}</h2>
            <label className="admin-product-card__sale">
              <span className="sr-only">판매 유형</span>
              <select
                className="admin-product-card__sale-select"
                value={saleType}
                onChange={(e) => {
                  const next = e.target.value as "NORMAL" | "PREORDER";
                  const prev = saleType;
                  setSaleType(next);
                  void patchField({ saleType: next }, () => setSaleType(prev));
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="NORMAL">판매중</option>
                <option value="PREORDER">예약</option>
              </select>
            </label>
          </div>
          <div className="admin-product-card__toggles">
            <label className="admin-product-card__publish">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => {
                  const next = e.target.checked;
                  const prev = published;
                  setPublished(next);
                  void patchField({ published: next }, () => setPublished(prev));
                }}
              />
              공개
            </label>
            <label className="admin-product-card__publish">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => {
                  const next = e.target.checked;
                  const prev = featured;
                  setFeatured(next);
                  void patchField({ featured: next }, () => setFeatured(prev));
                }}
              />
              추천
            </label>
          </div>
        </div>

        <div className="admin-product-card__stock-row">
          <label className="admin-product-card__stock-field">
            <span className="admin-product-card__stock-label">재고</span>
            <input
              className="qty-input qty-input--no-spin admin-product-card__stock-input"
              type="number"
              inputMode="numeric"
              min={0}
              value={stock}
              onChange={(e) => {
                setStock(Math.max(0, Number(e.target.value) || 0));
                setMsg("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void confirmStock(e as unknown as MouseEvent);
                }
              }}
            />
          </label>
          <button
            type="button"
            className="admin-product-card__stock-confirm"
            disabled={!stockDirty || savingStock}
            onClick={confirmStock}
          >
            {savingStock ? "…" : "확인"}
          </button>
          {msg && <span className="admin-product-card__msg">{msg}</span>}
        </div>
      </div>
    </article>
  );
}
