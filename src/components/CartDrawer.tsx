"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LangContext";
import { useMenu, BONUS_MIN_QTY } from "@/context/MenuContext";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total } = useCart();
  const { t } = useLang();
  const { items: menuItems, promo } = useMenu();

  const totalQty      = items.reduce((s, i) => s + i.qty, 0);
  const bonusUnlocked = totalQty >= BONUS_MIN_QTY;
  const showFreeDelivery = bonusUnlocked && promo.is_active;
  const showGift         = bonusUnlocked && promo.is_active && !!promo.gift_item_name;

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  // Проверяем не стали ли товары в корзине недоступными
  const hasUnavailable = items.some(cartItem => {
    const menuItem = menuItems.find(m => m.id === cartItem.id);
    return menuItem && !menuItem.is_available;
  });

  const isEmpty = items.length === 0;

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        className={[
          "fixed inset-0 z-[70] bg-black/65 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={closeCart}
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.cart.ariaLabel}
        className={[
          "fixed top-0 right-0 bottom-0 z-[71] w-full sm:w-[420px]",
          "flex flex-col bg-[#1A1A1A] border-l border-[#2A2A2A]",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none",
        ].join(" ")}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A] flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-[family-name:var(--font-cormorant)] text-[22px] font-medium text-[#F0EAD6] leading-none">
              {t.cart.title}
            </h2>
            {!isEmpty && (
              <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-[#C8A96E] text-[#0D0D0D] text-[11px] font-medium rounded-full font-[family-name:var(--font-dm-sans)]">
                {items.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label={t.cart.ariaClose}
            className="w-8 h-8 flex items-center justify-center text-[#8A8A8A] hover:text-[#F0EAD6] hover:bg-[#2A2A2A] rounded-[4px] transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
              <EmptyBagIcon />
              <div>
                <p className="font-[family-name:var(--font-cormorant)] text-[22px] text-[#F0EAD6] font-light mb-1">
                  {t.cart.emptyTitle}
                </p>
                <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A]">
                  {t.cart.emptySub}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="mt-1 px-6 py-[10px] border border-[#C8A96E]/50 text-[#C8A96E] text-[12px] tracking-[0.1em] uppercase rounded-[4px] hover:bg-[#C8A96E]/8 hover:border-[#C8A96E] transition-all duration-200 font-[family-name:var(--font-dm-sans)]"
              >
                <a href="#menu" onClick={closeCart}>{t.cart.emptyBtn}</a>
              </button>
            </div>
          ) : (
            /* Items list */
            <ul className="divide-y divide-[#2A2A2A]">
              {items.map((item) => {
                const menuItem = menuItems.find(m => m.id === item.id);
                const unavailable = menuItem && !menuItem.is_available;

                return (
                  <li key={item.id} className={["px-6 py-5 flex flex-col gap-3", unavailable ? "opacity-60" : ""].join(" ")}>
                    {/* Top row: name + delete */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {unavailable && (
                          <span className="inline-block mb-1 text-[10px] tracking-[0.1em] uppercase text-[#C0392B] font-[family-name:var(--font-dm-sans)]">
                            {t.cart.unavailable}
                          </span>
                        )}
                        <p className="font-[family-name:var(--font-cormorant)] text-[18px] font-medium text-[#F0EAD6] leading-tight">
                          {item.name}
                        </p>
                        <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#8A8A8A] mt-0.5">
                          €{item.price.toFixed(2)} {t.cart.perPiece}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={t.cart.ariaRemove(item.name)}
                        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-[#8A8A8A] hover:text-[#C0392B] hover:bg-[#C0392B]/8 rounded-[4px] transition-colors mt-0.5"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    {/* Bottom row: qty controls + line total */}
                    <div className="flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center border border-[#2A2A2A] rounded-[4px] overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          aria-label={t.cart.ariaDecrease}
                          className="w-8 h-8 flex items-center justify-center text-[#8A8A8A] hover:text-[#F0EAD6] hover:bg-[#2A2A2A] transition-colors"
                        >
                          <MinusIcon />
                        </button>
                        <span className="w-8 text-center text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] select-none">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          aria-label={t.cart.ariaIncrease}
                          className="w-8 h-8 flex items-center justify-center text-[#8A8A8A] hover:text-[#F0EAD6] hover:bg-[#2A2A2A] transition-colors"
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      {/* Line total */}
                      <span className="font-[family-name:var(--font-cormorant)] text-[20px] font-semibold text-[#F0EAD6]">
                        €{(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Footer ── */}
        {!isEmpty && (
          <div className="flex-shrink-0 border-t border-[#2A2A2A] px-6 py-5 flex flex-col gap-4">

            {/* Unavailability warning */}
            {hasUnavailable && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-[4px]">
                <WarningIcon />
                <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#F0EAD6]/80 leading-[1.6]">
                  {t.cart.unavailableWarning}
                </p>
              </div>
            )}

            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A] tracking-[0.04em]">
                {t.cart.subtotal}
              </span>
              <span className="font-[family-name:var(--font-cormorant)] text-[24px] font-semibold text-[#C8A96E]">
                €{total.toFixed(2)}
              </span>
            </div>

            {/* Bonus lines */}
            {(showFreeDelivery || showGift) && (
              <div className="flex flex-col gap-1.5 -mt-1 pt-2 border-t border-[#2A2A2A]">
                {showFreeDelivery && (
                  <div className="flex items-center gap-2">
                    <CheckIcon />
                    <span className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#27AE60]">
                      {t.cart.bonusDelivery}
                    </span>
                  </div>
                )}
                {showGift && (
                  <div className="flex items-center gap-2">
                    <CheckIcon />
                    <span className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#27AE60]">
                      {t.cart.bonusGift(promo.gift_item_name!)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <p className="font-[family-name:var(--font-dm-sans)] text-[11.5px] text-[#8A8A8A]/60 -mt-2">
              {showFreeDelivery ? t.cart.deliveryFree : t.cart.deliveryNext}
            </p>

            {/* Checkout button */}
            <Link
              href="/commande"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full py-[14px] bg-[#C8A96E] text-[#0D0D0D] text-[13px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors duration-200 font-[family-name:var(--font-dm-sans)]"
            >
              {t.cart.checkout}
              <ArrowRightIcon />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

/* ===== ICONS ===== */

function CheckIcon() {
  return (
    <svg width="12" height="12" className="flex-shrink-0 text-[#27AE60]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0 mt-[1px]">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function EmptyBagIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true" className="opacity-20">
      <path d="M20 20h24l-3 30H23L20 20z" stroke="#C8A96E" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M26 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#C8A96E" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="30" x2="28" y2="40" stroke="#C8A96E" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="36" y1="30" x2="36" y2="40" stroke="#C8A96E" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
