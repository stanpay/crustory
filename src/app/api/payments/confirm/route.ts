import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmPayment } from "@/lib/toss";
import { z } from "zod";

const schema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    const order = await prisma.order.findUnique({
      where: { orderId: body.orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
    }

    if (order.amount !== body.amount) {
      return NextResponse.json({ error: "금액이 일치하지 않습니다." }, { status: 400 });
    }

    if (order.status === "PAID") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    await confirmPayment({
      paymentKey: body.paymentKey,
      orderId: body.orderId,
      amount: body.amount,
    });

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(`재고 부족: ${item.name}`);
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentKey: body.paymentKey,
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "결제 승인 실패" },
      { status: 500 },
    );
  }
}
