import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { attachKakaoOAuthState } from "@/lib/customer-auth";
import { buildKakaoAuthorizeUrl } from "@/lib/kakao";

function safeNextPath(raw: string | null) {
  if (!raw) return "/order/lookup";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/order/lookup";
  return raw;
}

export async function GET(req: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const url = new URL(req.url);
    const next = safeNextPath(url.searchParams.get("next"));
    const stateToken = randomBytes(16).toString("hex");
    const authorizeUrl = buildKakaoAuthorizeUrl(stateToken);
    const res = NextResponse.redirect(authorizeUrl);
    attachKakaoOAuthState(res, stateToken, next);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(
      `${siteUrl}/login?error=${encodeURIComponent("카카오 로그인이 아직 설정되지 않았습니다.")}`,
    );
  }
}
