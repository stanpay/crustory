import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import {
  deltaPct,
  fetchGaVisitorsReport,
  formatDuration,
  formatPct,
  type GaDailyRow,
  type GaDimRow,
  type GaSummary,
} from "@/lib/ga-analytics";

function Delta({ current, previous }: { current: number; previous: number }) {
  const d = deltaPct(current, previous);
  if (d === null) return <span className="admin-visitors__delta is-flat">—</span>;
  const up = d > 0;
  const flat = Math.abs(d) < 0.05;
  return (
    <span
      className={`admin-visitors__delta${flat ? " is-flat" : up ? " is-up" : " is-down"}`}
    >
      {flat ? "변동 없음" : `${up ? "+" : ""}${d.toFixed(1)}%`}
      <span> 이전 기간 대비</span>
    </span>
  );
}

function MetricCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: ReactNode;
}) {
  return (
    <article className="value-card">
      <h3>{title}</h3>
      <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111", margin: "0.35rem 0 0" }}>
        {value}
      </p>
      {hint}
    </article>
  );
}

function MetricCardWithDelta({
  title,
  value,
  current,
  previous,
}: {
  title: string;
  value: string;
  current: number;
  previous: number;
}) {
  return (
    <article className="value-card">
      <h3>{title}</h3>
      <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111", margin: "0.35rem 0 0" }}>
        {value}
      </p>
      <Delta current={current} previous={previous} />
    </article>
  );
}

function DailyChart({ rows }: { rows: GaDailyRow[] }) {
  if (rows.length === 0) {
    return <p className="section-text">일별 데이터가 없습니다.</p>;
  }
  const max = Math.max(...rows.map((r) => r.activeUsers), 1);
  return (
    <div className="admin-visitors__chart" role="img" aria-label="일별 활성 사용자">
      {rows.map((r) => {
        const h = Math.max(4, Math.round((r.activeUsers / max) * 100));
        const label = r.date.slice(5);
        return (
          <div key={r.date} className="admin-visitors__bar-wrap" title={`${r.date}: ${r.activeUsers}명`}>
            <div className="admin-visitors__bar" style={{ height: `${h}%` }} />
            <span className="admin-visitors__bar-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function RankTable({
  title,
  rows,
  valueLabel,
}: {
  title: string;
  rows: GaDimRow[];
  valueLabel: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <section className="admin-visitors__panel">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className="section-text">데이터가 없습니다.</p>
      ) : (
        <table className="admin-table" style={{ marginTop: "0.75rem", minWidth: 0 }}>
          <thead>
            <tr>
              <th>{title.includes("페이지") ? "경로" : "항목"}</th>
              <th>{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td>
                  <div className="admin-visitors__rank-label">{r.label}</div>
                  <div className="admin-visitors__rank-track">
                    <div
                      className="admin-visitors__rank-fill"
                      style={{ width: `${(r.value / max) * 100}%` }}
                    />
                  </div>
                </td>
                <td>{r.value.toLocaleString("ko-KR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function SetupNotice({ error }: { error?: string }) {
  return (
    <div className="admin-visitors__setup">
      <h2>Google Analytics 연동 필요</h2>
      <p className="section-text">
        GA4 Data API로 방문 통계를 불러오려면 아래 환경변수를 설정하세요.
      </p>
      {error ? <p className="admin-visitors__error">{error}</p> : null}
      <ol className="admin-visitors__steps">
        <li>
          Google Cloud에서 <strong>Google Analytics Data API</strong>를 활성화합니다.
        </li>
        <li>
          서비스 계정 JSON을 만들고, GA4 속성 → 속성 액세스 관리에 해당{" "}
          <code>client_email</code>을 <strong>뷰어</strong>로 추가합니다.
        </li>
        <li>
          환경변수에 다음을 넣습니다.
          <ul>
            <li>
              <code>GA4_PROPERTY_ID</code> — GA4 속성 ID (숫자)
            </li>
            <li>
              <code>GA_SERVICE_ACCOUNT_JSON</code> — 서비스 계정 JSON 문자열
              <br />
              (없으면 <code>FIREBASE_SERVICE_ACCOUNT_JSON</code>을 재사용)
            </li>
          </ul>
        </li>
      </ol>
    </div>
  );
}

export default async function AdminVisitorsPage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const report = await fetchGaVisitorsReport(28);
  const s: GaSummary = report.summary;
  const p: GaSummary = report.previousSummary;

  return (
    <div className="admin-visitors">
      <div>
        <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
          방문객
        </h1>
        <p className="section-text">
          Google Analytics(GA4) 기준 {report.rangeLabel} 방문 현황입니다.
          {report.propertyId ? ` · property ${report.propertyId}` : null}
        </p>
      </div>

      {!report.configured ? (
        <SetupNotice error={report.error} />
      ) : (
        <>
          <div className="values-grid admin-visitors__metrics" style={{ marginTop: "1.5rem" }}>
            <MetricCard
              title="지금 접속 중"
              value={report.realtimeUsers.toLocaleString("ko-KR")}
              hint={<span className="admin-visitors__delta is-flat">실시간</span>}
            />
            <MetricCardWithDelta
              title="활성 사용자"
              value={s.activeUsers.toLocaleString("ko-KR")}
              current={s.activeUsers}
              previous={p.activeUsers}
            />
            <MetricCardWithDelta
              title="세션"
              value={s.sessions.toLocaleString("ko-KR")}
              current={s.sessions}
              previous={p.sessions}
            />
            <MetricCardWithDelta
              title="페이지뷰"
              value={s.pageViews.toLocaleString("ko-KR")}
              current={s.pageViews}
              previous={p.pageViews}
            />
            <MetricCardWithDelta
              title="참여율"
              value={formatPct(s.engagementRate)}
              current={s.engagementRate}
              previous={p.engagementRate}
            />
            <MetricCard
              title="평균 세션 시간"
              value={formatDuration(s.avgSessionDurationSec)}
              hint={
                <Delta
                  current={s.avgSessionDurationSec}
                  previous={p.avgSessionDurationSec}
                />
              }
            />
          </div>

          <section className="admin-visitors__panel" style={{ marginTop: "2rem" }}>
            <h2>일별 활성 사용자</h2>
            <DailyChart rows={report.daily} />
            <div className="admin-visitors__scroll">
              <table className="admin-table" style={{ marginTop: "1rem" }}>
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>활성 사용자</th>
                    <th>세션</th>
                    <th>페이지뷰</th>
                  </tr>
                </thead>
                <tbody>
                  {[...report.daily].reverse().map((r) => (
                    <tr key={r.date}>
                      <td>{r.date}</td>
                      <td>{r.activeUsers.toLocaleString("ko-KR")}</td>
                      <td>{r.sessions.toLocaleString("ko-KR")}</td>
                      <td>{r.pageViews.toLocaleString("ko-KR")}</td>
                    </tr>
                  ))}
                  {report.daily.length === 0 && (
                    <tr>
                      <td colSpan={4}>데이터가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="admin-visitors__grid">
            <RankTable title="인기 페이지" rows={report.topPages} valueLabel="조회수" />
            <RankTable title="유입 채널" rows={report.channels} valueLabel="세션" />
            <RankTable title="기기" rows={report.devices} valueLabel="사용자" />
            <RankTable title="국가" rows={report.countries} valueLabel="사용자" />
          </div>
        </>
      )}
    </div>
  );
}
