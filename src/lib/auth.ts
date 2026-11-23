import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { prisma } from "./prisma";
import type { KakaoProfile } from "./kakao";
import { resolveLocalAdmin, shouldBypassAuth } from "./local-auth-bypass";

const COOKIE_NAME = "crustory_admin";

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  kakaoId: string;
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-secret";
  return new TextEncoder().encode(secret);
}

function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

/** Admin access is decided only by Supabase `AdminUser.kakaoId`. */
export async function resolveAdminFromKakao(
  profile: KakaoProfile,
): Promise<AdminSession | null> {
  let user = await prisma.adminUser.findUnique({
    where: { kakaoId: profile.kakaoId },
  });
  if (!user) return null;

  const nextEmail = profile.email ?? user.email;
  const nextName = profile.name || user.name;
  if (nextEmail !== user.email || nextName !== user.name) {
    user = await prisma.adminUser.update({
      where: { id: user.id },
      data: { email: nextEmail, name: nextName },
    });
  }

  return {
    id: user.id,
    email: user.email || "",
    name: user.name,
    kakaoId: user.kakaoId,
  };
}

export async function createAdminSessionToken(user: AdminSession) {
  return new SignJWT({
    sub: user.id,
    role: "admin",
    email: user.email,
    name: user.name,
    kakaoId: user.kakaoId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function createAdminSession(user: AdminSession) {
  const token = await createAdminSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, adminCookieOptions());
}

export function attachAdminSession(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, adminCookieOptions());
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (await shouldBypassAuth()) {
    const admin = await resolveLocalAdmin();
    return {
      id: admin.id,
      email: admin.email || "",
      name: admin.name,
      kakaoId: admin.kakaoId,
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || payload.role !== "admin") return null;
    const email = typeof payload.email === "string" ? payload.email : "";
    const name = typeof payload.name === "string" ? payload.name : "";
    const kakaoId = typeof payload.kakaoId === "string" ? payload.kakaoId : "";
    return { id: payload.sub, email, name, kakaoId };
  } catch {
    return null;
  }
});

export async function requireAdmin() {
  const user = await getAdminSession();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
