"use client";

import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
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
  remainingCount?: number;
  onSkip: () => void;
  onCancelRemaining: () => void;
  onCancelAll: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
};

type AspectPreset = {
  id: string;
  label: string;
  aspect?: number;
};

const ASPECT_PRESETS: AspectPreset[] = [
  { id: "free", label: "자유" },
  { id: "1:1", label: "1:1", aspect: 1 },
  { id: "4:3", label: "4:3", aspect: 4 / 3 },
  { id: "3:4", label: "3:4", aspect: 3 / 4 },
  { id: "3:2", label: "3:2", aspect: 3 / 2 },
  { id: "2:3", label: "2:3", aspect: 2 / 3 },
  { id: "16:9", label: "16:9", aspect: 16 / 9 },
  { id: "9:16", label: "9:16", aspect: 9 / 16 },
];

function fullCrop(): Crop {
  return { unit: "%", x: 0, y: 0, width: 100, height: 100 };
}

function gcd(a: number, b: number): number {
  let x = Math.round(Math.abs(a));
  let y = Math.round(Math.abs(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function ratioLabelFromSize(width: number, height: number): string {
  if (!width || !height) return "—";
  const g = gcd(width, height);
  const w = Math.round(width / g);
  const h = Math.round(height / g);
  // 너무 큰 수는 소수로
  if (w > 50 || h > 50) {
    return `${(width / height).toFixed(2)}:1`;
  }
  return `${w}:${h}`;
}

export function ImageCropModal({
  imageSrc,
  remainingCount = 1,
  onSkip,
  onCancelRemaining,
  onCancelAll,
  onConfirm,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState(imageSrc);
  const [crop, setCrop] = useState<Crop>(fullCrop);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectId, setAspectId] = useState("free");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const extraUrls = useRef<string[]>([]);

  const aspect = ASPECT_PRESETS.find((p) => p.id === aspectId)?.aspect;

  useEffect(() => {
    return () => {
      for (const url of extraUrls.current) URL.revokeObjectURL(url);
    };
  }, []);

  function setCropOnImage(image: HTMLImageElement, next: Crop) {
    setCrop(next);
    setCompletedCrop(convertToPixelCrop(next, image.width, image.height));
  }

  function resetToFull(image: HTMLImageElement) {
    setAspectId("free");
    setCropOnImage(image, fullCrop());
  }

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    resetToFull(e.currentTarget);
  }

  useEffect(() => {
    const image = imgRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      resetToFull(image);
    }
    // src 바뀔 때(회전 포함) 전체 선택으로 초기화
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  function applyAspectPreset(preset: AspectPreset) {
    const image = imgRef.current;
    if (!image?.width || !image?.height) return;

    setAspectId(preset.id);
    setError("");

    if (!preset.aspect) {
      setCropOnImage(image, fullCrop());
      return;
    }

    const next = centerCrop(
      makeAspectCrop(
        { unit: "%", width: 100 },
        preset.aspect,
        image.width,
        image.height,
      ),
      image.width,
      image.height,
    );
    setCropOnImage(image, next);
  }

  const displayRatio = useMemo(() => {
    const preset = ASPECT_PRESETS.find((p) => p.id === aspectId);
    if (preset && preset.aspect) return preset.label;

    const image = imgRef.current;
    const px =
      completedCrop?.width && completedCrop?.height
        ? completedCrop
        : crop && image
          ? convertToPixelCrop(crop, image.width, image.height)
          : null;
    if (!px?.width || !px?.height) return "자유";
    return ratioLabelFromSize(px.width, px.height);
  }, [aspectId, completedCrop, crop]);

  async function rotate(direction: "left" | "right") {
    setBusy(true);
    setError("");
    try {
      const next = await rotateImageSrc(src, direction);
      if (src !== imageSrc) extraUrls.current.push(src);
      extraUrls.current.push(next);
      setSrc(next);
      setCompletedCrop(undefined);
      setCrop(fullCrop());
      setAspectId("free");
    } catch (e) {
      setError(e instanceof Error ? e.message : "회전 실패");
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    const image = imgRef.current;
    if (!image || !image.naturalWidth || !image.naturalHeight) {
      setError("이미지를 불러오지 못했습니다. 다른 파일로 다시 시도해 주세요.");
      return;
    }

    const pixelCrop =
      completedCrop?.width && completedCrop?.height
        ? completedCrop
        : convertToPixelCrop(crop ?? fullCrop(), image.width, image.height);

    if (!pixelCrop.width || !pixelCrop.height) {
      setError("자를 영역을 선택해 주세요.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const blob = await getCroppedImageBlob(image, pixelCrop);
      await onConfirm(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "자르기/업로드 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-crop-overlay" role="dialog" aria-modal="true" aria-label="이미지 자르기">
      <div className="admin-crop-modal">
        <div className="admin-crop-header">
          <p className="admin-crop-progress">
            {remainingCount > 1
              ? `남은 ${remainingCount}장`
              : "이미지 자르기"}
          </p>
          <div className="admin-crop-ratio" aria-live="polite">
            <span className="admin-crop-ratio__label">비율</span>
            <strong className="admin-crop-ratio__value">{displayRatio}</strong>
          </div>
          <div className="admin-crop-header__actions">
            <button
              type="button"
              className="btn btn-ghost admin-crop-header__btn"
              disabled={busy}
              onClick={onCancelRemaining}
            >
              남은 사진 취소
            </button>
            <button
              type="button"
              className="btn btn-ghost admin-crop-header__btn"
              disabled={busy}
              onClick={onCancelAll}
            >
              전체 취소
            </button>
          </div>
        </div>

        <div className="admin-crop-stage admin-crop-stage--scroll">
          <ReactCrop
            crop={crop}
            aspect={aspect}
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
              onError={() => setError("이미지를 표시할 수 없습니다. jpg/png/webp/gif로 올려 주세요.")}
              style={{ maxWidth: "100%", maxHeight: "min(52vh, 420px)", display: "block" }}
            />
          </ReactCrop>
        </div>

        <div className="admin-crop-aspects" role="group" aria-label="자르기 비율">
          {ASPECT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`btn admin-crop-aspect${aspectId === preset.id ? " btn-dark is-active" : " btn-ghost"}`}
              disabled={busy}
              onClick={() => applyAspectPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="admin-crop-toolbar">
          <div className="admin-crop-actions">
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => rotate("left")}>
              왼쪽 회전
            </button>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => rotate("right")}>
              오른쪽 회전
            </button>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={onSkip}>
              취소
            </button>
            <button type="button" className="btn btn-dark" disabled={busy} onClick={apply}>
              {busy
                ? "처리 중…"
                : remainingCount > 1
                  ? "자르고 다음"
                  : "자르고 업로드"}
            </button>
          </div>
        </div>

        <p className="admin-crop-hint">
          처음에는 이미지 전체입니다. 하단 비율을 누르면 고정되고, 자유는 비율 없이 자를 수 있습니다.
        </p>
        {error && <p className="admin-crop-error">{error}</p>}
      </div>
    </div>
  );
}
