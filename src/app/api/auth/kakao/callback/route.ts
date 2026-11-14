import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  attachCustomerSession,
  consumeKakaoOAuthState,
  createCustomerSessionToken,
} from "@/lib/customer-auth";
import { exchangeKakaoCode, fetchKakaoProfile } from "@/lib/kakao";

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function redirectWithError(message: string) {
  return NextResponse.redirect(
    `${siteBase()}/login?error=${encodeURIComponent(message)}`,
  );
}

function safeNextPath(raw: string) {
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/order/lookup";
  return raw;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return redirectWithError("카카오 로그인이 취소되었습니다.");
    }
    if (!code || !state) {
      return redirectWithError("잘못된 로그인 요청입니다.");
    }

    const { ok, nextPath } = await consumeKakaoOAuthState(state);
    if (!ok) {
      return redirectWithError("로그인 세션이 만료되었습니다. 다시 시도해 주세요.");
    }

    const token = await exchangeKakaoCode(code);
    const profile = await fetchKakaoProfile(token.access_token);

    const customer = await prisma.customer.upsert({
      where: { kakaoId: profile.kakaoId },
      create: {
        kakaoId: profile.kakaoId,
        email: profile.email,
        name: profile.name,
        profileImage: profile.profileImage,
      },
      update: {
        email: profile.email ?? undefined,
        name: profile.name ?? undefined,
        profileImage: profile.profileImage ?? undefined,
      },
    });

    const sessionToken = await createCustomerSessionToken(customer.id);
    const res = NextResponse.redirect(`${siteBase()}${safeNextPath(nextPath)}`);
    attachCustomerSession(res, sessionToken);
    return res;
  } catch (e) {
    console.error(e);
    return redirectWithError("카카오 로그인에 실패했습니다.");
  }
}
