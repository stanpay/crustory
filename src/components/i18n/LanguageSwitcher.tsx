"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`hd__lang${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="hd__lang-btn"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={t("changeLanguage")}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="hd__lang-code">{LOCALE_SHORT[locale]}</span>
        <span className="hd__lang-caret" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          className="hd__lang-menu"
          role="listbox"
          aria-label={t("language")}
        >
          {LOCALES.map((code) => (
            <li key={code} role="option" aria-selected={code === locale}>
              <button
                type="button"
                className={`hd__lang-option${code === locale ? " is-active" : ""}`}
                onClick={() => {
                  setLocale(code);
                  setOpen(false);
                }}
              >
                <span className="hd__lang-option-code">{LOCALE_SHORT[code]}</span>
                <span>{LOCALE_LABELS[code]}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
