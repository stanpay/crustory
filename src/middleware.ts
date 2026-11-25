import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  isLocale,
  parseAcceptLanguage,
} from "@/lib/i18n/locales";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;

  if (isLocale(existing)) {
    return response;
  }

  const locale = parseAcceptLanguage(
    request.headers.get("accept-language"),
  );

  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
