"use client";
import { createContext, useContext } from "react";
import { useCart } from "@/hooks/useCart";

const CartCtx = createContext<ReturnType<typeof useCart> | null>(null);

export function useCartCtx() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCartCtx must be inside CartProvider");
  return ctx;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();
  return <CartCtx.Provider value={cart}>{children}</CartCtx.Provider>;
}