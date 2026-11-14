import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelPayment } from "@/lib/toss";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  cancelReason: z.string().min(1).default("관리자 취소"),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = schema.parse(await req.json());

    const order = await prisma.order.findUnique({
      where: { orderId: body.orderId },
      include: { items: true },
    });

    if (!order || !order.paymentKey) {
      return NextResponse.json({ error: "취소할 결제가 없습니다." }, { status: 404 });
    }

    if (order.status !== "PAID" && order.status !== "SHIPPED") {
      return NextResponse.json({ error: "취소할 수 없는 상태입니다." }, { status: 400 });
    }

    await cancelPayment({
      paymentKey: order.paymentKey,
      cancelReason: body.cancelReason,
    });

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "취소 실패" },
      { status: 500 },
    );
  }
}
