"use client";

import { useLang } from "@/context/LangContext";
import { useMenu, BONUS_MIN_QTY } from "@/context/MenuContext";

export default function BonusBanner() {
  const { t } = useLang();
  const { promo } = useMenu();

  if (!promo.is_active) return null;

  const message = promo.gift_item_name
    ? t.bonus.both(BONUS_MIN_QTY, promo.gift_item_name)
    : t.bonus.delivery(BONUS_MIN_QTY);

  return (
    <div className="bg-[#C8A96E] text-[#0D0D0D] py-2.5 px-6">
      <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2.5">
        <GiftIcon />
        <p className="font-[family-name:var(--font-dm-sans)] text-[12.5px] font-medium tracking-[0.03em] text-center">
          {message}
        </p>
      </div>
    </div>
  );
}

function GiftIcon() {
  return (
    <svg width="14" height="14" className="flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}
