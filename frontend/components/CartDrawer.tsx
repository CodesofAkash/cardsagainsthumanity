"use client";
import { medusaHeaders, fetchCartById, MEDUSA_URL } from "@/hooks/useCart";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cartData: any;
  onCartUpdate: (d: any) => void;
  onCheckout: () => void;
}

export default function CartDrawer({ open, onClose, cartData, onCartUpdate, onCheckout }: CartDrawerProps) {
  const items = cartData?.cart?.items || [];
  const subtotal = cartData?.cart?.subtotal || 0;
  const cartId = cartData?.cart?.id;

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
      {open && <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm text-black hover:border-black transition-colors"
          >
            ✕
          </button>
          <h2 className="text-2xl font-black text-black" style={{ fontFamily: "Georgia, serif" }}>
            Cart
          </h2>
          {items.length > 0 && (
            <span className="ml-auto text-sm text-gray-400">
              {items.reduce((s: number, i: any) => s + i.quantity, 0)} item(s)
            </span>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6">
              <p className="text-2xl font-black text-black leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                Hey, there&apos;s<br />nothing in here.
              </p>
              <button onClick={onClose} className="bg-black text-white font-black px-8 py-3 rounded-full hover:bg-gray-800 transition-colors">
                Buy Some Stuff
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item: any) => (
                <div key={item.id} className="flex gap-4 py-4 items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.thumbnail && (
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-black truncate">
                      {item.product_title || item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => changeQty(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-black hover:border-black transition-colors"
                      >−</button>
                      <span className="text-sm font-bold text-black w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => changeQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-black hover:border-black transition-colors"
                      >+</button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-black">${((item.unit_price || 0) / 100).toFixed(2)}</p>
                    <button
                      onClick={() => changeQty(item.id, 0)}
                      className="text-gray-400 hover:text-black text-xs mt-1 transition-colors"
                    >Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-5">
            <div className="flex justify-between mb-4">
              <span className="font-black text-lg text-black">Subtotal</span>
              <span className="font-black text-lg text-black">${(subtotal / 100).toFixed(2)}</span>
            </div>
            <button
              onClick={() => { onClose(); onCheckout(); }}
              className="w-full bg-black text-white font-black text-lg py-4 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Check Out
            </button>
            <a href="/auth" className="block text-center text-sm text-gray-400 mt-3 hover:text-black transition-colors">
              Sign in for faster checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}