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
          크러스토리는 고객 문의·계정 처리를 위해 이름, 이메일, 연락처를 수집할 수
          있습니다. 온라인 주문·PG 결제는 사용하지 않으며 카드 번호를 저장하지
          않습니다. 앱 이용 시 안내 푸시를 위해 알림 토큰을 수집할 수 있습니다.
        </p>
        <p style={{ marginTop: "1rem" }}>
          수집된 정보는 관련 법령에 따른 보관 기간 동안 유지되며, 목적 달성 후
          파기합니다. 회원은{" "}
          <a href="/account">계정 페이지</a>에서 계정 삭제를 요청할 수 있습니다.
          자세한 운영 정책은 정식 오픈 전 확정본으로 교체됩니다.
        </p>
      </div>
    </div>
  );
}
