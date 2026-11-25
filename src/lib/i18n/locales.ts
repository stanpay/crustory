export const LOCALES = ["ko", "en", "zh", "ja"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = "crustory-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  zh: "中文",
  ja: "日本語",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  ko: "KO",
  en: "EN",
  zh: "ZH",
  ja: "JA",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** Accept-Language / navigator.language → 지원 로케일. 그 외는 en */
export function resolveLocaleFromLanguageTag(tag: string | null | undefined): Locale {
  if (!tag) return "en";
  const base = tag.trim().toLowerCase().split("-")[0];
  if (base === "ko") return "ko";
  if (base === "en") return "en";
  if (base === "zh") return "zh";
  if (base === "ja") return "ja";
  return "en";
}

export function parseAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return "en";

  const candidates = header
    .split(",")
    .map((part) => {
      const [rawTag, rawQ] = part.trim().split(";q=");
      const q = rawQ ? Number.parseFloat(rawQ) : 1;
      return { tag: rawTag?.trim() ?? "", q: Number.isFinite(q) ? q : 0 };
    })
    .filter((c) => c.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of candidates) {
    const locale = resolveLocaleFromLanguageTag(tag);
    const base = tag.toLowerCase().split("-")[0];
    if (base === "ko" || base === "en" || base === "zh" || base === "ja") {
      return locale;
    }
  }

  return "en";
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const tags =
    Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  for (const tag of tags) {
    const base = tag?.toLowerCase().split("-")[0];
    if (base === "ko" || base === "en" || base === "zh" || base === "ja") {
      return resolveLocaleFromLanguageTag(tag);
    }
  }

  return "en";
}
