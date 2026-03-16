"use client";

import Image from "next/image";
import { medusaHeaders, fetchCartById, MEDUSA_URL } from "@/hooks/useCart";
import { CartItemSkeleton } from "@/components/Skeletons";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cartData: any;
  onCartUpdate: (d: any) => void;
  onCheckout: () => void;
  loading?: boolean;
}

export default function CartDrawer({ open, onClose, cartData, onCartUpdate, onCheckout, loading = false }: CartDrawerProps) {
  const items = cartData?.cart?.items || [];
  const subtotal = cartData?.cart?.subtotal || 0;
  const cartId = cartData?.cart?.id;
  const isOpen = open;
  const NAVBAR_HEIGHT = 72;
  const controlBtnCls = "bg-white text-black border-[3px] border-black rounded-full hover:bg-black hover:text-white transition-colors";

  async function changeQty(itemId: string, qty: number) {
    if (!cartId) return;
    try {
      if (qty < 1) {
        const res = await fetch(`${MEDUSA_URL}/store/carts/${cartId}/line-items/${itemId}`, {
          method: "DELETE",
          headers: medusaHeaders,
        });
        if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      } else {
        const res = await fetch(`${MEDUSA_URL}/store/carts/${cartId}/line-items/${itemId}`, {
          method: "POST",
          headers: medusaHeaders,
          body: JSON.stringify({ quantity: qty }),
        });
        if (!res.ok) throw new Error(`POST failed: ${res.status}`);
      }
      const updated = await fetchCartById(cartId);
      onCartUpdate(updated);
    } catch (e) {
      console.error("[CartDrawer] changeQty error:", e);
      // If cart is stale/completed, clear it
      localStorage.removeItem("cart_id");
      onCartUpdate(null);
    }
  }

  return (
    <>
      <div
        className="fixed left-0 bottom-0 bg-transparent"
        style={{
          top: NAVBAR_HEIGHT,
          right: 0,
          zIndex: 120,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.36s ease",
        }}
        onClick={onClose}
      />
      <div
        className="fixed right-0 bg-white flex flex-col"
        style={{
          top: NAVBAR_HEIGHT,
          width: "min(92vw, 380px)",
          height: `calc(100svh - ${NAVBAR_HEIGHT}px)`,
          zIndex: 121,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.56s cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
        }}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center px-6 pt-5 pb-5">
          <button
            onClick={onClose}
            className={`absolute left-6 w-10 h-10 flex items-center justify-center text-xl font-black leading-none ${controlBtnCls}`}
          >
            ✕
          </button>
          <h2 className="text-2xl font-medium text-black" style={{ fontFamily: "Georgia, serif" }}>
            Cart
          </h2>
        </div>
        <div className="mx-6 border-t-[3px] border-gray-500" />

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="space-y-4" aria-live="polite">
              {Array.from({ length: 3 }).map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="flex h-full items-center justify-center text-center text-black/70">
              <p className="font-medium">Your cart is empty.</p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div>
              {items.map((item: any) => {
                const imageSrc = item?.metadata?.image || item?.thumbnail;
                return (
                  <div key={item.id} className="flex gap-5 py-6 items-center border-b-[3px] border-gray-400">
                    <div className="relative w-20 h-20 bg-white shrink-0 overflow-visible">
                      {imageSrc && (
                        <Image
                          src={imageSrc}
                          alt={item.title}
                          fill
                          sizes="80px"
                          loading="lazy"
                          className="relative z-20 object-contain transition-transform duration-300 ease-out hover:scale-110 hover:-rotate-6"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[1.2rem] leading-tight text-black truncate">
                        {item.product_title || item.title}
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => changeQty(item.id, item.quantity - 1)}
                          className={`w-5 h-5 p-0 flex items-center justify-center text-[11px] font-black leading-none ${controlBtnCls}`}
                        >−</button>
                        <span className="text-lg font-medium text-black min-w-6 text-center leading-none">{item.quantity}</span>
                        <button
                          onClick={() => changeQty(item.id, item.quantity + 1)}
                          className={`w-5 h-5 p-0 flex items-center justify-center text-[11px] font-black leading-none ${controlBtnCls}`}
                        >+</button>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-4 self-start">
                      <button
                        onClick={() => changeQty(item.id, 0)}
                        className={`w-5 h-5 p-0 flex items-center justify-center text-[11px] font-black leading-none ${controlBtnCls}`}
                        aria-label={`Remove ${item.product_title || item.title}`}
                      >✕</button>
                      <p className="font-medium text-[1.35rem] leading-none text-black">${((item.unit_price || 0) / 100).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && items.length > 0 && (
          <div className="px-6 py-5">
            <div className="border-t-[3px] border-gray-500 mb-3" />
            <div className="flex justify-between mb-3">
              <span className="font-bold text-2xl text-black">Subtotal</span>
              <span className="font-bold text-2xl text-black">${(subtotal / 100).toFixed(2)}</span>
            </div>
            <div className="border-t-[3px] border-gray-500 mb-3" />
            <button
              onClick={() => { onClose(); onCheckout(); }}
              className="w-full font-bold text-xl py-1.5 bg-black text-white border-2 border-black rounded-full hover:bg-white hover:text-black transition-colors"
            >
              Check Out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
