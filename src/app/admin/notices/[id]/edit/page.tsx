import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NoticeForm } from "@/components/admin/NoticeForm";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditNoticePage({ params }: Props) {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const { id } = await params;
  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) notFound();

  return (
    <div>
      <p style={{ marginBottom: "0.75rem" }}>
        <Link href="/admin/notices" style={{ fontSize: "0.9rem" }}>
          ← 공지 목록
        </Link>
      </p>
      <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
        공지 수정
      </h1>
      <p className="section-text">{notice.title}</p>
      <NoticeForm
        mode="edit"
        noticeId={notice.id}
        initial={{
          title: notice.title,
          body: notice.body,
          linkHref: notice.linkHref ?? "",
          linkLabel: notice.linkLabel ?? "",
          active: notice.active,
        }}
      />
    </div>
  );
}
