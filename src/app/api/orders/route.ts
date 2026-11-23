import { NextResponse } from "next/server";

/** Customer order creation is disabled. */
export async function POST() {
  return NextResponse.json(
    { error: "온라인 주문은 현재 받지 않습니다. 문의하기를 이용해 주세요." },
    { status: 410 },
  );
}
