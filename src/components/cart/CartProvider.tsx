"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CART_STORAGE_KEY,
  type CartItem,
} from "@/lib/cart-types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, option?: string) => void;
  updateQuantity: (productId: string, quantity: number, option?: string) => void;
  clearCart: () => void;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function itemKey(productId: string, option?: string) {
  return `${productId}::${option || ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        const key = itemKey(item.productId, item.option);
        const idx = prev.findIndex(
          (p) => itemKey(p.productId, p.option) === key,
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + (item.quantity || 1),
          };
          return next;
        }
        return [...prev, { ...item, quantity: item.quantity || 1 }];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string, option?: string) => {
    setItems((prev) =>
      prev.filter((p) => itemKey(p.productId, p.option) !== itemKey(productId, option)),
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, option?: string) => {
      setItems((prev) =>
        prev
          .map((p) =>
            itemKey(p.productId, p.option) === itemKey(productId, option)
              ? { ...p, quantity }
              : p,
          )
          .filter((p) => p.quantity > 0),
      );
    },
    [],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      ready,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, ready],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
