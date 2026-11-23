"use client";

import { usePathname } from "next/navigation";
import {
  AnnouncementBar,
  type Announcement,
} from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function SiteChrome({
  children,
  initialLoggedIn = false,
  initialUserName = null,
  announcement = null,
}: {
  children: React.ReactNode;
  initialLoggedIn?: boolean;
  initialUserName?: string | null;
  announcement?: Announcement | null;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar announcement={announcement} />
      <Header
        initialLoggedIn={initialLoggedIn}
        initialUserName={initialUserName}
      />
      <main className="page-main">{children}</main>
      <Footer />
    </>
  );
}
