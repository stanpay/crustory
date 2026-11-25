import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { attachKakaoOAuthState } from "@/lib/customer-auth";
import { getSiteUrl } from "@/lib/env";
import { buildKakaoAuthorizeUrl } from "@/lib/kakao";

function safeNextPath(raw: string | null) {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export async function GET(req: Request) {
  const siteUrl = getSiteUrl(req);
  try {
    const url = new URL(req.url);
    const next = safeNextPath(url.searchParams.get("next"));
    const fromApp =
      url.searchParams.get("app") === "1" ||
      /CrustoryApp|capacitor/i.test(req.headers.get("user-agent") || "");
    const stateToken = randomBytes(16).toString("hex");
    const authorizeUrl = buildKakaoAuthorizeUrl(stateToken, siteUrl);
    const res = NextResponse.redirect(authorizeUrl);
    attachKakaoOAuthState(res, stateToken, next, fromApp);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(
      `${siteUrl}/login?error=${encodeURIComponent("카카오 로그인이 아직 설정되지 않았습니다.")}`,
    );
  }
}
