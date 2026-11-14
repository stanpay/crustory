import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="announce">
      러니 여행노트 예약판매 중 · 5만원 이상 무료배송{" "}
      <Link href="/shop?type=PREORDER">보러 가기</Link>
    </div>
  );
}
