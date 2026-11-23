import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { NoticeForm } from "@/components/admin/NoticeForm";

export default async function AdminNewNoticePage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  return (
    <div>
      <p style={{ marginBottom: "0.75rem" }}>
        <Link href="/admin/notices" style={{ fontSize: "0.9rem" }}>
          ← 공지 목록
        </Link>
      </p>
      <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
        공지 추가
      </h1>
      <p className="section-text">사이트 상단 바에 표시할 공지를 마크다운으로 작성합니다.</p>
      <NoticeForm
        mode="create"
        initial={{
          title: "",
          active: true,
        }}
      />
    </div>
  );
}
