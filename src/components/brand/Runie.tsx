/**
 * RUNIE — 은퇴한 제주 경주마. 무심한 반쯤 감긴 눈이 캐릭터의 핵심.
 * 최종 캐릭터 일러스트가 전달되면 이 컴포넌트만 교체하면 된다.
 */

type Props = {
  className?: string;
  title?: string;
  /** "front" = 정면, "peek" = 아래에서 고개만 내민 모습 */
  pose?: "front" | "peek";
};

const COAT = "#B7641F";
const LID = "#97501A";
const MUZZLE = "#F1D3A6";
const MANE = "#C62828";
const INK = "#1E1B17";

export function Runie({ className, title = "러니", pose = "front" }: Props) {
  const viewBox = pose === "peek" ? "0 0 200 130" : "0 0 200 200";
  return (
    <svg
      viewBox={viewBox}
      className={["runie", className].filter(Boolean).join(" ")}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      {/* ears */}
      <path d="M60 58 L70 14 Q74 8 80 14 L96 48 Z" fill={COAT} />
      <path d="M140 58 L130 14 Q126 8 120 14 L104 48 Z" fill={COAT} />
      <path d="M68 50 L73 24 L86 46 Z" fill={LID} />
      <path d="M132 50 L127 24 L114 46 Z" fill={LID} />
      {/* head */}
      <path
        d="M52 92 C50 44 150 44 148 92 L142 150 C140 196 60 196 58 150 Z"
        fill={COAT}
      />
      {/* forelock */}
      <path
        d="M80 52 C82 30 98 26 102 40 C106 26 124 30 120 54 C112 46 106 58 100 52 C94 60 88 48 80 52 Z"
        fill={MANE}
      />
      {/* eyes: whites, pupils glancing sideways, heavy lids */}
      <ellipse cx="78" cy="98" rx="14" ry="15" fill="#fff" />
      <ellipse cx="122" cy="98" rx="14" ry="15" fill="#fff" />
      <circle cx="84" cy="103" r="7.5" fill={INK} />
      <circle cx="128" cy="103" r="7.5" fill={INK} />
      <path d="M62 99 A16 16 0 0 1 94 99 Z" fill={LID} />
      <path d="M106 99 A16 16 0 0 1 138 99 Z" fill={LID} />
      <path d="M63 99 H93 M107 99 H137" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      {/* muzzle */}
      <ellipse cx="100" cy="158" rx="40" ry="28" fill={MUZZLE} />
      <ellipse cx="86" cy="152" rx="4" ry="6" fill={INK} />
      <ellipse cx="114" cy="152" rx="4" ry="6" fill={INK} />
      <path d="M90 172 Q100 170 112 174" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** 헤더·아이콘용 — 러니의 반쯤 감긴 눈 두 개 */
export function RunieEyes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 30" className={className} aria-hidden>
      <ellipse cx="16" cy="15" rx="13" ry="13.5" fill="#fff" stroke={INK} strokeWidth="1.5" />
      <ellipse cx="48" cy="15" rx="13" ry="13.5" fill="#fff" stroke={INK} strokeWidth="1.5" />
      <circle cx="21" cy="19" r="6.5" fill={INK} />
      <circle cx="53" cy="19" r="6.5" fill={INK} />
      <path d="M2.5 15 A13.5 13.5 0 0 1 29.5 15 Z" fill={COAT} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M34.5 15 A13.5 13.5 0 0 1 61.5 15 Z" fill={COAT} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
