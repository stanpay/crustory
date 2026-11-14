import type { Metadata } from "next";
import Link from "next/link";
import { Runie } from "@/components/brand/Runie";

export const metadata: Metadata = {
  title: "Meet Runie",
  description: "7연승 후 은퇴한 제주 경주마, 러니",
};

const races = [
  { no: "1–3승", title: "제주 경마장 데뷔", body: "출발은 늦었는데 도착은 제일 빨랐다. 본인은 그게 왜 대단한지 잘 몰랐다." },
  { no: "4–6승", title: "연승, 그리고 피로", body: "이길수록 다음 경주가 더 빨리 왔다. 결승선을 지나도 쉴 수가 없었다." },
  { no: "7승", title: "일곱 번째 1등", body: "기록이 생겼다. 박수도 받았다. 그런데 이상하게 아무 느낌이 없었다." },
  { no: "은퇴", title: "여덟 번째 경주에 나가지 않았다", body: "이유를 물으면 “그냥.” 대신 처음으로 천천히 제주를 걸어 봤다.", turn: true },
  { no: "지금", title: "혼자 온 사람 옆에", body: "결승선 없는 길을 걷는 여행자들 옆에 조용히 있는다. 가끔 한마디 한다." },
];

export default function MeetRuniePage() {
  return (
    <>
      <section className="wrap">
        <header className="page-head">
          <h1>러니를 소개할게요</h1>
          <p>무심하지만 위트 있는, 은퇴한 제주 경주마.</p>
        </header>
        <div className="profile">
          <div className="profile__art">
            <Runie />
          </div>
          <div>
            <h2>러니</h2>
            <p className="profile__en">RUNIE · Retired racehorse from Jeju</p>
            <p className="profile__lead">
              러니는 크러스토리의 마스코트가 아니라, 자기 이야기를 가진 캐릭터예요. 7연승 뒤
              은퇴한 경주마가 처음으로 ‘이기지 않아도 되는’ 시간을 보내는 이야기를 그려요.
            </p>
            <dl className="spec">
              <dt>출신</dt>
              <dd>제주</dd>
              <dt>전적</dt>
              <dd>7전 7승, 그리고 은퇴</dd>
              <dt>성격</dt>
              <dd>무심함. 말수 적음. 가끔 위트.</dd>
              <dt>좋아하는 것</dt>
              <dd>바람 부는 오름, 혼자 먹는 따뜻한 피자</dd>
              <dt>입버릇</dt>
              <dd>여긴 결승선 없어.</dd>
            </dl>
          </div>
        </div>
      </section>

      <section className="wrap block">
        <div className="sec-head">
          <h2>결승선이 사라지기까지</h2>
        </div>
        <ol className="timeline">
          {races.map((r) => (
            <li key={r.no} className={r.turn ? "is-turn" : undefined}>
              <b>{r.no}</b>
              <div>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pull pull--red block" style={{ marginTop: "clamp(64px, 9vw, 120px)" }}>
        <div className="wrap">
          <p>여긴 결승선 없어.</p>
          <small>— 러니</small>
        </div>
      </section>

      <section className="wrap block">
        <div className="sec-head">
          <h2>브랜드 필름</h2>
        </div>
        <div className="film">
          <div>
            <strong>러니, 제주를 걷다</strong>
            <p>필름은 공개 준비 중이에요. 인스타그램에서 먼저 소식을 전할게요.</p>
          </div>
        </div>
      </section>

      <section className="wrap block">
        <div className="stories">
          <article className="story-tile">
            <p className="story-tile__meta">Goods</p>
            <h3>러니와 같이 다니기</h3>
            <p>키링, 스티커, 엽서, 여행노트. 혼자 떠나는 길에 하나쯤 챙겨 가기 좋은 것들.</p>
            <Link href="/shop" className="arrow-link">러니 굿즈 보기</Link>
          </article>
          <article className="story-tile">
            <p className="story-tile__meta">Coming next</p>
            <h3>짧은 애니메이션과 웹툰</h3>
            <p>러니의 제주 생활을 짧은 이야기로 이어갈 예정이에요.</p>
            <a href="https://www.instagram.com/crustory_jeju/" target="_blank" rel="noreferrer" className="arrow-link">
              인스타그램에서 보기
            </a>
          </article>
        </div>
      </section>
    </>
  );
}
