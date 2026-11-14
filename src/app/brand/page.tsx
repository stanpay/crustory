import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brand assets",
  description: "crustory 로고·파비콘·비율별 다운로드 자산",
  robots: { index: false, follow: false },
};

const packs = [
  {
    title: "워드마크 (투명)",
    items: [
      { name: "1600×400 PNG", href: "/brand/download/crustory-wordmark-transparent-1600x400.png" },
      { name: "2400×600 PNG", href: "/brand/download/crustory-wordmark-transparent-2400x600.png" },
      { name: "SVG", href: "/brand/wordmark.svg" },
    ],
  },
  {
    title: "1:1 스퀘어",
    items: [
      { name: "512×512", href: "/brand/download/crustory-1x1-512.png" },
      { name: "1024×1024", href: "/brand/download/crustory-1x1-1024.png" },
      { name: "2048×2048", href: "/brand/download/crustory-1x1-2048.png" },
      { name: "1024 반전", href: "/brand/download/crustory-1x1-1024-inverted.png" },
      { name: "SVG", href: "/brand/logo-1x1.svg" },
    ],
  },
  {
    title: "모노그램 c (파비콘용)",
    items: [
      { name: "512×512", href: "/brand/download/crustory-mark-1x1-512.png" },
      { name: "1024×1024", href: "/brand/download/crustory-mark-1x1-1024.png" },
      { name: "SVG", href: "/brand/mark.svg" },
    ],
  },
  {
    title: "4:3 / 3:4",
    items: [
      { name: "4:3 1200×900", href: "/brand/download/crustory-4x3-1200x900.png" },
      { name: "4:3 1600×1200", href: "/brand/download/crustory-4x3-1600x1200.png" },
      { name: "3:4 900×1200", href: "/brand/download/crustory-3x4-900x1200.png" },
    ],
  },
  {
    title: "16:9 / OG",
    items: [
      { name: "16:9 1280×720", href: "/brand/download/crustory-16x9-1280x720.png" },
      { name: "16:9 1920×1080", href: "/brand/download/crustory-16x9-1920x1080.png" },
      { name: "OG 1200×630", href: "/brand/download/crustory-og-1200x630.png" },
    ],
  },
  {
    title: "파비콘 / 앱 아이콘",
    items: [
      { name: "16×16", href: "/brand/download/crustory-favicon-16.png" },
      { name: "32×32", href: "/brand/download/crustory-favicon-32.png" },
      { name: "48×48", href: "/brand/download/crustory-favicon-48.png" },
      { name: "Apple 180×180", href: "/brand/download/crustory-apple-180.png" },
      { name: "PWA 192×192", href: "/brand/download/crustory-pwa-192.png" },
      { name: "PWA 512×512", href: "/brand/download/crustory-pwa-512.png" },
    ],
  },
];

export default function BrandPage() {
  return (
    <main className="page-main">
      <div className="wrap" style={{ paddingBlock: "clamp(48px, 8vw, 96px)", maxWidth: 920 }}>
        <p className="muted" style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
          Brand
        </p>
        <h1 className="serif" style={{ margin: "8px 0 12px", fontSize: "clamp(32px, 5vw, 48px)" }}>
          crustory 로고
        </h1>
        <p className="muted" style={{ marginBottom: 40, maxWidth: "42em" }}>
          Pretendard ExtraBold, letter-spacing -0.055em. 잉크(#1e1b17) on 페이퍼(#f3f0e8).
          가로·세로 가운데 정렬. 작은 파비콘은 가독성을 위해 <b>c</b> 모노그램을 사용합니다.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
            marginBottom: 56,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-1x1.png"
            alt="crustory 1:1 로고"
            style={{ width: "100%", borderRadius: 4, border: "1px solid var(--line)" }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/wordmark.png"
            alt="crustory 워드마크"
            style={{
              width: "100%",
              background: "var(--paper-2)",
              borderRadius: 4,
              border: "1px solid var(--line)",
              padding: "28px 16px",
              objectFit: "contain",
            }}
          />
        </div>

        {packs.map((pack) => (
          <section key={pack.title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>{pack.title}</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
              {pack.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    download
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "12px 14px",
                      border: "1px solid var(--line)",
                      background: "var(--paper-2)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    <span>{item.name}</span>
                    <span className="muted">Download</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p style={{ marginTop: 48 }}>
          <Link href="/" className="arrow-link">
            홈으로
          </Link>
        </p>
      </div>
    </main>
  );
}
