"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { Runie } from "@/components/brand/Runie";
import { formatPrice } from "@/lib/format";

const FREE_SHIPPING = 50000;
const SHIPPING_FEE = 3000;

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, ready } = useCart();

  if (!ready) {
    return <div className="wrap section" aria-busy="true" />;
  }

  const shipping = total >= FREE_SHIPPING || total === 0 ? 0 : SHIPPING_FEE;
  const remain = FREE_SHIPPING - total;

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>장바구니</h1>
      </header>

      {items.length === 0 ? (
        <div className="empty-state">
          <Runie title="" />
          <p>장바구니가 비어 있어요. 러니도 심심해해요.</p>
          <Link href="/shop" className="btn btn-dark">러니 굿즈 보러 가기</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-list">
            {items.map((item) => (
              <li className="cart-row" key={`${item.productId}-${item.option || ""}`}>
                <Link href={`/shop/${item.slug}`} className="cart-row__img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" />
                </Link>
                <div>
                  <p className="cart-row__name">
                    <Link href={`/shop/${item.slug}`}>{item.name}</Link>
                  </p>
                  {item.option && <p className="cart-row__opt">{item.option.replace(/:/g, " · ")}</p>}
                  {item.saleType === "PREORDER" && (
                    <p className="cart-row__pre">예약판매 · 제작 후 순차 발송</p>
                  )}
                  <div className="cart-row__bottom">
                    <div className="stepper stepper--sm" role="group" aria-label={`${item.name} 수량`}>
                      <button
                        type="button"
                        aria-label="수량 줄이기"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.option)}
                      >
                        −
                      </button>
                      <output>{item.quantity}</output>
                      <button
                        type="button"
                        aria-label="수량 늘리기"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.option)}
                      >
                        +
                      </button>
                    </div>
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                  <p style={{ margin: "10px 0 0" }}>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => removeItem(item.productId, item.option)}
                    >
                      삭제
                    </button>
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <aside className="summary" aria-label="주문 금액">
            <h2>주문 금액</h2>
            <div className="summary-row">
              <span>상품 금액</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>{shipping === 0 ? "무료" : formatPrice(shipping)}</span>
            </div>
            <div className="summary-row total">
              <span>결제 예정 금액</span>
              <span>{formatPrice(total + shipping)}</span>
            </div>
            <Link href="/checkout" className="btn btn-dark btn-block" style={{ marginTop: 20 }}>
              주문하기
            </Link>
            <p className="fine">
              {remain > 0
                ? `${formatPrice(remain)} 더 담으면 무료배송이에요.`
                : "무료배송이 적용됐어요."}
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
