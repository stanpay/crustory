import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderId } from "@/lib/format";
import { z } from "zod";

const schema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8),
  shippingAddress: z.string().min(1),
  shippingMemo: z.string().optional(),
  amount: z.number().int().positive(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number().int(),
        quantity: z.number().int().positive(),
        option: z.string().optional(),
      }),
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    const products = await prisma.product.findMany({
      where: { id: { in: body.items.map((i) => i.productId) } },
    });

    let computed = 0;
    for (const item of body.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.published) {
        return NextResponse.json(
          { error: `상품을 찾을 수 없습니다: ${item.name}` },
          { status: 400 },
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `재고 부족: ${product.name}` },
          { status: 400 },
        );
      }
      if (product.price !== item.price) {
        return NextResponse.json(
          { error: `가격이 변경된 상품이 있습니다: ${product.name}` },
          { status: 400 },
        );
      }
      computed += product.price * item.quantity;
    }

    const shippingFee = computed >= 50000 ? 0 : 3000;
    const expected = computed + shippingFee;
    if (expected !== body.amount) {
      return NextResponse.json(
        { error: "결제 금액이 일치하지 않습니다." },
        { status: 400 },
      );
    }

    const orderId = generateOrderId();
    const order = await prisma.order.create({
      data: {
        orderId,
        amount: body.amount,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        shippingAddress: body.shippingAddress,
        shippingMemo: body.shippingMemo || null,
        isGuest: true,
        status: "PENDING",
        items: {
          create: body.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            option: item.option || null,
          })),
        },
      },
    });

    return NextResponse.json({ orderId: order.orderId, id: order.id });
  } catch (e) {
    console.error(e);
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
    }
    return NextResponse.json({ error: "주문 생성 실패" }, { status: 500 });
  }
}
