/**
 * Local (`next dev`) and Vercel Preview/Development — not Production.
 * Matches the crustory_dev vs production DB split in .env.example.
 */
export function isDevSite(): boolean {
  const vercelEnv = process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv === "production") return false;
  if (vercelEnv === "preview" || vercelEnv === "development") return true;

  if (process.env.NODE_ENV !== "production") return true;

  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  return /localhost|127\.0\.0\.1/i.test(site);
}

function normalizeOrigin(raw: string) {
  return raw.replace(/\/$/, "");
}

function withHttps(host: string) {
  if (host.startsWith("http://") || host.startsWith("https://")) {
    return normalizeOrigin(host);
  }
  return `https://${host}`;
}

/**
 * Canonical site origin for redirects / Kakao OAuth.
 * Prefer the incoming request host so custom domains (crustory.co.kr)
 * and Preview (dev) stay on the same origin instead of a stale vercel.app env.
 */
export function getSiteUrl(req?: Request): string {
  if (req) {
    const host =
      req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      req.headers.get("host")?.trim();
    if (host) {
      const proto =
        req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
        (host.includes("localhost") || host.startsWith("127.")
          ? "http"
          : "https");
      return normalizeOrigin(`${proto}://${host}`);
    }
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return normalizeOrigin(configured);

  const vercelEnv = process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv === "production") {
    const prod =
      process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    if (prod) return withHttps(prod);
  }

  const preview =
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL;
  if (preview) return withHttps(preview);

  return "http://localhost:3000";
}
