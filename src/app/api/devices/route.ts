import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(10),
});

export async function DELETE(req: Request) {
  try {
    const body = schema.parse(await req.json());
    await prisma.pushDevice.deleteMany({ where: { token: body.token } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid token" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "delete failed" }, { status: 500 });
  }
}
