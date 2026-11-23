import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const user = await getAdminSession();
  if (user) redirect("/admin");

  return (
    <Suspense
      fallback={
        <div className="container section" style={{ maxWidth: 420 }}>
          로딩 중…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
