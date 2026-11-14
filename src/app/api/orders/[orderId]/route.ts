import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ orderId: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { orderId } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  const order = await prisma.order.findUnique({
    where: { orderId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }

  if (email && order.customerEmail.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "정보가 일치하지 않습니다." }, { status: 403 });
  }

  return NextResponse.json({
    orderId: order.orderId,
    status: order.status,
    amount: order.amount,
    customerName: order.customerName,
    createdAt: order.createdAt,
    items: order.items,
  });
}
