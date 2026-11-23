"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RunieEyes } from "@/components/brand/Runie";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/meet-runie", label: "Meet Runie" },
  { href: "/our-story", label: "Our Story" },
  { href: "/pizza", label: "Pizza" },
  { href: "/jeju-guide", label: "Jeju Guide" },
];

const menu = [
  { href: "/shop", label: "Shop", note: "러니 굿즈" },
  { href: "/meet-runie", label: "Meet Runie", note: "7연승 후 은퇴한 경주마" },
  { href: "/our-story", label: "Our Story", note: "혼행객 120명의 이야기에서" },
  { href: "/pizza", label: "Pizza", note: "8인치, 혼자 먹기 좋은 크기" },
  { href: "/jeju-guide", label: "Jeju Guide", note: "준비 중" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

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
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!cancelled) setUserName(data.user?.name || data.user?.email || null);
      } catch {
        if (!cancelled) setUserName(null);
      }
    }
    void loadMe();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
          <span>Menu</span>
          <em className="sr-only">메뉴 열기</em>
        </button>

        <Link href="/" className="wordmark" aria-label="crustory 홈">
          crustory
        </Link>

        <div className="hd__util">
          {userName ? (
            <Link href="/account" className="hide-sm">
              {userName}
            </Link>
          ) : (
            <Link href="/login" className="hide-sm">
              로그인
            </Link>
          )}
          <Link href="/contact" className="hide-sm">
            문의
          </Link>
        </div>
      </div>

      <nav className="hd__nav" aria-label="주요 메뉴">
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
        <div className="menu" id="site-menu" role="dialog" aria-modal="true" aria-label="메뉴">
          <div className="menu__top">
            <Link href="/" className="wordmark" onClick={() => setOpen(false)} aria-label="crustory 홈">
              crustory
            </Link>
            <button
              type="button"
              className="menu__close"
              aria-label="메뉴 닫기"
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
            {userName ? (
              <Link href="/account" onClick={() => setOpen(false)}>
                {userName} · 계정
              </Link>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>
                카카오 로그인
              </Link>
            )}
            <Link href="/contact" onClick={() => setOpen(false)}>
              문의하기
            </Link>
            <Link href="/policies/guide" onClick={() => setOpen(false)}>
              이용안내
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
