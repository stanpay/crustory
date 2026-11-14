import { PrismaClient, SaleType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    name: "러니 플러시 키링",
    slug: "runie-plush-keyring",
    description:
      "혼행의 동반자 러니를 가방에 달아보세요. 부드러운 플러시 소재의 미니 키링입니다.",
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
  await prisma.adminUser.deleteMany();
  await prisma.contactMessage.deleteMany();

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "crustoryadmin",
    8,
  );

  await prisma.adminUser.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@crustory.com",
      passwordHash,
      name: "CRUSTORY Admin",
    },
  });

  await prisma.notice.create({
    data: {
      title: "러니 여행노트 예약판매 오픈",
      body: "러니 여행노트 예약판매가 시작되었습니다. 순차 제작·발송됩니다.",
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
