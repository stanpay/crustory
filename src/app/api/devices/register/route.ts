import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

const schema = z.object({
  token: z.string().min(10),
  platform: z.enum(["android", "ios"]).default("android"),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const customer = await getCustomerSession();

    const device = await prisma.pushDevice.upsert({
      where: { token: body.token },
      create: {
        token: body.token,
        platform: body.platform,
        customerId: customer?.id ?? null,
      },
      update: {
        platform: body.platform,
        customerId: customer?.id ?? undefined,
      },
    });

    return NextResponse.json({ ok: true, id: device.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid token" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "register failed" }, { status: 500 });
  }
}
