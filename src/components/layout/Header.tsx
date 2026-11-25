"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { RunieEyes } from "@/components/brand/Runie";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useT } from "@/components/i18n/LocaleProvider";

type HeaderProps = {
  initialLoggedIn?: boolean;
  initialUserName?: string | null;
};

export function Header({
  initialLoggedIn = false,
  initialUserName = null,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);
  const [userName, setUserName] = useState<string | null>(initialUserName);
  const [loggingOut, setLoggingOut] = useState(false);

  const nav = useMemo(
    () => [
      { href: "/shop", label: t("navShop") },
      { href: "/meet-runie", label: t("navMeetRunie") },
      { href: "/our-story", label: t("navOurStory") },
      { href: "/pizza", label: t("navPizza") },
      { href: "/jeju-guide", label: t("navJejuGuide") },
    ],
    [t],
  );

  const menu = useMemo(
    () => [
      { href: "/shop", label: t("navShop"), note: t("noteShop") },
      { href: "/meet-runie", label: t("navMeetRunie"), note: t("noteMeetRunie") },
      { href: "/our-story", label: t("navOurStory"), note: t("noteOurStory") },
      { href: "/pizza", label: t("navPizza"), note: t("notePizza") },
      { href: "/jeju-guide", label: t("navJejuGuide"), note: t("noteJejuGuide") },
    ],
    [t],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        const data = await res.json();
        if (cancelled) return;
        if (data.user?.id) {
          setLoggedIn(true);
          setUserName(data.user.name || data.user.email || t("member"));
        } else {
          setLoggedIn(false);
          setUserName(null);
        }
      } catch {
        if (!cancelled) {
          setLoggedIn(false);
          setUserName(null);
        }
      }
    }
    void loadMe();
    return () => {
      cancelled = true;
    };
  }, [pathname, t]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      setLoggedIn(false);
      setUserName(null);
      setOpen(false);
      router.refresh();
      if (pathname.startsWith("/account")) {
        router.push("/");
      }
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className={`hd${scrolled ? " is-scrolled" : ""}`}>
      <div className="hd__top">
        <button
          type="button"
          className="hd__menu-btn"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
        >
          <RunieEyes />
          <span>{t("menu")}</span>
          <em className="sr-only">{t("openMenu")}</em>
        </button>

        <Link href="/" className="wordmark" aria-label="crustory 홈">
          crustory
        </Link>

        <div className="hd__util">
          <LanguageSwitcher />
          {loggedIn ? (
            <button
              type="button"
              className="hd__auth-btn"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "…" : t("logout")}
            </button>
          ) : (
            <Link href="/login" className="hd__auth-btn">
              {t("login")}
            </Link>
          )}
          <Link href="/contact" className="hide-sm">
            {t("contact")}
          </Link>
        </div>
      </div>

      <nav className="hd__nav" aria-label={t("mainNav")}>
        {nav.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname.startsWith(link.href) ? "is-active" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {open && (
        <div className="menu" id="site-menu" role="dialog" aria-modal="true" aria-label={t("menu")}>
          <div className="menu__top">
            <Link href="/" className="wordmark" onClick={() => setOpen(false)} aria-label="crustory 홈">
              crustory
            </Link>
            <button
              type="button"
              className="menu__close"
              aria-label={t("closeMenu")}
              onClick={() => setOpen(false)}
              autoFocus
            >
              ×
            </button>
          </div>
          <ul className="menu__list">
            {menu.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)}>
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                </Link>
              </li>
            ))}
          </ul>
          <div className="menu__foot">
            {loggedIn ? (
              <>
                <Link href="/account" onClick={() => setOpen(false)}>
                  {userName || t("member")} · {t("account")}
                </Link>
                <button
                  type="button"
                  className="menu__logout"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? "…" : t("logout")}
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>
                {t("kakaoLogin")}
              </Link>
            )}
            <Link href="/contact" onClick={() => setOpen(false)}>
              {t("contactUs")}
            </Link>
            <Link href="/policies/guide" onClick={() => setOpen(false)}>
              {t("guide")}
            </Link>
            <a href="https://www.instagram.com/crustory_jeju/" target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
