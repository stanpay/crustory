import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { notifyOrderStatus } from "@/lib/push";
import { z } from "zod";

export async function GET() {
  try {
    await requireAdmin();
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

const patchSchema = z.object({
  orderId: z.string(),
  status: z.enum(["PENDING", "PAID", "CANCELLED", "REFUNDED", "SHIPPED"]),
});

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = patchSchema.parse(await req.json());

    const existing = await prisma.order.findUnique({
      where: { orderId: body.orderId },
      include: { items: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
    }

    const order = await prisma.$transaction(async (tx) => {
      if (
        body.status === "CANCELLED" &&
        existing.status !== "CANCELLED" &&
        existing.status !== "REFUNDED"
      ) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { orderId: body.orderId },
        data: { status: body.status },
      });
    });

    void notifyOrderStatus(order).catch((err) => console.error("push failed", err));

    return NextResponse.json({ order });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "상태 변경 실패" }, { status: 400 });
  }
}
