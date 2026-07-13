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

            <p className="font-[family-name:var(--font-dm-sans)] text-[15px] lg:text-[16px] text-[#8A8A8A] leading-[1.85] max-w-lg">
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
                <span className="text-[#C8A96E]">{item.icon}</span>
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

function FishIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 12c0-3.3-3.8-6.5-9.5-6.5-1.1 2-1.7 4.2-1.7 6.5s.6 4.5 1.7 6.5c5.7 0 9.5-3.2 9.5-6.5Z" />
      <path d="M14.5 12l5.5-4v8l-5.5-4Z" />
      <circle cx="7.2" cy="10.2" r=".9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ScooterIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="17" r="2.1" />
      <circle cx="17" cy="17" r="2.1" />
      <path d="M8 17h6l2-5h3" />
      <path d="M12.5 12h2.3l1.5 3" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 4C10 4 4 10 4 18c0 .7.6 1 1.2.7C13 15 20 10 20 4Z" />
      <path d="M6 17c3-3 7-6 12-9" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5l2.4 5 5.6.6-4.2 3.8 1.2 5.5-4.9-2.9-4.9 2.9 1.2-5.5-4.2-3.8 5.6-.6z" />
    </svg>
  );
}

const DECO_ITEMS = [
  { icon: <FishIcon />, label: "Produits frais", sub: "Sélectionnés chaque matin" },
  { icon: <ScooterIcon />, label: "Livraison rapide", sub: "Dans tout Le Mans" },
  { icon: <LeafIcon />, label: "Recettes maison", sub: "Préparées à la commande" },
  { icon: <StarIcon />, label: "Fait avec soin", sub: "Chaque rouleau compte" },
];
