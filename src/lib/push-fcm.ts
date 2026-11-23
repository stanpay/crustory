import { prisma } from "@/lib/prisma";

type PushPayload = {
  title: string;
  body: string;
  orderId?: string;
};

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ServiceAccount;
  } catch {
    console.error("FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON");
    return null;
  }
}

let cachedToken: { value: string; exp: number } | null = null;

function base64Url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp > now + 60) {
    return cachedToken.value;
  }

  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const crypto = await import("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(unsigned);
  sign.end();
  const signature = base64Url(sign.sign(sa.private_key));
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`FCM token exchange failed: ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, exp: now + (data.expires_in || 3600) };
  return data.access_token;
}

async function sendFcm(token: string, payload: PushPayload, sa: ServiceAccount) {
  const accessToken = await getAccessToken(sa);
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data: payload.orderId
            ? { orderId: payload.orderId, url: `/contact` }
            : undefined,
        },
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    if (text.includes("UNREGISTERED") || text.includes("INVALID_ARGUMENT")) {
      await prisma.pushDevice.deleteMany({ where: { token } });
    }
    throw new Error(`FCM send failed: ${text}`);
  }
}

export async function sendPushToTokens(tokens: string[], payload: PushPayload) {
  const sa = getServiceAccount();
  if (!sa || tokens.length === 0) return;

  await Promise.allSettled(tokens.map((token) => sendFcm(token, payload, sa)));
}

export async function sendPushToCustomer(customerId: string, payload: PushPayload) {
  const devices = await prisma.pushDevice.findMany({
    where: { customerId },
    select: { token: true },
  });
  await sendPushToTokens(
    devices.map((d) => d.token),
    payload,
  );
}
