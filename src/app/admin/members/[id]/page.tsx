import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { MemberDeleteButton } from "@/components/admin/MemberDeleteButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminMemberDetailPage({ params }: Props) {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const { id } = await params;

  const member = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: { select: { pushDevices: true } },
    },
  });

  if (!member) notFound();

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: member.id },
        ...(member.email
          ? [{ customerEmail: { equals: member.email, mode: "insensitive" as const } }]
          : []),
      ],
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <p style={{ marginBottom: "1rem" }}>
        <Link href="/admin/members" className="btn btn-ghost">
          ← 회원 목록
        </Link>
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {member.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.profileImage}
              alt=""
              width={64}
              height={64}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <span
              aria-hidden
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#e8e4de",
                display: "inline-block",
              }}
            />
          )}
          <div>
            <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
              {member.name || "이름 없음"}
            </h1>
            <p className="section-text" style={{ marginTop: "0.25rem" }}>
              {member.email || "이메일 없음"}
            </p>
          </div>
        </div>
        <MemberDeleteButton memberId={member.id} memberName={member.name} />
      </div>

      <div className="values-grid" style={{ marginTop: "1.5rem" }}>
        <article className="value-card">
          <h3>주문</h3>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111" }}>
            {orders.length}
          </p>
        </article>
        <article className="value-card">
          <h3>푸시 기기</h3>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111" }}>
            {member._count.pushDevices}
          </p>
        </article>
        <article className="value-card">
          <h3>가입일</h3>
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "#111" }}>
            {member.createdAt.toLocaleString("ko-KR")}
          </p>
        </article>
      </div>

      <dl
        style={{
          marginTop: "1.5rem",
          display: "grid",
          gap: "0.5rem",
          fontSize: "0.9rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <dt style={{ color: "#6b6560", minWidth: "5rem" }}>회원 ID</dt>
          <dd style={{ margin: 0, wordBreak: "break-all" }}>{member.id}</dd>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <dt style={{ color: "#6b6560", minWidth: "5rem" }}>카카오 ID</dt>
          <dd style={{ margin: 0, wordBreak: "break-all" }}>{member.kakaoId}</dd>
        </div>
      </dl>

      <h2 style={{ marginTop: "2.5rem" }}>주문 이력</h2>
      <p className="section-text" style={{ marginTop: "0.35rem" }}>
        계정에 연결된 주문과 동일 이메일로 매칭된 주문을 포함합니다.
      </p>
      <table className="admin-table" style={{ marginTop: "0.75rem" }}>
        <thead>
          <tr>
            <th>주문</th>
            <th>상품</th>
            <th>금액</th>
            <th>상태</th>
            <th>연결</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <div>{o.orderId}</div>
                <div style={{ fontSize: "0.75rem", color: "#6b6560" }}>
                  {o.createdAt.toLocaleString("ko-KR")}
                </div>
              </td>
              <td>
                {o.items.map((i) => (
                  <div key={i.id}>
                    {i.name} × {i.quantity}
                  </div>
                ))}
              </td>
              <td>{formatPrice(o.amount)}</td>
              <td>
                <span className={`status-pill ${o.status}`}>{o.status}</span>
              </td>
              <td style={{ fontSize: "0.8rem", color: "#6b6560" }}>
                {o.userId === member.id
                  ? "계정"
                  : o.isGuest
                    ? "이메일(게스트)"
                    : "이메일"}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5}>주문이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
