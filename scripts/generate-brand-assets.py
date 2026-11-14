#!/usr/bin/env python3
"""Regenerate crustory logo / favicon / download pack from Pretendard ExtraBold."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "brand" / "download"
APP = ROOT / "src" / "app"
BRAND = ROOT / "public" / "brand"

FONT = Path.home() / "Library/Fonts/Pretendard-ExtraBold.otf"
INK = (30, 27, 23, 255)  # #1e1b17
PAPER = (243, 240, 232, 255)  # #f3f0e8
TRANSPARENT = (0, 0, 0, 0)
TEXT = "crustory"
TRACKING = -0.055


def load_font(size: float) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT), size)


def measure(text: str, font: ImageFont.FreeTypeFont, tracking: float = TRACKING):
    chars = []
    x = 0.0
    for i, ch in enumerate(text):
        bbox = font.getbbox(ch)
        w = bbox[2] - bbox[0]
        chars.append((ch, x - bbox[0], w, bbox))
        adv = w
        if i < len(text) - 1:
            adv += tracking * font.size
        x += adv
    full = font.getbbox(text)
    return chars, x, full[3] - full[1], full[1]


def fit_font(max_w: float, max_h: float, text: str = TEXT) -> ImageFont.FreeTypeFont:
    lo, hi = 8.0, max(max_w, max_h)
    best = load_font(lo)
    for _ in range(40):
        mid = (lo + hi) / 2
        font = load_font(mid)
        _, tw, th, _ = measure(text, font)
        if tw <= max_w and th <= max_h:
            best = font
            lo = mid
        else:
            hi = mid
    return best


def draw_wordmark(draw: ImageDraw.ImageDraw, cx: float, cy: float, font, fill, text: str = TEXT):
    chars, tw, th, y0 = measure(text, font)
    start_x = cx - tw / 2
    start_y = cy - (y0 + th / 2)
    for ch, ox, _w, _bbox in chars:
        draw.text((start_x + ox, start_y), ch, font=font, fill=fill)


def render_centered(w: int, h: int, bg, pad_ratio: float, ink=INK, text: str = TEXT) -> Image.Image:
    img = Image.new("RGBA", (w, h), bg)
    draw = ImageDraw.Draw(img)
    font = fit_font(w - 2 * w * pad_ratio, h - 2 * h * pad_ratio, text=text)
    draw_wordmark(draw, w / 2, h / 2, font, ink, text=text)
    return img


def monogram(size: int, pad_ratio: float = 0.18) -> Image.Image:
    return render_centered(size, size, PAPER, pad_ratio, text="c")


def main() -> None:
    if not FONT.exists():
        raise SystemExit(f"Missing font: {FONT}")

    OUT.mkdir(parents=True, exist_ok=True)
    BRAND.mkdir(parents=True, exist_ok=True)

    assets = [
        (512, 512, PAPER, "crustory-1x1-512.png", 0.20, INK),
        (1024, 1024, PAPER, "crustory-1x1-1024.png", 0.20, INK),
        (2048, 2048, PAPER, "crustory-1x1-2048.png", 0.20, INK),
        (1024, 1024, INK, "crustory-1x1-1024-inverted.png", 0.20, PAPER),
        (1200, 900, PAPER, "crustory-4x3-1200x900.png", 0.22, INK),
        (1600, 1200, PAPER, "crustory-4x3-1600x1200.png", 0.22, INK),
        (900, 1200, PAPER, "crustory-3x4-900x1200.png", 0.22, INK),
        (1920, 1080, PAPER, "crustory-16x9-1920x1080.png", 0.28, INK),
        (1280, 720, PAPER, "crustory-16x9-1280x720.png", 0.28, INK),
        (1200, 630, PAPER, "crustory-og-1200x630.png", 0.30, INK),
        (1600, 400, TRANSPARENT, "crustory-wordmark-transparent-1600x400.png", 0.06, INK),
        (2400, 600, TRANSPARENT, "crustory-wordmark-transparent-2400x600.png", 0.06, INK),
    ]

    for w, h, bg, name, pad, ink in assets:
        img = render_centered(w, h, bg, pad, ink=ink)
        img.save(OUT / name, optimize=True)
        print("wrote", OUT / name)

    for s, name in [(16, "crustory-favicon-16.png"), (32, "crustory-favicon-32.png"), (48, "crustory-favicon-48.png")]:
        monogram(s, 0.16 if s >= 32 else 0.14).save(OUT / name, optimize=True)

    monogram(512).save(OUT / "crustory-mark-1x1-512.png", optimize=True)
    monogram(1024).save(OUT / "crustory-mark-1x1-1024.png", optimize=True)

    icon_180 = render_centered(180, 180, PAPER, 0.18)
    icon_192 = render_centered(192, 192, PAPER, 0.18)
    icon_512 = render_centered(512, 512, PAPER, 0.18)
    icon_180.save(OUT / "crustory-apple-180.png", optimize=True)
    icon_192.save(OUT / "crustory-pwa-192.png", optimize=True)
    icon_512.save(OUT / "crustory-pwa-512.png", optimize=True)
    icon_512.save(BRAND / "logo-1x1.png", optimize=True)
    render_centered(1600, 400, TRANSPARENT, 0.06).save(BRAND / "wordmark.png", optimize=True)

    monogram(32).save(APP / "icon.png")
    icon_180.save(APP / "apple-icon.png")
    og = render_centered(1200, 630, PAPER, 0.30)
    og.save(APP / "opengraph-image.png")
    og.save(APP / "twitter-image.png")

    icos = [monogram(16), monogram(32), monogram(48)]
    icos[0].save(
        APP / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=icos[1:],
    )
    print("updated app icons + download pack")


if __name__ == "__main__":
    main()
