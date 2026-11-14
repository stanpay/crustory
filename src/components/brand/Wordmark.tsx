type WordmarkProps = {
  className?: string;
  /** When parent already has an accessible name, hide decorative SVG. */
  decorative?: boolean;
};

/** Centered crustory wordmark SVG — parent keeps `.wordmark` for sizing/color. */
export function Wordmark({ className = "wordmark__svg", decorative = true }: WordmarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : "img"}
      focusable="false"
    >
      {!decorative && <title>crustory</title>}
      <text
        className="wordmark__text"
        x="110"
        y="20"
        textAnchor="middle"
        dominantBaseline="central"
      >
        crustory
      </text>
    </svg>
  );
}
