import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "1";

  if (all) {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const products = await prisma.product.findMany({
    where: all ? undefined : { published: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string()).default([]),
  saleType: z.enum(["NORMAL", "PREORDER"]).default("NORMAL"),
  options: z.array(z.object({ name: z.string(), values: z.array(z.string()) })).default([]),
  category: z.string().default("goods"),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = createSchema.parse(await req.json());
    const product = await prisma.product.create({
      data: {
        ...body,
        images: JSON.stringify(body.images),
        options: JSON.stringify(body.options),
      },
    });
    return NextResponse.json({ product });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message || "입력값 오류" }, { status: 400 });
    }
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "이미 사용 중인 슬러그입니다." }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "상품 등록 실패" }, { status: 500 });
  }
}
