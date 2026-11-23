import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  attachAdminSession,
  createAdminSessionToken,
  resolveAdminFromKakao,
} from "@/lib/auth";
import {
  attachCustomerSession,
  consumeKakaoOAuthState,
  createCustomerSessionToken,
} from "@/lib/customer-auth";
import { exchangeKakaoCode, fetchKakaoProfile } from "@/lib/kakao";

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

function isAdminNext(path: string) {
  return path === "/admin" || path.startsWith("/admin/");
}

function redirectWithError(message: string, admin = false) {
  const dest = admin ? "/admin/login" : "/login";
  return NextResponse.redirect(
    `${siteBase()}${dest}?error=${encodeURIComponent(message)}`,
  );
}

function safeNextPath(raw: string) {
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  // 로그인 기본 랜딩은 메인
  if (raw === "/login" || raw.startsWith("/login?")) return "/";
  return raw;
}

export async function GET(req: Request) {
  let adminAttempt = false;
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

    const { ok, nextPath, fromApp } = await consumeKakaoOAuthState(state);
    const safeNext = safeNextPath(nextPath);
    adminAttempt = isAdminNext(safeNext);

    if (!ok) {
      return redirectWithError(
        "로그인 세션이 만료되었습니다. 다시 시도해 주세요.",
        adminAttempt,
      );
    }

    const token = await exchangeKakaoCode(code);
    const profile = await fetchKakaoProfile(token.access_token);

    if (adminAttempt) {
      const admin = await resolveAdminFromKakao(profile);
      if (!admin) {
        return redirectWithError(
          "관리자로 등록된 카카오 계정이 아닙니다.",
          true,
        );
      }
      const sessionToken = await createAdminSessionToken(admin);
      const res = NextResponse.redirect(`${siteBase()}${safeNext}`);
      attachAdminSession(res, sessionToken);
      return res;
    }

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

    // Android app: hand session back via custom scheme so WebView can set cookie.
    if (fromApp) {
      const deeplink =
        `crustory://auth/callback?session=${encodeURIComponent(sessionToken)}` +
        `&next=${encodeURIComponent(safeNext)}`;
      return NextResponse.redirect(deeplink);
    }

    const res = NextResponse.redirect(`${siteBase()}${safeNext}`);
    attachCustomerSession(res, sessionToken);
    return res;
  } catch (e) {
    console.error(e);
    return redirectWithError("카카오 로그인에 실패했습니다.", adminAttempt);
  }
}
