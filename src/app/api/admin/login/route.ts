import { NextResponse } from "next/server";

/** Password login removed — use Kakao at /admin/login → /api/auth/kakao?next=/admin */
export async function POST() {
  return NextResponse.json(
    {
      error: "비밀번호 로그인은 종료되었습니다. 카카오로 로그인해 주세요.",
      kakao: "/api/auth/kakao?next=/admin",
    },
    { status: 410 },
  );
}
