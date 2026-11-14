import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminSession();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <p style={{ fontWeight: 800, margin: "0 0 1rem", letterSpacing: "-0.03em" }}>
          crustory admin
        </p>
        <p style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "1rem" }}>
          {user.email}
        </p>
        <Link href="/admin">대시보드</Link>
        <Link href="/admin/products">상품</Link>
        <Link href="/admin/orders">주문</Link>
        <Link href="/">사이트로</Link>
        <div style={{ marginTop: "1rem" }}>
          <LogoutButton />
        </div>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
