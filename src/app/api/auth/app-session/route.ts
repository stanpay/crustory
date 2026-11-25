import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { attachCustomerSession } from "@/lib/customer-auth";
import { getSiteUrl } from "@/lib/env";

function getSecret() {
  const secret =
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "dev-customer-secret";
  return new TextEncoder().encode(secret);
}

function safeNextPath(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

/**
 * Hands a JWT from deep-link OAuth back into the WebView as an httpOnly cookie.
 */
export async function GET(req: Request) {
  const siteBase = getSiteUrl(req);
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const next = safeNextPath(url.searchParams.get("next"));

  if (!token) {
    return NextResponse.redirect(
      `${siteBase}/login?error=${encodeURIComponent("세션이 없습니다.")}`,
    );
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || payload.role !== "customer") {
      throw new Error("invalid");
    }
    const res = NextResponse.redirect(`${siteBase}${next}`);
    attachCustomerSession(res, token);
    return res;
  } catch {
    return NextResponse.redirect(
      `${siteBase}/login?error=${encodeURIComponent("세션이 만료되었습니다.")}`,
    );
  }
}
