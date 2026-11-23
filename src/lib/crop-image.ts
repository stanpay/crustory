import type { PixelCrop } from "react-image-crop";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

/** Rotate 90° clockwise or counter-clockwise; returns a new object URL. */
export async function rotateImageSrc(
  src: string,
  direction: "left" | "right",
): Promise<string> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas를 사용할 수 없습니다.");

  canvas.width = image.height;
  canvas.height = image.width;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(direction === "right" ? Math.PI / 2 : -Math.PI / 2);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("회전 실패"));
          return;
        }
        resolve(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.97,
    );
  });
}

/** Crop displayed image using pixel crop (free aspect). */
export async function getCroppedImageBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
  mimeType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
  quality = 0.97,
): Promise<Blob> {
  if (!crop.width || !crop.height) {
    throw new Error("자를 영역을 선택해 주세요.");
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas를 사용할 수 없습니다.");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const pixelWidth = Math.max(1, Math.round(crop.width * scaleX));
  const pixelHeight = Math.max(1, Math.round(crop.height * scaleY));

  canvas.width = pixelWidth;
  canvas.height = pixelHeight;

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    Math.round(crop.x * scaleX),
    Math.round(crop.y * scaleY),
    pixelWidth,
    pixelHeight,
    0,
    0,
    pixelWidth,
    pixelHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("이미지 변환 실패"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}
