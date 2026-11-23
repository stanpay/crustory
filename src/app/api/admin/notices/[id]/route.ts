import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = patchSchema.parse(await req.json());

    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "공지를 찾을 수 없습니다." }, { status: 404 });
    }

    const notice = await prisma.$transaction(async (tx) => {
      if (body.active === true) {
        await tx.notice.updateMany({
          where: { active: true, NOT: { id } },
          data: { active: false },
        });
      }
      return tx.notice.update({
        where: { id },
        data: {
          ...(body.title !== undefined
            ? {
                title: body.title,
                body: "",
                linkHref: null,
                linkLabel: null,
              }
            : {}),
          ...(body.active !== undefined ? { active: body.active } : {}),
        },
      });
    });

    return NextResponse.json({ notice });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "입력값을 확인해 주세요." }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "공지 수정 실패" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    await prisma.notice.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "공지 삭제 실패" }, { status: 500 });
  }
}
