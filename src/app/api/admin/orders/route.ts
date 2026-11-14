import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
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
    const order = await prisma.order.update({
      where: { orderId: body.orderId },
      data: { status: body.status },
    });
    return NextResponse.json({ order });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "상태 변경 실패" }, { status: 400 });
  }
}
