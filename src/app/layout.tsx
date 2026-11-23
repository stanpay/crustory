import type { Metadata } from "next";
import { Gowun_Batang } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { DevSiteBanner } from "@/components/layout/DevSiteBanner";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { NativeAppBootstrap } from "@/components/native/NativeAppBootstrap";
import { getCustomerSession } from "@/lib/customer-auth";
import { isDevSite } from "@/lib/env";
import { prisma } from "@/lib/prisma";
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
  applicationName: "CRUSTORY",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "CRUSTORY",
    description: "For solo travelers, from Jeju",
    locale: "ko_KR",
    type: "website",
    siteName: "CRUSTORY",
  },
  twitter: {
    card: "summary_large_image",
    title: "CRUSTORY",
    description: "For solo travelers, from Jeju",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const customer = await getCustomerSession();
  const initialLoggedIn = Boolean(customer?.id);
  const initialUserName = customer?.name || customer?.email || (initialLoggedIn ? "회원" : null);

  const activeNotice = await prisma.notice.findFirst({
    where: { active: true },
    orderBy: { updatedAt: "desc" },
    select: { title: true },
  });

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
        {isDevSite() ? <DevSiteBanner /> : null}
        <NativeAppBootstrap />
        <SiteChrome
          initialLoggedIn={initialLoggedIn}
          initialUserName={initialUserName}
          announcement={activeNotice}
        >
          {children}
        </SiteChrome>
        <Analytics />
      </body>
    </html>
  );
}
