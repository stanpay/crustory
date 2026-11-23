import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseImages, parseOptions } from "@/lib/format";
import { ProductForm } from "@/components/admin/ProductForm";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminEditProductPage({ params }: Props) {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const images = parseImages(product.images);
  const options = parseOptions(product.options);

  return (
    <div>
      <p style={{ marginBottom: "0.75rem" }}>
        <Link href="/admin/products" style={{ fontSize: "0.9rem" }}>
          ← 상품 목록
        </Link>
      </p>
      <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
        상품 수정
      </h1>
      <p className="section-text">{product.name}</p>
      <ProductForm
        mode="edit"
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          detailHtml: product.detailHtml,
          detailCss: product.detailCss,
          price: product.price,
          stock: product.stock,
          images,
          saleType: product.saleType,
          category: product.category,
          published: product.published,
          featured: product.featured,
          options: options.map((opt) => ({
            name: opt.name,
            values: opt.values.join(", "),
          })),
        }}
      />
    </div>
  );
}
