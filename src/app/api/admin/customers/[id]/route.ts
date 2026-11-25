import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Admin-forced account deletion.
 * Same semantics as customer self-delete: unlink push devices, delete Customer;
 * orders remain with userId cleared via SetNull.
 */
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.pushDevice.deleteMany({ where: { customerId: id } });
      await tx.customer.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "계정 삭제 실패" }, { status: 500 });
  }
}
