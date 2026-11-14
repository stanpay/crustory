"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "";

type Widgets = {
  setAmount: (amount: { currency: string; value: number }) => Promise<void>;
  renderPaymentMethods: (opts: {
    selector: string;
    variantKey: string;
  }) => Promise<{ destroy?: () => Promise<void> } | unknown>;
  renderAgreement: (opts: {
    selector: string;
    variantKey: string;
  }) => Promise<{ destroy?: () => Promise<void> } | unknown>;
  requestPayment: (opts: Record<string, unknown>) => Promise<unknown>;
};

function clearWidgetMount(selector: string) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = "";
}

export function CheckoutClient() {
  const router = useRouter();
  const { items, total, ready, clearCart } = useCart();
  const [widgets, setWidgets] = useState<Widgets | null>(null);
  const [widgetsReady, setWidgetsReady] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    shippingMemo: "",
  });
  const [loggedIn, setLoggedIn] = useState(false);

  const shippingFee = total >= 50000 || total === 0 ? 0 : 3000;
  const payAmount = total + shippingFee;

  const orderName = useMemo(() => {
    if (items.length === 0) return "CRUSTORY";
    if (items.length === 1) return items[0].name;
    return `${items[0].name} 외 ${items.length - 1}건`;
  }, [items]);

  useEffect(() => {
    if (!ready) return;
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [ready, items.length, router]);

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (cancelled || !data.user) return;
        setLoggedIn(true);
        setForm((f) => ({
          ...f,
          customerName: f.customerName || data.user.name || "",
          customerEmail: f.customerEmail || data.user.email || "",
        }));
      } catch {
        // ignore
      }
    }
    void loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  // 1) SDK 초기화 (공식 샘플과 동일하게 분리)
  useEffect(() => {
    if (!clientKey || payAmount <= 0) return;

    let cancelled = false;

    async function initWidgets() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const next = tossPayments.widgets({
          customerKey: ANONYMOUS,
        }) as unknown as Widgets;
        if (!cancelled) setWidgets(next);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          const message =
            e instanceof Error ? e.message : "SDK 초기화에 실패했습니다.";
          setError(`결제 UI를 불러오지 못했습니다. ${message}`);
        }
      }
    }

    void initWidgets();
    return () => {
      cancelled = true;
    };
  }, [payAmount]);

  // 2) 결제 UI 렌더링
  useEffect(() => {
    if (!widgets || payAmount <= 0) return;

    let cancelled = false;
    let paymentMethodsWidget: { destroy?: () => Promise<void> } | null = null;
    let agreementWidget: { destroy?: () => Promise<void> } | null = null;

    async function renderWidgets() {
      setWidgetsReady(false);
      setError("");
      try {
        clearWidgetMount("#payment-method");
        clearWidgetMount("#agreement");

        await widgets!.setAmount({ currency: "KRW", value: payAmount });

        const [methods, agreement] = await Promise.all([
          widgets!.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          widgets!.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          }),
        ]);

        paymentMethodsWidget = methods as { destroy?: () => Promise<void> };
        agreementWidget = agreement as { destroy?: () => Promise<void> };

        if (!cancelled) setWidgetsReady(true);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          const message =
            e instanceof Error ? e.message : "위젯 렌더링에 실패했습니다.";
          setError(`결제 UI를 불러오지 못했습니다. ${message}`);
        }
      }
    }

    void renderWidgets();

    return () => {
      cancelled = true;
      void paymentMethodsWidget?.destroy?.();
      void agreementWidget?.destroy?.();
      clearWidgetMount("#payment-method");
      clearWidgetMount("#agreement");
      setWidgetsReady(false);
    };
  }, [widgets, payAmount]);

  async function handlePay() {
    setError("");
    if (!widgets) return;
    if (
      !form.customerName ||
      !form.customerEmail ||
      !form.customerPhone ||
      !form.shippingAddress
    ) {
      setError("주문자·배송 정보를 모두 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const createRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: payAmount,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            option: i.option,
          })),
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || "주문 생성 실패");
      }

      const origin = window.location.origin;
      await widgets.requestPayment({
        orderId: createData.orderId,
        orderName,
        customerEmail: form.customerEmail,
        customerName: form.customerName,
        customerMobilePhone: form.customerPhone.replace(/\D/g, ""),
        successUrl: `${origin}/order/success`,
        failUrl: `${origin}/order/fail`,
      });
      clearCart();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "결제 요청 중 오류가 발생했습니다.",
      );
      setSubmitting(false);
    }
  }

  if (!ready || items.length === 0) {
    return (
      <div className="wrap section">
        <p className="muted">주문서를 준비하고 있어요…</p>
      </div>
    );
  }

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>주문서</h1>
      </header>
      <div className="checkout-grid">
      <div>
        <div className="panel">
          <h2>주문자·배송 정보</h2>
          {loggedIn ? (
            <p className="muted" style={{ marginBottom: "1rem" }}>
              로그인 계정 정보가 자동으로 채워집니다. 결제 후 내 주문에서 확인할 수 있습니다.
            </p>
          ) : (
            <p className="muted" style={{ marginBottom: "1rem" }}>
              <a href={`/api/auth/kakao?next=${encodeURIComponent("/checkout")}`}>
                카카오 로그인
              </a>
              하면 주문 조회가 더 편해집니다.
            </p>
          )}
          {(
            [
              ["customerName", "이름", "text"],
              ["customerEmail", "이메일", "email"],
              ["customerPhone", "휴대폰", "tel"],
              ["shippingAddress", "배송지", "text"],
            ] as const
          ).map(([key, label, type]) => (
            <div className="form-field" key={key}>
              <label htmlFor={key}>{label}</label>
              <input
                id={key}
                type={type}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                required
              />
            </div>
          ))}
          <div className="form-field">
            <label htmlFor="shippingMemo">배송 메모</label>
            <textarea
              id="shippingMemo"
              rows={3}
              value={form.shippingMemo}
              onChange={(e) =>
                setForm((f) => ({ ...f, shippingMemo: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="panel">
          <h2>결제 수단</h2>
          <div id="payment-method" />
          <div id="agreement" style={{ marginTop: "1rem" }} />
          {!widgetsReady && !error && (
            <p className="muted" style={{ fontSize: 14 }}>
              결제 수단을 불러오는 중…
            </p>
          )}
        </div>
      </div>

      <div>
        <aside className="summary" style={{ position: "sticky", top: "calc(var(--header-h) + 64px)" }}>
          <h2>주문 상품</h2>
          {items.map((item) => (
            <div
              className="summary-row"
              key={`${item.productId}-${item.option}`}
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>배송비</span>
            <span>{shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</span>
          </div>
          <div className="summary-row total">
            <span>결제 금액</span>
            <span>{formatPrice(payAmount)}</span>
          </div>
          <button
            type="button"
            className="btn btn-dark btn-block"
            style={{ marginTop: 20 }}
            disabled={!widgetsReady || submitting}
            onClick={handlePay}
          >
            {submitting ? "처리 중…" : `${formatPrice(payAmount)} 결제하기`}
          </button>
          {error && <p className="toast-error">{error}</p>}
          <p className="fine">
            토스페이먼츠 테스트(샌드박스) 결제예요. 실제 금액은 청구되지 않아요.
          </p>
        </aside>
      </div>
      </div>
    </div>
  );
}
