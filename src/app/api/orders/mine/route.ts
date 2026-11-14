import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

export async function GET() {
  const user = await getCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: user.id },
        ...(user.email
          ? [{ customerEmail: { equals: user.email, mode: "insensitive" as const } }]
          : []),
      ],
      status: { not: "PENDING" },
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    orders: orders.map((order) => ({
      orderId: order.orderId,
      status: order.status,
      amount: order.amount,
      customerName: order.customerName,
      createdAt: order.createdAt,
      items: order.items,
    })),
  });
}
