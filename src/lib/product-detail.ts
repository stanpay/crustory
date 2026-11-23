const SCRIPT_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_ATTR_RE = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

/** Admin HTML은 허용하되 script / 인라인 이벤트는 제거 */
export function sanitizeDetailHtml(html: string) {
  return html.replace(SCRIPT_RE, "").replace(EVENT_ATTR_RE, "").trim();
}

/**
 * 상세 CSS를 `.pdp-custom-detail` 안으로 스코프해 사이트 전체를 깨지 않게 한다.
 * @media / @keyframes 등은 블록 단위로 재귀 처리한다.
 */
export function scopeDetailCss(css: string, scope = ".pdp-custom-detail") {
  const input = css.trim();
  if (!input) return "";

  let i = 0;
  let out = "";

  function skipWs() {
    while (i < input.length && /\s/.test(input[i]!)) i += 1;
  }

  function readUntil(char: string) {
    let buf = "";
    while (i < input.length && input[i] !== char) {
      buf += input[i];
      i += 1;
    }
    return buf;
  }

  function scopeSelectors(raw: string) {
    return raw
      .split(",")
      .map((part) => {
        const s = part.trim();
        if (!s) return s;
        if (s.startsWith(scope)) return s;
        if (s === "body" || s === "html" || s === ":root") return scope;
        if (s.startsWith("&")) return `${scope}${s.slice(1)}`;
        return `${scope} ${s}`;
      })
      .filter(Boolean)
      .join(", ");
  }

  function parseBlock(): string {
    let result = "";
    while (i < input.length) {
      skipWs();
      if (i >= input.length) break;
      if (input[i] === "}") {
        i += 1;
        break;
      }

      if (input[i] === "/" && input[i + 1] === "*") {
        i += 2;
        while (i < input.length && !(input[i] === "*" && input[i + 1] === "/")) i += 1;
        i += 2;
        continue;
      }

      if (input[i] === "@") {
        const prelude = readUntil("{").trim();
        if (input[i] === "{") i += 1;
        const isNesting =
          prelude.startsWith("@media") ||
          prelude.startsWith("@supports") ||
          prelude.startsWith("@layer") ||
          prelude.startsWith("@container");
        if (isNesting) {
          result += `${prelude} {${parseBlock()}}`;
        } else {
          const body = readUntil("}");
          if (input[i] === "}") i += 1;
          result += `${prelude} {${body}}`;
        }
        continue;
      }

      const selectors = readUntil("{").trim();
      if (input[i] === "{") i += 1;
      const body = readUntil("}");
      if (input[i] === "}") i += 1;
      if (!selectors) continue;
      result += `${scopeSelectors(selectors)} {${body}}`;
    }
    return result;
  }

  out = parseBlock();
  return out;
}

export function hasDetailContent(html: string) {
  return sanitizeDetailHtml(html).length > 0;
}
