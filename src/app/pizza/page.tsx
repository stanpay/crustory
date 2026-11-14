import type { Metadata } from "next";
import Link from "next/link";
import { PizzaArt } from "@/components/brand/Illustrations";

export const metadata: Metadata = {
  title: "Pizza",
  description: "제주 8인치 1인 피자 및 매장 안내",
};

const menus = [
  { name: "멜젓 갈릭", price: "18,000원", desc: "제주 멜젓의 깊은 감칠맛과 구운 마늘" },
  { name: "흑돼지 페퍼", price: "19,000원", desc: "제주 흑돼지와 굵게 간 후추" },
  { name: "감귤 리코타", price: "17,000원", desc: "상큼한 감귤과 부드러운 리코타" },
];

export default function PizzaPage() {
  return (
    <>
      <section className="wrap">
        <header className="page-head">
          <h1>혼자 먹기 딱 좋은 8인치</h1>
          <p>제주 식재료로 만든 1인 피자. 1호점 오픈을 준비하고 있어요.</p>
        </header>
        <div className="stories" style={{ alignItems: "center" }}>
          <div className="story-tile__art" style={{ background: "var(--gyul)" }}>
            <PizzaArt />
          </div>
          <div>
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <h2>메뉴</h2>
            </div>
            <ul className="menu-list" style={{ marginTop: 16 }}>
              {menus.map((m) => (
                <li key={m.name}>
                  <h3>{m.name}</h3>
                  <span>{m.price}</span>
                  <p>{m.desc}</p>
                </li>
              ))}
            </ul>
            <p className="note">메뉴와 가격은 1호점 오픈 때 확정돼요.</p>
          </div>
        </div>
      </section>

      <section className="wrap block">
        <div className="chapter">
          <p className="chapter__no">Package</p>
          <h2>RUNIE FOLD</h2>
          <div>
            <p>
              접어서 한 손에 들고 다닐 수 있는 패키지. 바다 앞에서, 오름 아래에서, 숙소에서 혼자
              먹기 편하도록 준비하고 있어요.
            </p>
          </div>
        </div>
        <div className="chapter">
          <p className="chapter__no">Store</p>
          <h2>1호점 안내</h2>
          <div>
            <p>
              위치, 운영 시간, 방문 안내는 오픈 일정에 맞춰 이곳에 알려드릴게요. 이후 픽업 주문도
              연결할 예정이에요.
            </p>
            <p style={{ marginTop: 20 }}>
              <Link href="/contact" className="arrow-link">오픈 소식 문의하기</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
