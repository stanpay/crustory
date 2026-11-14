"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImageCropModal } from "@/components/admin/ImageCropModal";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
};

export function ProductImageField({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draftSrc, setDraftSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  function openPicker() {
    inputRef.current?.click();
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMsg("이미지 파일만 선택할 수 있습니다.");
      return;
    }
    const url = URL.createObjectURL(file);
    setDraftSrc(url);
    setMsg("");
  }

  function closeCrop() {
    if (draftSrc) URL.revokeObjectURL(draftSrc);
    setDraftSrc(null);
  }

  async function uploadCropped(blob: Blob) {
    setUploading(true);
    setMsg("");
    try {
      const formData = new FormData();
      formData.append("file", blob, `product-${Date.now()}.jpg`);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "업로드 실패");
      onChange([...images, data.url as string]);
      closeCrop();
      setMsg("업로드됨");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "업로드 실패");
      throw e;
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= images.length) return;
    const copy = [...images];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    onChange(copy);
  }

  return (
    <div className="form-field">
      <label>상품 이미지</label>

      <div className="admin-image-grid">
        {images.map((src, index) => (
          <div key={`${src}-${index}`} className="admin-image-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
            <div className="admin-image-card__actions">
              <button type="button" className="btn btn-ghost" onClick={() => move(index, -1)} disabled={index === 0}>
                ←
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => move(index, 1)}
                disabled={index === images.length - 1}
              >
                →
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => removeAt(index)}>
                삭제
              </button>
            </div>
            <p className="admin-image-card__path">{src}</p>
          </div>
        ))}

        <button
          type="button"
          className="admin-image-add"
          onClick={openPicker}
          disabled={uploading}
        >
          <span>사진 업로드</span>
          <small>자르기 · 회전 후 등록</small>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={onFileChange}
      />

      {msg && <p style={{ marginTop: 8, fontSize: "0.85rem" }}>{msg}</p>}

      {draftSrc && (
        <ImageCropModal imageSrc={draftSrc} onCancel={closeCrop} onConfirm={uploadCropped} />
      )}
    </div>
  );
}
