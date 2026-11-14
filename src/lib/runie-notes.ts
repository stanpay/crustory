/**
 * 상품 상세 하단 "러니의 한마디" 편집 카피.
 * 상품 데이터(가격·재고)가 아닌 브랜드 문구라 슬러그 기준으로 관리한다.
 */
const notes: Record<string, string> = {
  "runie-plush-keyring": "가방에 매달려 다니는 것도 나쁘지 않아. 뛰지 않아도 되니까.",
  "runie-acrylic-keyring": "투명해서 좋아. 숨길 게 없거든. 원래 별로 없지만.",
  "runie-sticker-pack": "아무 데나 붙여. 거기가 오늘의 결승선 아닌 곳이야.",
  "runie-postcard-set": "보내도 되고, 안 보내도 돼. 써 두는 것만으로 충분할 때도 있어.",
  "runie-travel-notebook": "빈칸이 많아도 괜찮아. 여긴 결승선 없어.",
};

export function runieNote(slug: string) {
  return notes[slug] ?? "천천히 골라. 여긴 결승선 없어.";
}
