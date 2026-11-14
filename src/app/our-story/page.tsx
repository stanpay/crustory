import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story",
  description: "크러스토리 브랜드 스토리와 핵심 가치",
};

export default function OurStoryPage() {
  return (
    <>
      <section className="wrap">
        <header className="page-head">
          <h1>
            혼자 온 여행을,
            <br />더 잘 즐길 수 있도록.
          </h1>
          <p>크러스토리가 시작된 이야기</p>
        </header>

        <div className="chapter">
          <p className="chapter__no">01 · 시작</p>
          <h2>번아웃 이후, 제주에 머물렀어요</h2>
          <div>
            <p>
              일을 멈추고 제주에 내려와 게스트하우스에서 지냈어요. 그곳엔 혼자 온 여행자가
              많았어요. 쉬러 왔다는 사람, 처음으로 혼자 떠나 봤다는 사람, 이유 없이 왔다는 사람.
            </p>
          </div>
        </div>

        <div className="chapter">
          <p className="chapter__no">02 · 듣기</p>
          <h2>120명이 넘는 혼행객과 이야기했어요</h2>
          <div>
            <p>
              혼자 여행하는 20–30대에게 무엇이 좋고 무엇이 아쉬운지 물었어요. 혼자 먹기엔 양이
              많은 식사, 기념할 만한 작은 물건, 그리고 ‘잘 쉬고 있는 걸까’ 하는 마음.
            </p>
            <p>그 대답들이 피자와 굿즈, 그리고 러니가 되었어요.</p>
          </div>
        </div>

        <div className="chapter">
          <p className="chapter__no">03 · 지금</p>
          <h2>제주에서, 혼자인 사람을 위한 브랜드</h2>
          <div>
            <p>
              8인치 1인 피자로 한 끼를, 러니 굿즈로 여행의 기억을, 이야기로 다음 여행을 만들어요.
              크러스토리는 제주에서 시작해 혼행이라는 방식 자체를 더 즐겁게 만들고 싶어요.
            </p>
          </div>
        </div>
      </section>

      <section className="pull pull--red" style={{ marginTop: "clamp(40px, 6vw, 72px)" }}>
        <div className="wrap">
          <p>피자 브랜드가 아니라, 혼행을 위한 브랜드.</p>
        </div>
      </section>

      <section className="wrap block">
        <div className="sec-head">
          <h2>우리가 지키는 것</h2>
        </div>
        <ul className="values">
          <li>
            <strong>FOR ONE</strong>
            <span>혼자여도 충분하게. 1인분의 크기, 혼자 다니는 동선에 맞춘 제품을 만들어요.</span>
          </li>
          <li>
            <strong>MORE IN ONE</strong>
            <span>음식, 굿즈, 이야기가 따로 놀지 않도록. 하나의 경험으로 이어지게 해요.</span>
          </li>
          <li>
            <strong>NO FINISH LINE</strong>
            <span>여행에도 일상에도 정해진 결승선은 없어요. 러니가 늘 하는 말이기도 해요.</span>
          </li>
        </ul>
        <p style={{ marginTop: 32 }}>
          <Link href="/meet-runie" className="arrow-link">러니 만나러 가기</Link>
        </p>
      </section>
    </>
  );
}
