import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Guide" };

export default function GuidePage() {
  return (
    <div className="wrap section narrow">
      <header className="page-head" style={{ paddingTop: 0 }}>
        <h1>이용안내</h1>
      </header>
      <div className="panel">
        <section>
          <h2>상품·구매 안내</h2>
          <p>
            Shop은 상품 소개용입니다. 현재 온라인 장바구니·주문·결제는 제공하지 않습니다.
            궁금한 점은 <Link href="/contact">문의하기</Link>로 남겨 주세요.
          </p>
        </section>
        <section>
          <h2>매장·피자</h2>
          <p>
            피자·매장 이용은 <Link href="/pizza">Pizza</Link> 페이지와 인스타그램 공지를
            참고해 주세요.
          </p>
        </section>
        <section>
          <h2>계정</h2>
          <p>
            카카오 로그인으로 계정을 만들 수 있으며,{" "}
            <Link href="/account">계정 페이지</Link>에서 삭제를 요청할 수 있습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
