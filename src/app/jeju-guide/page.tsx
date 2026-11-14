import type { Metadata } from "next";
import Link from "next/link";
import { Runie } from "@/components/brand/Runie";

export const metadata: Metadata = {
  title: "Jeju Guide",
  description: "혼행객을 위한 제주 가이드 — 준비 중",
};

export default function JejuGuidePage() {
  return (
    <section className="wrap narrow center section">
      <Runie className="note-band__runie" title="" />
      <header className="page-head" style={{ paddingTop: 24 }}>
        <h1>러니의 제주 가이드</h1>
        <p>
          혼자 가기 좋은 장소, 혼자 걷기 좋은 코스, 그리고 러니가 좋아하는 제주. 지금 천천히
          모으고 있어요.
        </p>
      </header>
      <div className="actions-row">
        <Link href="/shop" className="btn btn-dark">러니 굿즈 보기</Link>
        <Link href="/meet-runie" className="btn btn-ghost">러니 만나기</Link>
      </div>
    </section>
  );
}
