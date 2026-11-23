import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function AdminNewProductPage() {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  return (
    <div>
      <p style={{ marginBottom: "0.75rem" }}>
        <Link href="/admin/products" style={{ fontSize: "0.9rem" }}>
          ← 상품 목록
        </Link>
      </p>
      <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
        상품 추가
      </h1>
      <p className="section-text">새 굿즈를 등록합니다. 사진은 업로드 후 자르기·회전할 수 있습니다.</p>
      <ProductForm
        mode="create"
        initial={{
          name: "",
          slug: "",
          description: "",
          detailHtml: "",
          detailCss: "",
          price: 0,
          stock: 0,
          images: [],
          saleType: "NORMAL",
          category: "goods",
          published: true,
          featured: false,
          options: [],
        }}
      />
    </div>
  );
}
