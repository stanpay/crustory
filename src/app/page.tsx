import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { Runie } from "@/components/brand/Runie";
import { NotebookArt, PizzaArt } from "@/components/brand/Illustrations";

export default async function HomePage() {
  await connection();
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    take: 4,
  });

  return (
    <>
      <section className="intro">
        <div className="intro__art">
          <span className="intro__bubble">여긴 결승선 없어.</span>
          <Runie />
        </div>
        <div className="intro__text">
          <p className="intro__kicker">For solo travelers, from Jeju</p>
          <h1 className="intro__title">
            혼자 온 여행을,
            <br />
            더 잘 즐길 수 있도록.
          </h1>
          <p className="intro__body">
            크러스토리는 제주를 혼자 여행하는 사람을 위한 브랜드예요. 8인치 1인 피자,
            그리고 은퇴한 경주마 러니와 함께 음식·굿즈·이야기를 만듭니다.
          </p>
          <div className="intro__links">
            <Link href="/shop" className="arrow-link">러니 굿즈 보기</Link>
            <Link href="/meet-runie" className="arrow-link">러니는 누구?</Link>
          </div>
        </div>
      </section>

      <section className="wrap block">
        <div className="sec-head">
          <h2>러니 굿즈</h2>
          <Link href="/shop">전체 보기</Link>
        </div>
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              price={p.price}
              images={p.images}
              saleType={p.saleType}
              stock={p.stock}
            />
          ))}
        </div>
      </section>

      <section className="wrap block">
        <div className="profile">
          <div className="profile__art">
            <Runie />
          </div>
          <div>
            <h2>러니</h2>
            <p className="profile__en">RUNIE · Retired racehorse</p>
            <p className="profile__lead">
              일곱 번 연속으로 1등을 하고, 여덟 번째 경주 전날 그만뒀어요. 이유를 물으면
              “그냥.”이라고 해요. 요즘은 혼자 여행 온 사람 옆에 조용히 있는 일을 해요.
            </p>
            <dl className="spec">
              <dt>출신</dt>
              <dd>제주</dd>
              <dt>전적</dt>
              <dd>7전 7승, 그리고 은퇴</dd>
              <dt>성격</dt>
              <dd>무심함. 가끔 위트.</dd>
              <dt>입버릇</dt>
              <dd>여긴 결승선 없어.</dd>
            </dl>
            <p style={{ marginTop: 28 }}>
              <Link href="/meet-runie" className="arrow-link">러니 이야기 더 보기</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="wrap block">
        <div className="stories">
          <article className="story-tile">
            <Link href="/pizza" className="story-tile__art" style={{ background: "var(--gyul)" }}>
              <PizzaArt />
            </Link>
            <p className="story-tile__meta">Pizza · 1호점 준비 중</p>
            <h3>혼자 먹기 딱 좋은 8인치</h3>
            <p>
              두 판은 많고 한 조각은 아쉬운 혼행객을 위해, 제주 식재료로 만든 1인 피자.
              접어서 들고 다니는 RUNIE FOLD 패키지도 함께 준비하고 있어요.
            </p>
            <Link href="/pizza" className="arrow-link">메뉴 보기</Link>
          </article>
          <article className="story-tile">
            <Link href="/our-story" className="story-tile__art" style={{ background: "var(--paper-2)" }}>
              <NotebookArt />
            </Link>
            <p className="story-tile__meta">Our Story</p>
            <h3>게스트하우스에서 들은 120개의 혼행 이야기</h3>
            <p>
              번아웃 끝에 제주에 머물며 만난 여행자들의 이야기가 크러스토리의 시작이 됐어요.
            </p>
            <Link href="/our-story" className="arrow-link">브랜드 이야기</Link>
          </article>
        </div>
      </section>

      <section className="wrap block">
        <div className="promises">
          <div>
            <strong>제주에서 시작했어요</strong>
            <span>제주 혼행객의 이야기에서 나온 브랜드.</span>
          </div>
          <div>
            <strong>5만원 이상 무료배송</strong>
            <span>그 이하는 배송비 3,000원.</span>
          </div>
          <div>
            <strong>예약판매는 순차 발송</strong>
            <span>제작이 끝나는 대로 주문 순서대로 보내드려요.</span>
          </div>
        </div>
      </section>
    </>
  );
}
