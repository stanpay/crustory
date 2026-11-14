export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  option?: string;
  saleType: "NORMAL" | "PREORDER";
};

export const CART_STORAGE_KEY = "crustory_cart_v1";
