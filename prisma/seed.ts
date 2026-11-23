import { PrismaClient, SaleType } from "@prisma/client";

const prisma = new PrismaClient();

const DETAIL_CSS = `.note-band{background:#1e1b17;color:#f3f0e8;padding:2.5rem 0}.note-band__inner{max-width:720px;margin:0 auto;padding:0 1.25rem}.note-band blockquote{margin:0;font-size:1.15rem;line-height:1.7;font-weight:600;letter-spacing:-0.02em}.note-band cite{display:block;margin-top:0.85rem;font-size:0.85rem;font-style:normal;opacity:0.7}`;

function detailFromNote(note: string) {
  return {
    runieNote: note,
    detailHtml: `<section class="note-band"><div class="note-band__inner"><blockquote>“${note}”<cite>— 러니, 은퇴한 제주 경주마</cite></blockquote></div></section>`,
    detailCss: DETAIL_CSS,
  };
}

const products = [
  {
    name: "러니 플러시 키링",
    slug: "runie-plush-keyring",
    description:
      "혼행의 동반자 러니를 가방에 달아보세요. 부드러운 플러시 소재의 미니 키링입니다.",
    ...detailFromNote("가방에 매달려 다니는 것도 나쁘지 않아. 뛰지 않아도 되니까."),
    price: 18000,
    stock: 50,
    images: JSON.stringify(["/products/plush-keyring.svg"]),
    saleType: SaleType.NORMAL,
    category: "goods",
    featured: true,
    options: JSON.stringify([{ name: "색상", values: ["크림", "러스트"] }]),
  },
  {
    name: "러니 아크릴 키링",
    slug: "runie-acrylic-keyring",
    description:
      "선명한 일러스트가 돋보이는 아크릴 키링. 가볍고 내구성이 좋습니다.",
    ...detailFromNote("투명해서 좋아. 숨길 게 없거든. 원래 별로 없지만."),
    price: 12000,
    stock: 80,
    images: JSON.stringify(["/products/acrylic-keyring.svg"]),
    saleType: SaleType.NORMAL,
    category: "goods",
    featured: true,
    options: JSON.stringify([{ name: "디자인", values: ["기본", "제주"] }]),
  },
  {
    name: "러니 스티커 팩",
    slug: "runie-sticker-pack",
    description:
      "여행 노트와 캐리어에 붙이는 러니 스티커 6종 세트.",
    ...detailFromNote("아무 데나 붙여. 거기가 오늘의 결승선 아닌 곳이야."),
    price: 6000,
    stock: 120,
    images: JSON.stringify(["/products/sticker.svg"]),
    saleType: SaleType.NORMAL,
    category: "goods",
    featured: true,
    options: JSON.stringify([]),
  },
  {
    name: "러니 엽서 세트",
    slug: "runie-postcard-set",
    description:
      "제주 풍경과 러니가 담긴 엽서 4장 세트. 혼자 떠난 여행의 기록을 남겨보세요.",
    ...detailFromNote("보내도 되고, 안 보내도 돼. 써 두는 것만으로 충분할 때도 있어."),
    price: 9000,
    stock: 60,
    images: JSON.stringify(["/products/postcard.svg"]),
    saleType: SaleType.NORMAL,
    category: "goods",
    featured: false,
    options: JSON.stringify([]),
  },
  {
    name: "러니 여행노트",
    slug: "runie-travel-notebook",
    description:
      "혼행 기록을 위한 A5 노트. ‘여긴 결승선 없어’ 메시지가 표지에 새겨져 있습니다.",
    ...detailFromNote("빈칸이 많아도 괜찮아. 여긴 결승선 없어."),
    price: 15000,
    stock: 40,
    images: JSON.stringify(["/products/notebook.svg"]),
    saleType: SaleType.PREORDER,
    category: "goods",
    featured: true,
    options: JSON.stringify([{ name: "커버", values: ["레드", "차콜"] }]),
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.contactMessage.deleteMany();
  // AdminUser는 Supabase에서 관리 — 시드가 지우지 않음

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  await prisma.notice.create({
    data: {
      title: "러니 여행노트 예약판매 중 · 5만원 이상 무료배송 · [보러 가기](/shop?type=PREORDER)",
      body: "",
      linkHref: null,
      linkLabel: null,
      active: true,
    },
  });

  console.log("Seed completed:", products.length, "products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
