import type { Metadata } from "next";

export const metadata: Metadata = { title: "Guide" };

export default function GuidePage() {
  return (
    <div className="wrap section narrow">
      <header className="page-head" style={{ paddingTop: 0 }}>
        <h1>이용안내</h1>
      </header>
      <div className="panel">
        <section>
          <h2>주문 안내</h2>
          <p>장바구니에 담은 뒤 주문서에서 배송 정보를 입력하고 결제합니다. 회원·비회원 모두 구매할 수 있습니다.</p>
        </section>
        <section>
          <h2>결제 안내</h2>
          <p>토스페이먼츠를 통해 카드 및 간편결제를 지원합니다. 현재 프로토타입은 샌드박스(테스트) 환경입니다.</p>
        </section>
        <section>
          <h2>배송 안내</h2>
          <p>기본 배송비 3,000원, 50,000원 이상 구매 시 무료입니다. 예약판매 상품은 제작 후 순차 출고됩니다.</p>
        </section>
        <section>
          <h2>교환/반품</h2>
          <p>상품 하자 시 수령 후 7일 이내 문의해 주세요. 단순 변심은 왕복 배송비가 발생할 수 있습니다.</p>
        </section>
      </div>
    </div>
  );
}
