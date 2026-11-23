import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  clearCustomerSessionOn,
  requireCustomer,
} from "@/lib/customer-auth";

/**
 * Account deletion for store compliance (Play / App Store).
 * Unlinks push devices and deletes the customer record.
 * Orders remain as guest historical records (userId cleared via SetNull).
 */
export async function DELETE() {
  try {
    const user = await requireCustomer();

    await prisma.$transaction(async (tx) => {
      await tx.pushDevice.deleteMany({ where: { customerId: user.id } });
      await tx.customer.delete({ where: { id: user.id } });
    });

    const res = NextResponse.json({ ok: true });
    clearCustomerSessionOn(res);
    return res;
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "계정 삭제 실패" }, { status: 500 });
  }
}
