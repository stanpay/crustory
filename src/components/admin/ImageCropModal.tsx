"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { getCroppedImageBlob, rotateImageSrc } from "@/lib/crop-image";

type Props = {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
};

function initialCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, width / height, width, height),
    width,
    height,
  );
}

export function ImageCropModal({ imageSrc, onCancel, onConfirm }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState(imageSrc);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const extraUrls = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      for (const url of extraUrls.current) URL.revokeObjectURL(url);
    };
  }, []);

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(initialCrop(width, height));
  }

  async function rotate(direction: "left" | "right") {
    setBusy(true);
    setError("");
    try {
      const next = await rotateImageSrc(src, direction);
      if (src !== imageSrc) extraUrls.current.push(src);
      extraUrls.current.push(next);
      setSrc(next);
      setCompletedCrop(undefined);
      setCrop(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "회전 실패");
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    const image = imgRef.current;
    const pixelCrop =
      completedCrop?.width && completedCrop?.height
        ? completedCrop
        : crop
          ? convertToPixelCrop(crop, image?.width || 0, image?.height || 0)
          : undefined;

    if (!image || !pixelCrop?.width || !pixelCrop?.height) {
      setError("자를 영역을 선택해 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const blob = await getCroppedImageBlob(image, pixelCrop);
      await onConfirm(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "자르기 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-crop-overlay" role="dialog" aria-modal="true" aria-label="이미지 자르기">
      <div className="admin-crop-modal">
        <div className="admin-crop-stage admin-crop-stage--scroll">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            keepSelection
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="자를 이미지"
              onLoad={onImageLoad}
              style={{ maxWidth: "100%", maxHeight: "min(52vh, 420px)", display: "block" }}
            />
          </ReactCrop>
        </div>

        <div className="admin-crop-toolbar">
          <div className="admin-crop-actions">
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => rotate("left")}>
              왼쪽 회전
            </button>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => rotate("right")}>
              오른쪽 회전
            </button>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={onCancel}>
              취소
            </button>
            <button type="button" className="btn btn-dark" disabled={busy} onClick={apply}>
              {busy ? "처리 중…" : "자르고 업로드"}
            </button>
          </div>
        </div>

        <p className="admin-crop-hint">
          모서리를 드래그해 자율 비율로 자르고, 회전 버튼으로 방향을 맞춘 뒤 업로드하세요.
        </p>
        {error && <p className="admin-crop-error">{error}</p>}
      </div>
    </div>
  );
}
