"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/admin/LogoutButton";

function MenuIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
      <path
        d="M0 1h20M0 8h20M0 15h20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className={`admin-shell${open ? " is-nav-open" : ""}`}>
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-menu-btn"
          aria-label="메뉴 열기"
          aria-expanded={open}
          aria-controls="admin-nav"
          onClick={() => setOpen(true)}
        >
          <MenuIcon />
        </button>
        <p className="admin-topbar__title">crustory admin</p>
      </header>

      <button
        type="button"
        className="admin-nav-backdrop"
        aria-label="메뉴 닫기"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />

      <aside id="admin-nav" className="admin-nav">
        <div className="admin-nav__head">
          <p className="admin-nav__brand">crustory admin</p>
          <button
            type="button"
            className="admin-nav__close"
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        <p className="admin-nav__email">{email}</p>
        <Link href="/admin">대시보드</Link>
        <Link href="/admin/visitors">방문객</Link>
        <Link href="/admin/products">상품</Link>
        <Link href="/admin/orders">주문</Link>
        <Link href="/admin/members">회원</Link>
        <Link href="/admin/notices">공지</Link>
        <Link href="/">사이트로</Link>
        <div className="admin-nav__logout">
          <LogoutButton />
        </div>
      </aside>

      <div className="admin-content">{children}</div>
    </div>
  );
}
