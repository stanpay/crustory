import { headers } from "next/headers";
import { prisma } from "./prisma";

/**
 * Local-only auth bypass. Never enabled when NODE_ENV === "production".
 * Set AUTH_BYPASS=0 to force-disable even in development.
 */
export function isLocalAuthBypass(host?: string | null): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.AUTH_BYPASS === "0") return false;
  if (process.env.AUTH_BYPASS === "1") return true;

  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  if (/localhost|127\.0\.0\.1/i.test(site)) return true;

  if (host) {
    const hostname = host.split(":")[0]?.toLowerCase() ?? "";
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  }

  return false;
}

export async function shouldBypassAuth(): Promise<boolean> {
  try {
    const hdrs = await headers();
    return isLocalAuthBypass(hdrs.get("host"));
  } catch {
    return isLocalAuthBypass(null);
  }
}

export const LOCAL_DEV_ADMIN = {
  kakaoId: "local-dev-admin",
  email: "dev@localhost",
  name: "로컬 관리자",
} as const;

export const LOCAL_DEV_CUSTOMER = {
  kakaoId: "local-dev-customer",
  email: "customer@localhost",
  name: "로컬 고객",
} as const;

export async function resolveLocalAdmin() {
  return prisma.adminUser.upsert({
    where: { kakaoId: LOCAL_DEV_ADMIN.kakaoId },
    create: { ...LOCAL_DEV_ADMIN },
    update: {
      email: LOCAL_DEV_ADMIN.email,
      name: LOCAL_DEV_ADMIN.name,
    },
  });
}

export async function resolveLocalCustomer() {
  return prisma.customer.upsert({
    where: { kakaoId: LOCAL_DEV_CUSTOMER.kakaoId },
    create: { ...LOCAL_DEV_CUSTOMER },
    update: {
      email: LOCAL_DEV_CUSTOMER.email,
      name: LOCAL_DEV_CUSTOMER.name,
    },
  });
}
