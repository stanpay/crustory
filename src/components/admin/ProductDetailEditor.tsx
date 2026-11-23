"use client";

import { useId, useRef } from "react";

type Props = {
  html: string;
  css: string;
  onHtmlChange: (html: string) => void;
  onCssChange: (css: string) => void;
};

function readTextFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsText(file, "utf-8");
  });
}

export function ProductDetailEditor({
  html,
  css,
  onHtmlChange,
  onCssChange,
}: Props) {
  const htmlId = useId();
  const cssId = useId();
  const htmlFileRef = useRef<HTMLInputElement>(null);
  const cssFileRef = useRef<HTMLInputElement>(null);

  async function onPickHtml(file: File | null) {
    if (!file) return;
    if (!/\.(html?|txt)$/i.test(file.name) && file.type && !file.type.includes("html") && file.type !== "text/plain") {
      alert("HTML 또는 텍스트 파일을 선택해 주세요.");
      return;
    }
    try {
      onHtmlChange(await readTextFile(file));
    } catch (e) {
      alert(e instanceof Error ? e.message : "파일 읽기 실패");
    }
  }

  async function onPickCss(file: File | null) {
    if (!file) return;
    if (!/\.css$/i.test(file.name) && file.type && file.type !== "text/css") {
      alert("CSS 파일을 선택해 주세요.");
      return;
    }
    try {
      onCssChange(await readTextFile(file));
    } catch (e) {
      alert(e instanceof Error ? e.message : "파일 읽기 실패");
    }
  }

  return (
    <div className="admin-detail-editor">
      <div className="admin-detail-editor__head">
        <div>
          <h2 className="admin-detail-editor__title">상세 페이지 (HTML / CSS)</h2>
          <p className="admin-detail-editor__hint">
            일반 쇼핑몰의 상세 이미지 영역 대신, HTML·CSS를 직접 작성하거나 파일을 불러올 수 있습니다.
            CSS는 이 상품 상세 영역 안에서만 적용됩니다.
          </p>
        </div>
      </div>

      <div className="admin-detail-editor__grid">
        <div className="form-field">
          <div className="admin-detail-editor__label-row">
            <label htmlFor={htmlId}>HTML</label>
            <div className="admin-detail-editor__file-actions">
              <input
                ref={htmlFileRef}
                type="file"
                accept=".html,.htm,.txt,text/html,text/plain"
                hidden
                onChange={(e) => {
                  void onPickHtml(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => htmlFileRef.current?.click()}
              >
                HTML 파일 불러오기
              </button>
            </div>
          </div>
          <textarea
            id={htmlId}
            className="admin-detail-editor__code"
            rows={14}
            spellCheck={false}
            value={html}
            onChange={(e) => onHtmlChange(e.target.value)}
            placeholder={'<section class="story">\n  <h2>상품 이야기</h2>\n  <p>...</p>\n</section>'}
          />
        </div>

        <div className="form-field">
          <div className="admin-detail-editor__label-row">
            <label htmlFor={cssId}>CSS</label>
            <div className="admin-detail-editor__file-actions">
              <input
                ref={cssFileRef}
                type="file"
                accept=".css,text/css"
                hidden
                onChange={(e) => {
                  void onPickCss(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => cssFileRef.current?.click()}
              >
                CSS 파일 불러오기
              </button>
            </div>
          </div>
          <textarea
            id={cssId}
            className="admin-detail-editor__code"
            rows={14}
            spellCheck={false}
            value={css}
            onChange={(e) => onCssChange(e.target.value)}
            placeholder={".story {\n  padding: 2rem 0;\n}\n.story h2 {\n  font-size: 1.5rem;\n}"}
          />
        </div>
      </div>
    </div>
  );
}
