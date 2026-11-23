import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { prisma } from "./prisma";

const COOKIE_NAME = "crustory_customer";
const STATE_COOKIE = "crustory_kakao_state";
const NEXT_COOKIE = "crustory_kakao_next";
const APP_COOKIE = "crustory_kakao_app";

function getSecret() {
  const secret =
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "dev-customer-secret";
  return new TextEncoder().encode(secret);
}

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export async function createCustomerSessionToken(customerId: string) {
  return new SignJWT({ sub: customerId, role: "customer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export function attachCustomerSession(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    ...cookieBase(),
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function createCustomerSession(customerId: string) {
  const token = await createCustomerSessionToken(customerId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    ...cookieBase(),
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function clearCustomerSessionOn(res: NextResponse) {
  res.cookies.delete(COOKIE_NAME);
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || payload.role !== "customer") return null;
    return prisma.customer.findUnique({ where: { id: payload.sub } });
  } catch {
    return null;
  }
}

export async function requireCustomer() {
  const user = await getCustomerSession();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export function attachKakaoOAuthState(
  res: NextResponse,
  stateToken: string,
  nextPath: string,
  fromApp = false,
) {
  res.cookies.set(STATE_COOKIE, stateToken, {
    ...cookieBase(),
    maxAge: 60 * 10,
  });
  res.cookies.set(NEXT_COOKIE, nextPath, {
    ...cookieBase(),
    maxAge: 60 * 10,
  });
  if (fromApp) {
    res.cookies.set(APP_COOKIE, "1", {
      ...cookieBase(),
      maxAge: 60 * 10,
    });
  } else {
    res.cookies.delete(APP_COOKIE);
  }
}

export async function consumeKakaoOAuthState(expected: string | null) {
  const cookieStore = await cookies();
  const saved = cookieStore.get(STATE_COOKIE)?.value;
  const nextPath = cookieStore.get(NEXT_COOKIE)?.value || "/";
  const fromApp = cookieStore.get(APP_COOKIE)?.value === "1";
  cookieStore.delete(STATE_COOKIE);
  cookieStore.delete(NEXT_COOKIE);
  cookieStore.delete(APP_COOKIE);
  if (!expected || !saved || saved !== expected) {
    return { ok: false as const, nextPath: "/", fromApp: false };
  }
  return { ok: true as const, nextPath, fromApp };
}
