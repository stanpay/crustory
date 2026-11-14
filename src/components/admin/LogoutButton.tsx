"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn btn-ghost"
      style={{ color: "#FFF3E6", borderColor: "rgba(255,243,230,.3)", width: "100%" }}
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      로그아웃
    </button>
  );
}
