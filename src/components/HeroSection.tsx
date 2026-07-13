"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";

export default function HeroSection() {
  const lineRef = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const timer = setTimeout(() => el.classList.add("w-24"), 100);
    return () => clearTimeout(timer);
  }, []);

  function scrollToMenu(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="relative flex flex-col overflow-hidden bg-[#0D0D0D] lg:min-h-[calc(100svh-72px)]">

      {/* Photo: compact banner on mobile, full-bleed background from lg */}
      <div className="relative h-[300px] sm:h-[380px] w-full lg:absolute lg:inset-0 lg:h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-sushi-plate.jpg"
          alt="Plateau de sushis, sashimis, wasabi et gingembre"
          className="absolute inset-0 w-full h-full object-cover object-[75%_center] lg:object-[68%_center]"
        />

        {/* Mobile: bottom fade so photo blends into the text area below */}
        <div
          aria-hidden="true"
          className="lg:hidden absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent"
        />

        {/* Desktop: left-to-right scrim for text legibility over the photo */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#0D0D0D] from-10% via-[#0D0D0D]/85 via-45% to-[#0D0D0D]/25"
        />
        <div
          aria-hidden="true"
          className="hidden lg:block absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-70"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 w-full flex-1 flex items-center py-8 lg:py-6">

        <div className="flex flex-col items-start max-w-xl">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <div
              ref={lineRef}
              className="h-px bg-[#C8A96E] w-0 transition-all duration-700 ease-out"
            />
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
              {t.hero.eyebrow}
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-[family-name:var(--font-cormorant)] leading-[1.05] mb-4">
            <span className="block text-[26px] sm:text-[36px] lg:text-[52px] font-light text-[#F0EAD6] tracking-[0.02em]">
              {t.hero.line1}
            </span>
            <span className="block text-[26px] sm:text-[36px] lg:text-[52px] font-semibold italic text-[#C8A96E] tracking-[0.02em]">
              {t.hero.line2}
            </span>
            <span className="block text-[26px] sm:text-[36px] lg:text-[52px] font-light text-[#F0EAD6] tracking-[0.02em]">
              {t.hero.line3}
            </span>
          </h1>

          {/* Divider */}
          <div className="w-16 h-px bg-[#8B6F3E] mb-4" />

          {/* Subtext */}
          <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A] leading-[1.6] mb-6 max-w-sm whitespace-pre-line">
            {t.hero.sub}
          </p>

          {/* CTA button */}
          <div className="flex w-full sm:w-auto">
            <Link
              href="#menu"
              onClick={scrollToMenu}
              className="inline-flex items-center justify-center gap-2 px-8 py-[14px] bg-[#C8A96E] text-[#0D0D0D] text-[13px] tracking-[0.1em] uppercase font-[family-name:var(--font-dm-sans)] font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors duration-200"
            >
              {t.hero.cta}
            </Link>
          </div>

        </div>

      </div>

    </section>
  );
}
