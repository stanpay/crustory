import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="wrap section narrow">
      <header className="page-head" style={{ paddingTop: 0 }}>
        <h1>개인정보처리방침</h1>
      </header>
      <div className="panel">
        <p>
          크러스토리는 주문·배송·고객 문의 처리를 위해 이름, 이메일, 연락처,
          배송지 정보를 수집합니다. 결제 정보는 토스페이먼츠를 통해 처리되며
          당사가 카드 번호를 직접 저장하지 않습니다.
        </p>
        <p style={{ marginTop: "1rem" }}>
          수집된 정보는 관련 법령에 따른 보관 기간 동안 유지되며, 목적 달성 후
          파기합니다. 자세한 운영 정책은 정식 오픈 전 확정본으로 교체됩니다.
        </p>
      </div>
    </div>
  );
}
