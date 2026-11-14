const TOSS_API = "https://api.tosspayments.com/v1";

function getSecretKey() {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) throw new Error("TOSS_SECRET_KEY is not set");
  return key;
}

function authHeader() {
  const encoded = Buffer.from(`${getSecretKey()}:`).toString("base64");
  return `Basic ${encoded}`;
}

export async function confirmPayment(input: {
  paymentKey: string;
  orderId: string;
  amount: number;
}) {
  const res = await fetch(`${TOSS_API}/payments/confirm`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Payment confirmation failed");
  }
  return data;
}

export async function cancelPayment(input: {
  paymentKey: string;
  cancelReason: string;
}) {
  const res = await fetch(
    `${TOSS_API}/payments/${input.paymentKey}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancelReason: input.cancelReason }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Payment cancel failed");
  }
  return data;
}
