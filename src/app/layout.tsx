import type { Metadata } from "next";
import { Gowun_Batang } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { Analytics } from "@/components/Analytics";
import { SiteChrome } from "@/components/layout/SiteChrome";
import "./globals.css";

const gowun = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-gowun",
});

export const metadata: Metadata = {
  title: {
    default: "CRUSTORY | For solo travelers, from Jeju",
    template: "%s | CRUSTORY",
  },
  description:
    "혼자 온 여행을, 더 잘 즐길 수 있도록. 제주 혼행객을 위한 F&B 라이프스타일 브랜드 크러스토리.",
  openGraph: {
    title: "CRUSTORY",
    description: "For solo travelers, from Jeju",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={gowun.variable}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <SiteChrome>{children}</SiteChrome>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
