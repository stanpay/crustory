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
