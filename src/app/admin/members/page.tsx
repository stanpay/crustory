import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminMembersPage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const members = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true, pushDevices: true } },
    },
  });

  return (
    <div>
      <div>
        <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
          회원 관리
        </h1>
        <p className="section-text">
          카카오 로그인한 고객 계정과 연결된 주문 수를 확인합니다.
        </p>
      </div>

      <table className="admin-table" style={{ marginTop: "1.25rem" }}>
        <thead>
          <tr>
            <th>회원</th>
            <th>이메일</th>
            <th>주문</th>
            <th>푸시</th>
            <th>가입일</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  {m.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.profileImage}
                      alt=""
                      width={32}
                      height={32}
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <span
                      aria-hidden
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#e8e4de",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span>{m.name || "이름 없음"}</span>
                </div>
              </td>
              <td>{m.email || "—"}</td>
              <td>{m._count.orders}</td>
              <td>{m._count.pushDevices}</td>
              <td>{m.createdAt.toLocaleString("ko-KR")}</td>
              <td>
                <Link href={`/admin/members/${m.id}`} className="btn btn-ghost">
                  보기
                </Link>
              </td>
            </tr>
          ))}
          {members.length === 0 && (
            <tr>
              <td colSpan={6}>등록된 회원이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
