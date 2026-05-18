"use client";

import { useLang } from "@/context/LangContext";

export default function AboutSection() {
  const { t } = useLang();

  return (
    <section id="about" className="bg-[#0D0D0D]">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 py-20 lg:py-28">

        {/* Top separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent mb-16 lg:mb-20" />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — text */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-[#C8A96E]" />
              <span className="text-[11px] tracking-[0.22em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
                {t.about.eyebrow}
              </span>
            </div>

            <h2 className="font-[family-name:var(--font-cormorant)] text-[32px] sm:text-[42px] lg:text-[50px] font-light text-[#F0EAD6] leading-[1.15] tracking-[0.02em] mb-8 whitespace-pre-line">
              {t.about.title}
            </h2>

            <div className="w-12 h-px bg-[#8B6F3E] mb-8" />

            <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[#8A8A8A] leading-[1.85] max-w-lg">
              {t.about.text}
            </p>
          </div>

          {/* Right — decorative grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {DECO_ITEMS.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 p-5 border border-[#1E1E1E] rounded-[4px] bg-[#111111]"
              >
                <span className="text-[22px]">{item.icon}</span>
                <span className="font-[family-name:var(--font-cormorant)] text-[17px] font-medium text-[#F0EAD6]">
                  {item.label}
                </span>
                <span className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#8A8A8A] leading-[1.6]">
                  {item.sub}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

const DECO_ITEMS = [
  { icon: "🍣", label: "Produits frais", sub: "Sélectionnés chaque matin" },
  { icon: "🛵", label: "Livraison rapide", sub: "Dans tout Le Mans" },
  { icon: "🎋", label: "Recettes maison", sub: "Préparées à la commande" },
  { icon: "⭐", label: "Fait avec soin", sub: "Chaque rouleau compte" },
];
