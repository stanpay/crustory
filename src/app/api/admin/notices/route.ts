import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  linkHref: z.string().trim().optional().nullable(),
  linkLabel: z.string().trim().optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const notices = await prisma.notice.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ notices });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "공지 목록 조회 실패" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = createSchema.parse(await req.json());
    const active = body.active ?? true;

    const notice = await prisma.$transaction(async (tx) => {
      if (active) {
        await tx.notice.updateMany({
          where: { active: true },
          data: { active: false },
        });
      }
      return tx.notice.create({
        data: {
          title: body.title,
          body: body.body,
          linkHref: body.linkHref || null,
          linkLabel: body.linkLabel || null,
          active,
        },
      });
    });

    return NextResponse.json({ notice }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "입력값을 확인해 주세요." }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "공지 등록 실패" }, { status: 500 });
  }
}
