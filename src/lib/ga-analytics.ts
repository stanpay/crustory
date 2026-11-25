type ServiceAccount = {
  client_email: string;
  private_key: string;
};

export type GaSummary = {
  activeUsers: number;
  sessions: number;
  pageViews: number;
  engagementRate: number;
  avgSessionDurationSec: number;
};

export type GaDailyRow = {
  date: string;
  activeUsers: number;
  sessions: number;
  pageViews: number;
};

export type GaDimRow = {
  label: string;
  value: number;
};

export type GaVisitorsReport = {
  configured: boolean;
  error?: string;
  propertyId?: string;
  rangeLabel: string;
  realtimeUsers: number;
  summary: GaSummary;
  previousSummary: GaSummary;
  daily: GaDailyRow[];
  topPages: GaDimRow[];
  channels: GaDimRow[];
  devices: GaDimRow[];
  countries: GaDimRow[];
};

const ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const EMPTY_SUMMARY: GaSummary = {
  activeUsers: 0,
  sessions: 0,
  pageViews: 0,
  engagementRate: 0,
  avgSessionDurationSec: 0,
};

let cachedToken: { value: string; exp: number } | null = null;

function getServiceAccount(): ServiceAccount | null {
  const raw =
    process.env.GA_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw?.trim()) return null;
  try {
    let parsed: unknown = JSON.parse(raw);
    // .env에 JSON.stringify를 한 번 더 감싼 경우 대응
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    const sa = parsed as ServiceAccount;
    if (!sa.client_email || !sa.private_key) return null;
    return sa;
  } catch {
    console.error("GA service account JSON is invalid");
    return null;
  }
}

function getPropertyId(): string | null {
  const id = process.env.GA4_PROPERTY_ID?.trim();
  return id || null;
}

function base64Url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp > now + 60) {
    return cachedToken.value;
  }

  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: sa.client_email,
      scope: ANALYTICS_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const crypto = await import("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(unsigned);
  sign.end();
  const signature = base64Url(sign.sign(sa.private_key));
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`GA token exchange failed: ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, exp: now + (data.expires_in || 3600) };
  return data.access_token;
}

type GaReportResponse = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
};

async function runReport(
  accessToken: string,
  propertyId: string,
  body: Record<string, unknown>,
): Promise<GaReportResponse> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new Error(`GA runReport failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as GaReportResponse;
}

async function runRealtimeReport(
  accessToken: string,
  propertyId: string,
  body: Record<string, unknown>,
): Promise<GaReportResponse> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new Error(`GA realtime failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as GaReportResponse;
}

function num(rows: GaReportResponse["rows"], metricIndex = 0): number {
  const raw = rows?.[0]?.metricValues?.[metricIndex]?.value;
  const n = Number(raw ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function parseSummary(rows: GaReportResponse["rows"]): GaSummary {
  return {
    activeUsers: num(rows, 0),
    sessions: num(rows, 1),
    pageViews: num(rows, 2),
    engagementRate: num(rows, 3),
    avgSessionDurationSec: num(rows, 4),
  };
}

function parseDimRows(
  rows: GaReportResponse["rows"],
  metricIndex = 0,
): GaDimRow[] {
  return (rows ?? [])
    .map((row) => ({
      label: row.dimensionValues?.[0]?.value || "(not set)",
      value: Number(row.metricValues?.[metricIndex]?.value ?? 0) || 0,
    }))
    .filter((r) => r.value > 0);
}

function parseDaily(rows: GaReportResponse["rows"]): GaDailyRow[] {
  return (rows ?? [])
    .map((row) => {
      const raw = row.dimensionValues?.[0]?.value || "";
      const date =
        raw.length === 8
          ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
          : raw;
      return {
        date,
        activeUsers: Number(row.metricValues?.[0]?.value ?? 0) || 0,
        sessions: Number(row.metricValues?.[1]?.value ?? 0) || 0,
        pageViews: Number(row.metricValues?.[2]?.value ?? 0) || 0,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

const SUMMARY_METRICS = [
  { name: "activeUsers" },
  { name: "sessions" },
  { name: "screenPageViews" },
  { name: "engagementRate" },
  { name: "averageSessionDuration" },
];

export async function fetchGaVisitorsReport(
  days = 28,
): Promise<GaVisitorsReport> {
  const rangeLabel = `최근 ${days}일`;
  const propertyId = getPropertyId();
  const sa = getServiceAccount();

  if (!propertyId || !sa) {
    return {
      configured: false,
      error: !propertyId
        ? "GA4_PROPERTY_ID 환경변수가 없습니다."
        : "GA_SERVICE_ACCOUNT_JSON(또는 FIREBASE_SERVICE_ACCOUNT_JSON)이 없습니다.",
      rangeLabel,
      realtimeUsers: 0,
      summary: EMPTY_SUMMARY,
      previousSummary: EMPTY_SUMMARY,
      daily: [],
      topPages: [],
      channels: [],
      devices: [],
      countries: [],
    };
  }

  try {
    const accessToken = await getAccessToken(sa);
    const startDate = `${days}daysAgo`;
    const prevStart = `${days * 2}daysAgo`;
    const prevEnd = `${days + 1}daysAgo`;

    const [
      summaryRes,
      prevRes,
      dailyRes,
      pagesRes,
      channelsRes,
      devicesRes,
      countriesRes,
      realtimeRes,
    ] = await Promise.all([
      runReport(accessToken, propertyId, {
        dateRanges: [{ startDate, endDate: "today" }],
        metrics: SUMMARY_METRICS,
      }),
      runReport(accessToken, propertyId, {
        dateRanges: [{ startDate: prevStart, endDate: prevEnd }],
        metrics: SUMMARY_METRICS,
      }),
      runReport(accessToken, propertyId, {
        dateRanges: [{ startDate, endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      runReport(accessToken, propertyId, {
        dateRanges: [{ startDate, endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      runReport(accessToken, propertyId, {
        dateRanges: [{ startDate, endDate: "today" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 8,
      }),
      runReport(accessToken, propertyId, {
        dateRanges: [{ startDate, endDate: "today" }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      }),
      runReport(accessToken, propertyId, {
        dateRanges: [{ startDate, endDate: "today" }],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 8,
      }),
      runRealtimeReport(accessToken, propertyId, {
        metrics: [{ name: "activeUsers" }],
      }).catch(() => ({ rows: [] })),
    ]);

    return {
      configured: true,
      propertyId,
      rangeLabel,
      realtimeUsers: num(realtimeRes.rows, 0),
      summary: parseSummary(summaryRes.rows),
      previousSummary: parseSummary(prevRes.rows),
      daily: parseDaily(dailyRes.rows),
      topPages: parseDimRows(pagesRes.rows),
      channels: parseDimRows(channelsRes.rows),
      devices: parseDimRows(devicesRes.rows),
      countries: parseDimRows(countriesRes.rows),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("fetchGaVisitorsReport:", message);
    return {
      configured: false,
      error: message,
      propertyId,
      rangeLabel,
      realtimeUsers: 0,
      summary: EMPTY_SUMMARY,
      previousSummary: EMPTY_SUMMARY,
      daily: [],
      topPages: [],
      channels: [],
      devices: [],
      countries: [],
    };
  }
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0초";
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m === 0) return `${rem}초`;
  return `${m}분 ${rem}초`;
}

export function formatPct(rate: number): string {
  const pct = rate <= 1 ? rate * 100 : rate;
  return `${pct.toFixed(1)}%`;
}

export function deltaPct(current: number, previous: number): number | null {
  if (!previous) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}
