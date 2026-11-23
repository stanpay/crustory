import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file");

    // Next/undici에서 File instanceof 가 깨지는 경우가 있어 Blob 기준으로 판별
    if (!file || typeof file === "string" || !(file instanceof Blob)) {
      return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
    }

    const originalName = file instanceof File ? file.name : "";
    const mimeFromName = originalName.match(/\.png$/i)
      ? "image/png"
      : originalName.match(/\.webp$/i)
        ? "image/webp"
        : originalName.match(/\.gif$/i)
          ? "image/gif"
          : originalName.match(/\.(jpe?g)$/i)
            ? "image/jpeg"
            : "";
    const mime = ALLOWED.has(file.type) ? file.type : mimeFromName || "image/jpeg";

    if (!ALLOWED.has(mime)) {
      return NextResponse.json(
        { error: "jpg, png, webp, gif만 업로드할 수 있습니다." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "파일은 8MB 이하여야 합니다." }, { status: 400 });
    }

    const ext =
      mime === "image/png"
        ? "png"
        : mime === "image/webp"
          ? "webp"
          : mime === "image/gif"
            ? "gif"
            : "jpg";

    const savedName = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, savedName), buffer);

    return NextResponse.json({ url: `/uploads/products/${savedName}` });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
  }
}
