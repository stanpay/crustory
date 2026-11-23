import Link from "next/link";

type Props = {
  productName: string;
};

export function ProductInquiry({ productName }: Props) {
  const href = `/contact?subject=${encodeURIComponent(`${productName} 문의`)}`;
  return (
    <div className="panel" style={{ marginTop: "1.25rem", padding: "1.25rem" }}>
      <p className="muted" style={{ marginBottom: "1rem" }}>
        지금은 온라인 주문을 받지 않아요. 궁금한 점이 있으면 문의해 주세요.
      </p>
      <Link href={href} className="btn btn-dark btn-block">
        문의하기
      </Link>
    </div>
  );
}
