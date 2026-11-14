/** 홈·브랜드 페이지용 단순 일러스트. 실제 사진이 들어오면 교체한다. */

export function PizzaArt() {
  return (
    <svg viewBox="0 0 240 240" aria-hidden>
      <circle cx="120" cy="120" r="104" fill="#C98A3A" />
      <circle cx="120" cy="120" r="88" fill="#F2C266" />
      <circle cx="120" cy="120" r="88" fill="none" stroke="#E2A94C" strokeWidth="6" strokeDasharray="2 14" />
      {[
        [86, 84, 13],
        [150, 92, 12],
        [104, 150, 14],
        [160, 148, 11],
        [124, 112, 9],
      ].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#C62828" />
      ))}
      {[
        [70, 120],
        [136, 66],
        [178, 122],
        [130, 176],
      ].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="9" ry="4.5" fill="#4E8F47" transform={`rotate(-30 ${x} ${y})`} />
      ))}
      <path d="M120 120 L224 120 A104 104 0 0 1 172 210 Z" fill="#F3F0E8" opacity=".9" />
      <text x="190" y="152" fontFamily="Pretendard, sans-serif" fontWeight="800" fontSize="20" fill="#1E1B17">8&quot;</text>
    </svg>
  );
}

export function NotebookArt() {
  return (
    <svg viewBox="0 0 240 240" aria-hidden>
      <rect x="58" y="34" width="132" height="176" fill="#FBF8F1" transform="rotate(4 120 120)" />
      <rect x="50" y="30" width="132" height="176" fill="#FBF8F1" stroke="#D8D1C3" />
      {[62, 80, 98, 116, 134, 152, 170].map((y) => (
        <line key={y} x1="64" x2="168" y1={y} y2={y} stroke="#E3DCCD" />
      ))}
      <path d="M68 74 q10-8 20 0 t20 0 t20 0" stroke="#1E1B17" strokeWidth="2" fill="none" />
      <path d="M68 92 q12-6 24 0 t24 0" stroke="#1E1B17" strokeWidth="2" fill="none" />
      <path d="M68 128 q8-6 16 0 t16 0 t16 0 t16 0" stroke="#1E1B17" strokeWidth="2" fill="none" />
      <text x="70" y="186" fontFamily="Pretendard, sans-serif" fontWeight="700" fontSize="13" fill="#C62828">
        interview no.120
      </text>
      <rect x="150" y="18" width="14" height="44" fill="#C62828" />
    </svg>
  );
}
