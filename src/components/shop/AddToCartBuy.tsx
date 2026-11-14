"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, parseOptions } from "@/lib/format";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    saleType: "NORMAL" | "PREORDER";
    options: string;
    stock: number;
  };
};

export function AddToCartBuy({ product }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const options = useMemo(() => parseOptions(product.options), [product.options]);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((o) => [o.name, o.values[0] || ""])),
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock <= 0;
  const maxQty = Math.max(1, Math.min(product.stock, 10));

  const optionLabel = options
    .map((o) => `${o.name}:${selected[o.name]}`)
    .filter((s) => !s.endsWith(":"))
    .join(" / ");

  const payload = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    saleType: product.saleType,
    option: optionLabel || undefined,
    quantity: qty,
  };

  return (
    <div className="pdp__form">
      {options.map((opt) => (
        <div key={opt.name} role="group" aria-labelledby={`opt-${opt.name}`}>
          <span className="field-label" id={`opt-${opt.name}`}>
            {opt.name}
          </span>
          <div className="chips">
            {opt.values.map((v) => (
              <button
                key={v}
                type="button"
                className="chip"
                aria-pressed={selected[opt.name] === v}
                onClick={() => setSelected((prev) => ({ ...prev, [opt.name]: v }))}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <span className="field-label" id="qty-label">수량</span>
        <div className="stepper" role="group" aria-labelledby="qty-label">
          <button
            type="button"
            aria-label="수량 줄이기"
            disabled={qty <= 1}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <output aria-live="polite">{qty}</output>
          <button
            type="button"
            aria-label="수량 늘리기"
            disabled={qty >= maxQty}
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
          >
            +
          </button>
        </div>
      </div>

      <div className="pdp__total">
        <span>총 상품금액</span>
        <strong>{formatPrice(product.price * qty)}</strong>
      </div>

      <div className="pdp__actions">
        <div className="buy-actions">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={soldOut}
            onClick={() => {
              addItem(payload);
              setAdded(true);
            }}
          >
            장바구니 담기
          </button>
          <button
            type="button"
            className="btn btn-dark"
            disabled={soldOut}
            onClick={() => {
              addItem(payload);
              router.push("/checkout");
            }}
          >
            {soldOut ? "품절" : product.saleType === "PREORDER" ? "예약 구매" : "바로 구매"}
          </button>
        </div>
      </div>

      {added && (
        <p className="added-msg" role="status">
          장바구니에 담았어요. <Link href="/cart">장바구니 보기</Link>
        </p>
      )}
      {!soldOut && product.stock <= 10 && (
        <p className="pdp__stock">남은 수량 {product.stock}개</p>
      )}
    </div>
  );
}
