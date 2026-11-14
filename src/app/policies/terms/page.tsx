import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="wrap section narrow">
      <header className="page-head" style={{ paddingTop: 0 }}>
        <h1>이용약관</h1>
      </header>
      <div className="panel">
        <p>
          본 웹사이트의 서비스는 크러스토리 브랜드 소개 및 굿즈 판매를 목적으로
          합니다. 회원·비회원 구매, 예약판매, 배송·환불 정책은 이용안내 페이지를
          따릅니다.
        </p>
        <p style={{ marginTop: "1rem" }}>
          프로토타입 단계의 약관이며, 정식 서비스 오픈 시 법률 검토를 거친
          확정본으로 업데이트됩니다.
        </p>
      </div>
    </div>
  );
}
