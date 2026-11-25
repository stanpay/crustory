"use client";

import { usePathname } from "next/navigation";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import {
  AnnouncementBar,
  type Announcement,
} from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Locale } from "@/lib/i18n";

export function SiteChrome({
  children,
  initialLoggedIn = false,
  initialUserName = null,
  initialLocale = "en",
  announcement = null,
}: {
  children: React.ReactNode;
  initialLoggedIn?: boolean;
  initialUserName?: string | null;
  initialLocale?: Locale;
  announcement?: Announcement | null;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <LocaleProvider initialLocale={initialLocale}>
      <AnnouncementBar announcement={announcement} />
      <Header
        initialLoggedIn={initialLoggedIn}
        initialUserName={initialUserName}
      />
      <main className="page-main">{children}</main>
      <Footer />
    </LocaleProvider>
  );
}
