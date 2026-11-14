"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  product: {
    slug: string;
    name: string;
    saleType: string;
    price: number;
    stock: number;
    published: boolean;
  };
};

export function ProductStockForm({ product }: Props) {
  const router = useRouter();
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [published, setPublished] = useState(product.published);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price, stock, published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "실패");
      setMsg("저장됨");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.saleType}</td>
      <td>
        <input
          className="qty-input"
          style={{ width: 100 }}
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </td>
      <td>
        <input
          className="qty-input"
          type="number"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
      </td>
      <td>
        <button type="button" className="btn btn-dark" disabled={saving} onClick={save}>
          {saving ? "…" : "저장"}
        </button>
        {msg && <span style={{ marginLeft: 8, fontSize: "0.8rem" }}>{msg}</span>}
      </td>
    </tr>
  );
}
