import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  saleType: z.enum(["NORMAL", "PREORDER"]).optional(),
  options: z
    .array(z.object({ name: z.string(), values: z.array(z.string()) }))
    .optional(),
  category: z.string().min(1).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
    const { slug } = await ctx.params;
    const body = patchSchema.parse(await req.json());
    const { images, options, ...rest } = body;
    const product = await prisma.product.update({
      where: { slug },
      data: {
        ...rest,
        ...(images ? { images: JSON.stringify(images) } : {}),
        ...(options ? { options: JSON.stringify(options) } : {}),
      },
    });
    return NextResponse.json({ product });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "상품 수정 실패" }, { status: 500 });
  }
}
