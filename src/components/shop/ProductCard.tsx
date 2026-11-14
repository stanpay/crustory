import Link from "next/link";
import { formatPrice, parseImages } from "@/lib/format";

type Props = {
  slug: string;
  name: string;
  price: number;
  images: string;
  saleType: "NORMAL" | "PREORDER";
  stock?: number;
};

export function ProductCard({ slug, name, price, images, saleType, stock }: Props) {
  const image = parseImages(images)[0] || "/products/plush-keyring.svg";
  const soldOut = stock !== undefined && stock <= 0;

  return (
    <Link href={`/shop/${slug}`} className="product-card">
      <div className="product-card__image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" width={400} height={500} loading="lazy" />
        {soldOut ? (
          <span className="product-card__tag" style={{ color: "var(--ink-2)" }}>품절</span>
        ) : (
          saleType === "PREORDER" && <span className="product-card__tag">예약판매</span>
        )}
      </div>
      <h3 className="product-card__name">{name}</h3>
      <p className="product-card__price">{formatPrice(price)}</p>
    </Link>
  );
}
