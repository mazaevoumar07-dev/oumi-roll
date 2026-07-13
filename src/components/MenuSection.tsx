"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LangContext";
import { useMenu, type ApiMenuItem } from "@/context/MenuContext";

const CATEGORY_KEYS = ["ALL", "Makis", "California", "Temaki", "Spécialités", "Sauces", "Boissons"] as const;
type CategoryKey = typeof CATEGORY_KEYS[number];

/* ===== MAIN SECTION ===== */

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("ALL");
  const [selectedItem, setSelectedItem] = useState<ApiMenuItem | null>(null);
  const { t } = useLang();
  const { addItem } = useCart();
  const { items, loading } = useMenu();

  const visible = items.filter(i => i.is_available);
  const filtered =
    activeCategory === "ALL"
      ? items.filter(i => i.category !== "Sauces" && i.category !== "Boissons")
      : items.filter(i => i.category === activeCategory);

  function getCategoryLabel(key: CategoryKey): string {
    if (key === "ALL") return t.menu.catAll;
    if (key === "Spécialités") return t.menu.catSpecial;
    return key;
  }

  function handleQuickAdd(item: ApiMenuItem, e: React.MouseEvent) {
    e.stopPropagation();
    if (!item.is_available) return;
    addItem({ id: item.id, name: item.name, price: item.price });
  }

  return (
    <section id="menu" className="bg-[#0D0D0D] pt-10 lg:pt-14 pb-24 lg:pb-32 scroll-mt-[72px]">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10">

        {/* Top separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent mb-8 lg:mb-10" />

        {/* Section header */}
        <div className="mb-12 lg:mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-[#C8A96E]" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
              {t.menu.eyebrow}
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-cormorant)] text-[36px] sm:text-[48px] lg:text-[56px] font-light text-[#F0EAD6] leading-[1.1] tracking-[0.02em] mb-4">
            {t.menu.title}
          </h2>
          <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[#8A8A8A] leading-[1.7] max-w-md">
            {t.menu.sub}
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1 -mx-6 px-6 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {CATEGORY_KEYS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                "flex-shrink-0 px-5 py-[9px] text-[11.5px] tracking-[0.1em] uppercase rounded-[4px] transition-all duration-200 border font-[family-name:var(--font-dm-sans)]",
                activeCategory === cat
                  ? "bg-[#C8A96E]/10 border-[#C8A96E] text-[#C8A96E]"
                  : "border-[#2A2A2A] text-[#8A8A8A] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70",
              ].join(" ")}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Состояние загрузки */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-[#C8A96E]/20 border-t-[#C8A96E] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <span className="font-[family-name:var(--font-cormorant)] text-[26px] text-[#8A8A8A] font-light">
              {t.menu.menuEmpty}
            </span>
            <span className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#2A2A2A]">
              {t.menu.menuEmptySub}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
            {filtered.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onOpen={() => setSelectedItem(item)}
                onQuickAdd={(e) => handleQuickAdd(item, e)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Modal */}
      {selectedItem && (
        <MenuModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </section>
  );
}

/* ===== MENU CARD ===== */

function MenuCard({
  item,
  onOpen,
  onQuickAdd,
}: {
  item: ApiMenuItem;
  onOpen: () => void;
  onQuickAdd: (e: React.MouseEvent) => void;
}) {
  const { t } = useLang();
  return (
    <article
      className={[
        "group flex flex-col bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] overflow-hidden",
        "transition-all duration-300",
        item.is_available
          ? "cursor-pointer hover:border-[#C8A96E]/40 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(200,169,110,0.07)]"
          : "opacity-60",
      ].join(" ")}
      onClick={item.is_available ? onOpen : undefined}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0F0F0F]">
        {item.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photo_url}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <SushiPlaceholder id={item.id} />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {!item.is_available && (
            <span className="px-2.5 py-[5px] bg-[#0D0D0D]/90 border border-[#2A2A2A] text-[10px] tracking-[0.1em] uppercase text-[#8A8A8A] rounded-[2px] font-[family-name:var(--font-dm-sans)]">
              {t.menu.unavailable}
            </span>
          )}
          {item.original_price && item.is_available && (
            <span className="px-2.5 py-[5px] bg-[#C8A96E] text-[#0D0D0D] text-[10px] tracking-[0.1em] uppercase font-medium rounded-[2px] font-[family-name:var(--font-dm-sans)]">
              Promotion
            </span>
          )}
        </div>

        {/* Количество кусочков */}
        {item.pieces !== null && (
          <span className="absolute bottom-3 right-3 px-2 py-[3px] bg-[#0D0D0D]/75 text-[10px] tracking-[0.08em] text-[#8A8A8A] rounded-[2px] font-[family-name:var(--font-dm-sans)]">
            {item.pieces === 1 ? "1 pièce" : `${item.pieces} pièces`}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">

        {/* Category label + name */}
        <div>
          <span className="text-[10px] tracking-[0.15em] uppercase text-[#C8A96E]/55 font-[family-name:var(--font-dm-sans)]">
            {item.category}
          </span>
          <h3 className="font-[family-name:var(--font-cormorant)] text-[20px] font-medium text-[#F0EAD6] leading-tight mt-0.5">
            {item.name}
          </h3>
        </div>

        {/* Description */}
        <p className="font-[family-name:var(--font-dm-sans)] text-[12.5px] text-[#8A8A8A] leading-[1.65] line-clamp-2 flex-1">
          {item.description}
        </p>

        {/* Price + button */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A] mt-1">
          <div className="flex items-baseline gap-2">
            {item.original_price && (
              <span className="text-[12px] text-[#8A8A8A]/60 line-through font-[family-name:var(--font-dm-sans)]">
                €{Number(item.original_price).toFixed(2)}
              </span>
            )}
            <span className={[
              "font-[family-name:var(--font-cormorant)] text-[22px] font-semibold",
              item.original_price ? "text-[#C8A96E]" : "text-[#F0EAD6]",
            ].join(" ")}>
              €{Number(item.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={onQuickAdd}
            disabled={!item.is_available}
            aria-label={item.is_available ? `${t.menu.add} ${item.name}` : t.menu.unavailable}
            className={[
              "flex items-center justify-center w-9 h-9 rounded-[4px] border transition-all duration-200",
              item.is_available
                ? "border-[#C8A96E]/50 text-[#C8A96E] hover:bg-[#C8A96E]/10 hover:border-[#C8A96E]"
                : "border-[#2A2A2A] text-[#3A3A3A] cursor-not-allowed",
            ].join(" ")}
          >
            {item.is_available ? <PlusIcon /> : <BanIcon />}
          </button>
        </div>

      </div>
    </article>
  );
}

/* ===== MENU MODAL ===== */

function MenuModal({ item, onClose }: { item: ApiMenuItem; onClose: () => void }) {
  const { addItem } = useCart();
  const { t } = useLang();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Auto-close after success feedback
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(onClose, 900);
    return () => clearTimeout(timer);
  }, [added, onClose]);

  function handleAdd() {
    addItem({ id: item.id, name: item.name, price: Number(item.price) }, qty);
    setAdded(true);
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/78 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[480px] bg-[#1A1A1A] border border-[#2A2A2A] rounded-t-2xl sm:rounded-[4px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative aspect-[16/9] bg-[#0F0F0F]">
          {item.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.photo_url}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <SushiPlaceholder id={item.id} large />
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-[#0D0D0D]/80 border border-[#2A2A2A] rounded-full text-[#8A8A8A] hover:text-[#F0EAD6] hover:border-[#C8A96E]/40 transition-colors"
            aria-label={t.menu.close}
          >
            <XIcon />
          </button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {!item.is_available && (
              <span className="px-2.5 py-[5px] bg-[#0D0D0D]/90 border border-[#2A2A2A] text-[10px] tracking-[0.1em] uppercase text-[#8A8A8A] rounded-[2px] font-[family-name:var(--font-dm-sans)]">
                {t.menu.unavailable}
              </span>
            )}
            {item.original_price && item.is_available && (
              <span className="px-2.5 py-[5px] bg-[#C8A96E] text-[#0D0D0D] text-[10px] tracking-[0.1em] uppercase font-medium rounded-[2px] font-[family-name:var(--font-dm-sans)]">
                Promotion
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          <span className="text-[10px] tracking-[0.15em] uppercase text-[#C8A96E]/60 font-[family-name:var(--font-dm-sans)]">
            {item.category}{item.pieces !== null ? ` · ${item.pieces === 1 ? "1 pièce" : `${item.pieces} pièces`}` : ""}
          </span>

          <h3 className="font-[family-name:var(--font-cormorant)] text-[26px] sm:text-[30px] font-medium text-[#F0EAD6] leading-tight mt-1 mb-3">
            {item.name}
          </h3>

          <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A] leading-[1.75] mb-6">
            {item.description}
          </p>

          {/* Price + controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Price */}
            <div className="flex items-baseline gap-2">
              {item.original_price && (
                <span className="text-[13px] text-[#8A8A8A]/60 line-through font-[family-name:var(--font-dm-sans)]">
                  €{Number(item.original_price).toFixed(2)}
                </span>
              )}
              <span className="font-[family-name:var(--font-cormorant)] text-[30px] font-semibold text-[#C8A96E]">
                €{Number(item.price).toFixed(2)}
              </span>
            </div>

            {item.is_available ? (
              <div className="flex items-center gap-2.5">
                {/* Qty */}
                <div className="flex items-center border border-[#2A2A2A] rounded-[4px] overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-[#8A8A8A] hover:text-[#F0EAD6] hover:bg-[#2A2A2A] transition-colors"
                    aria-label="Diminuer"
                  >
                    <MinusIcon />
                  </button>
                  <span className="w-7 text-center text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)]">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => Math.min(10, q + 1))}
                    className="w-8 h-8 flex items-center justify-center text-[#8A8A8A] hover:text-[#F0EAD6] hover:bg-[#2A2A2A] transition-colors"
                    aria-label="Augmenter"
                  >
                    <PlusIcon />
                  </button>
                </div>

                {/* Add button */}
                <button
                  onClick={handleAdd}
                  disabled={added}
                  className={[
                    "flex items-center gap-2 px-5 py-[10px] text-[12.5px] tracking-[0.06em] rounded-[4px] font-[family-name:var(--font-dm-sans)] transition-all duration-300 whitespace-nowrap",
                    added
                      ? "bg-[#27AE60] text-white border border-[#27AE60]"
                      : "bg-[#C8A96E] text-[#0D0D0D] font-medium hover:bg-[#E2C07A]",
                  ].join(" ")}
                >
                  {added ? (
                    <>
                      <CheckIcon />
                      <span>{t.menu.add} ✓</span>
                    </>
                  ) : (
                    <span>{t.menu.add} — €{(Number(item.price) * qty).toFixed(2)}</span>
                  )}
                </button>
              </div>
            ) : (
              <span className="text-[12px] tracking-[0.06em] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
                {t.menu.outOfStock}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== SUSHI PLACEHOLDER ===== */

function SushiPlaceholder({ id, large = false }: { id: string; large?: boolean }) {
  const h = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const gx = 30 + (h % 40);
  const gy = 30 + ((h * 7) % 40);
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: `radial-gradient(ellipse at ${gx}% ${gy}%, rgba(200,169,110,0.11) 0%, transparent 65%), #0F0F0F`,
      }}
    >
      <SushiIcon size={large ? 88 : 64} />
    </div>
  );
}

function SushiIcon({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="opacity-35"
    >
      <circle cx="32" cy="32" r="29" stroke="#C8A96E" strokeWidth="1" />
      <circle cx="32" cy="32" r="20" stroke="#C8A96E" strokeWidth="0.9" />
      <circle cx="32" cy="32" r="11" stroke="#C8A96E" strokeWidth="0.8" />
      <circle cx="32" cy="32" r="3.5" fill="#C8A96E" />
      <line x1="32" y1="3" x2="32" y2="61" stroke="#C8A96E" strokeWidth="0.5" strokeDasharray="3 6" />
      <line x1="3" y1="32" x2="61" y2="32" stroke="#C8A96E" strokeWidth="0.5" strokeDasharray="3 6" />
      <path
        d="M16 47 C22 41, 27 51, 32 46 C37 41, 42 50, 48 45"
        stroke="#C8A96E"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
      {[0, 72, 144, 216, 288].map((deg) => {
        const r = (deg * Math.PI) / 180;
        return (
          <circle
            key={deg}
            cx={+(32 + 20 * Math.cos(r)).toFixed(4)}
            cy={+(32 + 20 * Math.sin(r)).toFixed(4)}
            r="2"
            fill="#C8A96E"
            opacity="0.6"
          />
        );
      })}
    </svg>
  );
}

/* ===== ICONS ===== */

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

function BanIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
