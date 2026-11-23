import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminNoticesPage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const notices = await prisma.notice.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "0.75rem",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
            공지사항
          </h1>
          <p className="section-text">
            상단 바에 노출할 공지를 마크다운으로 작성·수정합니다. 노출 중인 공지는 하나만
            유지됩니다.
          </p>
        </div>
        <Link href="/admin/notices/new" className="btn btn-dark">
          공지 추가
        </Link>
      </div>

      <table className="admin-table" style={{ marginTop: "1.25rem" }}>
        <thead>
          <tr>
            <th>문구</th>
            <th>노출</th>
            <th>수정일</th>
            <th>편집</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((n) => (
            <tr key={n.id}>
              <td>{n.title}</td>
              <td>
                <span className={`status-pill ${n.active ? "PAID" : "PENDING"}`}>
                  {n.active ? "노출" : "숨김"}
                </span>
              </td>
              <td>{n.updatedAt.toLocaleString("ko-KR")}</td>
              <td>
                <Link href={`/admin/notices/${n.id}/edit`} className="btn btn-ghost">
                  수정
                </Link>
              </td>
            </tr>
          ))}
          {notices.length === 0 && (
            <tr>
              <td colSpan={4}>등록된 공지가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
