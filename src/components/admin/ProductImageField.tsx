"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ImageCropModal } from "@/components/admin/ImageCropModal";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
};

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

function isAcceptableImageFile(file: File) {
  if (file.type.startsWith("image/")) {
    if (/heic|heif|avif|tiff|svg/i.test(file.type)) {
      return { ok: false as const, reason: "jpg, png, webp, gif만 업로드할 수 있습니다." };
    }
    return { ok: true as const };
  }
  if (!file.type && IMAGE_EXT.test(file.name)) {
    return { ok: true as const };
  }
  return { ok: false as const, reason: "이미지 파일만 선택할 수 있습니다. (jpg, png, webp, gif)" };
}

export function ProductImageField({ images, onChange }: Props) {
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const [draftSrc, setDraftSrc] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fileDragging, setFileDragging] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const draftRef = useRef<string | null>(null);
  const queueRef = useRef<string[]>([]);
  /** 이번 다중 업로드 세션에서 서버에 올린 URL */
  const sessionUploadedRef = useRef<string[]>([]);
  draftRef.current = draftSrc;
  queueRef.current = queue;

  useEffect(() => {
    return () => {
      if (draftRef.current) URL.revokeObjectURL(draftRef.current);
      for (const url of queueRef.current) URL.revokeObjectURL(url);
    };
  }, []);

  function enqueueFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (!files.length) return;

    const accepted: string[] = [];
    let rejected = 0;
    for (const file of files) {
      const check = isAcceptableImageFile(file);
      if (!check.ok) {
        rejected += 1;
        continue;
      }
      accepted.push(URL.createObjectURL(file));
    }

    if (!accepted.length) {
      setMsg(
        rejected
          ? "선택한 파일을 올릴 수 없습니다. (jpg, png, webp, gif)"
          : "이미지 파일만 선택할 수 있습니다.",
      );
      return;
    }

    setMsg(
      rejected
        ? `${accepted.length}장 준비 · ${rejected}장은 형식이 맞지 않아 제외`
        : accepted.length > 1
          ? `${accepted.length}장 선택됨 · 순서대로 자르기 후 업로드`
          : "",
    );

    if (!draftSrc) {
      sessionUploadedRef.current = [];
      setDraftSrc(accepted[0]);
      setQueue(accepted.slice(1));
    } else {
      setQueue((prev) => [...prev, ...accepted]);
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    e.target.value = "";
    if (files?.length) enqueueFiles(files);
  }

  function onFileDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (reorderMode || uploading) return;
    dragDepth.current += 1;
    setFileDragging(true);
  }

  function onFileDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!reorderMode && !uploading) setFileDragging(true);
  }

  function onFileDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setFileDragging(false);
  }

  function onFileDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setFileDragging(false);
    if (reorderMode || uploading) return;
    if (e.dataTransfer.files?.length) enqueueFiles(e.dataTransfer.files);
  }

  function advanceQueue(revokeCurrent: boolean) {
    if (revokeCurrent && draftSrc) URL.revokeObjectURL(draftSrc);
    setQueue((prev) => {
      if (prev.length === 0) {
        setDraftSrc(null);
        return prev;
      }
      const [next, ...rest] = prev;
      setDraftSrc(next);
      return rest;
    });
  }

  /** 현재 장만 건너뛰기 → 다음 장으로 */
  function skipCurrent() {
    const remaining = queue.length;
    advanceQueue(true);
    if (remaining > 0) {
      setMsg(`현재 장 취소 · 남은 ${remaining}장 계속`);
    } else {
      setMsg("현재 장을 취소했습니다.");
    }
  }

  /** 현재+대기열 중단, 이미 올린 장은 유지 */
  function cancelRemaining() {
    if (draftSrc) URL.revokeObjectURL(draftSrc);
    for (const url of queue) URL.revokeObjectURL(url);
    setDraftSrc(null);
    setQueue([]);
    setMsg("남은 사진 업로드를 취소했습니다.");
  }

  /** 대기열 중단 + 이번 세션 업로드분 목록에서 제거 */
  function cancelAll() {
    if (draftSrc) URL.revokeObjectURL(draftSrc);
    for (const url of queue) URL.revokeObjectURL(url);
    setDraftSrc(null);
    setQueue([]);

    const uploaded = new Set(sessionUploadedRef.current);
    if (uploaded.size > 0) {
      const next = imagesRef.current.filter((src) => !uploaded.has(src));
      imagesRef.current = next;
      onChange(next);
      sessionUploadedRef.current = [];
      setMsg("전체 취소 · 이번 업로드분을 목록에서 제거했습니다.");
    } else {
      sessionUploadedRef.current = [];
      setMsg("전체 취소했습니다.");
    }
  }

  async function uploadCropped(blob: Blob) {
    setUploading(true);
    setMsg("");
    try {
      const formData = new FormData();
      const type = blob.type && blob.type.startsWith("image/") ? blob.type : "image/jpeg";
      const file = new File([blob], `product-${Date.now()}.jpg`, { type });
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      let data: { url?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`업로드 실패 (${res.status})`);
      }
      if (!res.ok) throw new Error(data.error || `업로드 실패 (${res.status})`);
      if (!data.url) throw new Error("업로드 응답에 URL이 없습니다.");

      sessionUploadedRef.current = [...sessionUploadedRef.current, data.url];
      const nextImages = [...imagesRef.current, data.url];
      imagesRef.current = nextImages;
      onChange(nextImages);

      const remaining = queue.length;
      advanceQueue(true);

      if (remaining > 0) {
        setMsg(`업로드됨 · 남은 ${remaining}장 이어서 자르기`);
      } else {
        sessionUploadedRef.current = [];
        setMsg("업로드됨 · 아래 「수정 저장」을 눌러 DB에 반영하세요.");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "업로드 실패";
      setMsg(message);
      throw e;
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function onReorderDragStart(index: number, e: DragEvent<HTMLDivElement>) {
    if (!reorderMode) return;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function onReorderDragOver(index: number, e: DragEvent<HTMLDivElement>) {
    if (!reorderMode || dragIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIndex(index);
  }

  function onReorderDrop(index: number, e: DragEvent<HTMLDivElement>) {
    if (!reorderMode || dragIndex === null) return;
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex !== index) {
      const next = [...imagesRef.current];
      const [item] = next.splice(dragIndex, 1);
      next.splice(index, 0, item);
      imagesRef.current = next;
      onChange(next);
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  function onReorderDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  const queueTotal = (draftSrc ? 1 : 0) + queue.length;

  return (
    <div className="form-field">
      <div className="admin-image-field__head">
        <span className="admin-image-field__title">상품 이미지</span>
        <button
          type="button"
          className={`btn admin-image-field__reorder ${reorderMode ? "btn-dark" : "btn-ghost"}`}
          disabled={images.length < 2}
          onClick={() => {
            setReorderMode((v) => !v);
            setDragIndex(null);
            setOverIndex(null);
            setFileDragging(false);
          }}
        >
          {reorderMode ? "순서변경 완료" : "순서변경"}
        </button>
      </div>

      {reorderMode && (
        <p className="admin-image-field__hint">카드를 드래그해서 순서를 바꾸세요.</p>
      )}

      <div
        className={`admin-image-grid${fileDragging ? " is-file-dragging" : ""}${reorderMode ? " is-reorder" : ""}`}
        onDragEnter={onFileDragEnter}
        onDragOver={onFileDragOver}
        onDragLeave={onFileDragLeave}
        onDrop={onFileDrop}
      >
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className={[
              "admin-image-card",
              reorderMode ? "is-sortable" : "",
              dragIndex === index ? "is-dragging-card" : "",
              overIndex === index && dragIndex !== index ? "is-drop-target" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            draggable={reorderMode}
            onDragStart={(e) => onReorderDragStart(index, e)}
            onDragOver={(e) => onReorderDragOver(index, e)}
            onDrop={(e) => onReorderDrop(index, e)}
            onDragEnd={onReorderDragEnd}
          >
            {reorderMode && <span className="admin-image-card__grip" aria-hidden>⠿</span>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" draggable={false} />
            <div className="admin-image-card__actions">
              {!reorderMode && (
                <button type="button" className="btn btn-ghost" onClick={() => removeAt(index)}>
                  삭제
                </button>
              )}
              {reorderMode && <span className="admin-image-card__ord">{index + 1}</span>}
            </div>
            <p className="admin-image-card__path">{src}</p>
          </div>
        ))}

        {!reorderMode && (
          <button
            type="button"
            className={`admin-image-add${fileDragging ? " is-dragging" : ""}`}
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dragDepth.current = 0;
              setFileDragging(false);
              if (!uploading && e.dataTransfer.files?.length) enqueueFiles(e.dataTransfer.files);
            }}
          >
            <span>{uploading ? "업로드 중…" : "사진 업로드"}</span>
            <small>여러 장 선택 · 끌어다 놓기 · 자르기 · 회전</small>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        className="admin-image-add__input"
        disabled={uploading || reorderMode}
        multiple
        onChange={onFileChange}
        tabIndex={-1}
        aria-hidden
      />

      {msg && (
        <p
          className="admin-image-field__msg"
          style={{ color: msg.includes("업로드됨") || msg.includes("준비") || msg.includes("선택됨") ? "#2f6b3a" : "#b45309" }}
        >
          {msg}
        </p>
      )}

      {draftSrc && (
        <ImageCropModal
          key={draftSrc}
          imageSrc={draftSrc}
          remainingCount={queueTotal}
          onSkip={skipCurrent}
          onCancelRemaining={cancelRemaining}
          onCancelAll={cancelAll}
          onConfirm={uploadCropped}
        />
      )}
    </div>
  );
}
