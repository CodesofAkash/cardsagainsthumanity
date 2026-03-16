"use client";
import { useState, useEffect, useCallback } from "react";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
const REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID || "";

export const medusaHeaders = {
  "Content-Type": "application/json",
  "x-publishable-api-key": PUBLISHABLE_KEY,
};

export async function getOrCreateCart(): Promise<string> {
  let id = localStorage.getItem("cart_id");
  if (id) return id;
  const res = await fetch(`${MEDUSA_URL}/store/carts`, {
    method: "POST",
    headers: medusaHeaders,
    body: JSON.stringify({ region_id: REGION_ID }),
  });
  const data = await res.json();
  id = data.cart.id;
  localStorage.setItem("cart_id", id!);
  return id!;
}

export async function fetchCartById(cartId: string) {
  const res = await fetch(`${MEDUSA_URL}/store/carts/${cartId}`, {
    headers: medusaHeaders,
  });
  return res.json();
}

export function useCart() {
  const [cartData, setCartData] = useState<any>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);

  const loadCart = useCallback(async () => {
    setCartLoading(true);
    const cartId = localStorage.getItem("cart_id");
    if (cartId) {
      try {
        const data = await fetchCartById(cartId);
        setCartData(data);
      } catch (err) {
        console.error("[useCart] loadCart error", err);
        setCartData(null);
      }
    } else {
      setCartData(null);
    }
    setCartLoading(false);
  }, []);

  useEffect(() => {
    loadCart();
    // Listen for cart updates from other tabs/pages
    const handler = () => loadCart();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [loadCart]);

  const updateCart = (data: any) => {
    setCartData(data);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const clearCart = () => {
    setCartData(null);
    localStorage.removeItem("cart_id");
    window.dispatchEvent(new Event("cart-updated"));
  };

  const cartCount =
    cartData?.cart?.items?.reduce(
      (s: number, i: any) => s + i.quantity,
      0
    ) || 0;

  return {
    cartData,
    cartCount,
    cartOpen,
    checkoutOpen,
    cartLoading,
    setCartOpen,
    setCheckoutOpen,
    updateCart,
    clearCart,
    loadCart,
  };
}

export { MEDUSA_URL };