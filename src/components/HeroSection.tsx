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

  return (
    <section className="relative flex flex-col overflow-hidden bg-[#0D0D0D]">

      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 60% 40%, rgba(200,169,110,0.055) 0%, transparent 70%)",
        }}
      />

      {/* Decorative top-right circles */}
      <DecoCircles />

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 w-full grid lg:grid-cols-2 gap-8 items-center py-6">

        {/* Left: text */}
        <div className="flex flex-col items-start">

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

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="#menu"
              className="inline-flex items-center justify-center gap-2 px-8 py-[14px] bg-[#C8A96E] text-[#0D0D0D] text-[13px] tracking-[0.1em] uppercase font-[family-name:var(--font-dm-sans)] font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors duration-200"
            >
              {t.hero.cta}
            </Link>
            <Link
              href="#menu"
              className="inline-flex items-center justify-center gap-2 px-8 py-[14px] border border-[#C8A96E]/50 text-[#C8A96E] text-[13px] tracking-[0.1em] uppercase font-[family-name:var(--font-dm-sans)] font-normal rounded-[4px] hover:bg-[#C8A96E]/10 hover:border-[#C8A96E] transition-all duration-200"
            >
              {t.hero.ctaMenu}
            </Link>
          </div>

        </div>

        {/* Right: decorative sushi sketch */}
        <div className="hidden lg:flex items-center justify-center">
          <SushiDeco />
        </div>

      </div>

    </section>
  );
}

/* ===== Decorative right-side SVG ===== */
function SushiDeco() {
  return (
    <svg
      width="280"
      height="280"
      viewBox="0 0 420 420"
      fill="none"
      aria-hidden="true"
      className="opacity-60"
    >
      {/* Outer thin ring */}
      <circle cx="210" cy="210" r="190" stroke="#C8A96E" strokeWidth="0.8" strokeDasharray="6 6" />

      {/* Mid ring */}
      <circle cx="210" cy="210" r="148" stroke="#C8A96E" strokeWidth="1" />

      {/* Inner ring */}
      <circle cx="210" cy="210" r="90" stroke="#C8A96E" strokeWidth="1.2" />

      {/* Center dot */}
      <circle cx="210" cy="210" r="8" stroke="#C8A96E" strokeWidth="1.2" />
      <circle cx="210" cy="210" r="2" fill="#C8A96E" />

      {/* Cross lines */}
      <line x1="210" y1="62" x2="210" y2="358" stroke="#C8A96E" strokeWidth="0.6" strokeDasharray="4 8" />
      <line x1="62"  y1="210" x2="358" y2="210" stroke="#C8A96E" strokeWidth="0.6" strokeDasharray="4 8" />

      {/* Diagonal lines */}
      <line x1="97"  y1="97"  x2="323" y2="323" stroke="#C8A96E" strokeWidth="0.4" strokeDasharray="3 10" />
      <line x1="323" y1="97"  x2="97"  y2="323" stroke="#C8A96E" strokeWidth="0.4" strokeDasharray="3 10" />

      {/* Wave below center */}
      <path
        d="M130 280 C155 265, 175 295, 210 280 C245 265, 265 295, 290 280"
        stroke="#C8A96E"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Small accent circles on the mid ring */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = +(210 + 148 * Math.cos(rad)).toFixed(4);
        const y = +(210 + 148 * Math.sin(rad)).toFixed(4);
        return <circle key={deg} cx={x} cy={y} r="3" fill="#C8A96E" opacity="0.7" />;
      })}
    </svg>
  );
}

/* ===== Top-right decorative circles ===== */
function DecoCircles() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute top-0 right-0 opacity-[0.07]">
      <svg width="480" height="480" viewBox="0 0 480 480" fill="none">
        <circle cx="400" cy="80"  r="200" stroke="#C8A96E" strokeWidth="1" />
        <circle cx="400" cy="80"  r="140" stroke="#C8A96E" strokeWidth="1" />
        <circle cx="400" cy="80"  r="80"  stroke="#C8A96E" strokeWidth="1" />
      </svg>
    </div>
  );
}
