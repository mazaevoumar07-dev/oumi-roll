"use client";

import Link from "next/link";
import { useLang } from "@/context/LangContext";

const ADDRESS = "12 Rue des Îles, 72000 Le Mans";
const PHONE   = "+33 2 43 XX XX XX";
const INSTAGRAM = "@oumiroll";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-[#0D0D0D] border-t border-[#2A2A2A]">

      {/* Main grid */}
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">

          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <LogoIcon />
              <span className="flex flex-col leading-none gap-[3px]">
                <span className="font-[family-name:var(--font-cormorant)] font-bold text-[19px] tracking-[0.14em] text-[#F0EAD6] uppercase">
                  OUMI
                </span>
                <span className="font-[family-name:var(--font-cormorant)] font-normal text-[11.5px] tracking-[0.32em] text-[#C8A96E] uppercase">
                  ROLL
                </span>
              </span>
            </div>
            <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A] leading-[1.7] whitespace-pre-line max-w-[220px]">
              {t.footer.tagline}
            </p>
            <a
              href="https://instagram.com/oumiroll"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[12px] tracking-[0.06em] text-[#8A8A8A] hover:text-[#C8A96E] transition-colors duration-200 font-[family-name:var(--font-dm-sans)]"
            >
              <InstagramIcon />
              {INSTAGRAM}
            </a>
          </div>

          {/* Col 2 — Nav */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[10px] tracking-[0.22em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
              {t.footer.navTitle}
            </h3>
            <nav className="flex flex-col gap-3">
              {[
                { href: "#menu",    label: t.nav.menu },
                { href: "#about",   label: t.nav.about },
                { href: "#contact", label: t.nav.contact },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A] hover:text-[#F0EAD6] transition-colors duration-200 w-fit"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3 — Contact + Hours */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <h3 className="text-[10px] tracking-[0.22em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
                {t.footer.contactTitle}
              </h3>
              <div className="flex flex-col gap-2.5">
                <span className="flex items-start gap-2.5 font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A]">
                  <PinIcon />
                  {ADDRESS}
                </span>
                <a
                  href={`tel:${PHONE.replace(/\s/g, "")}`}
                  className="flex items-center gap-2.5 font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A] hover:text-[#F0EAD6] transition-colors duration-200 w-fit"
                >
                  <PhoneIcon />
                  {PHONE}
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <h3 className="text-[10px] tracking-[0.22em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
                {t.footer.hoursTitle}
              </h3>
              <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A] leading-[1.8] whitespace-pre-line">
                {t.footer.hoursValue}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1E1E1E]">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 py-4 flex items-center justify-between gap-4">
          <span className="font-[family-name:var(--font-dm-sans)] text-[11px] text-[#3A3A3A] tracking-[0.04em]">
            {t.footer.copyright}
          </span>
          <div className="w-8 h-px bg-[#C8A96E]/30" />
        </div>
      </div>

    </footer>
  );
}

function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="17" r="12.5" stroke="#C8A96E" strokeWidth="1.4" />
      <circle cx="20" cy="17" r="4"    stroke="#C8A96E" strokeWidth="1.4" />
      <path
        d="M2 33 C8 28.5, 13 37, 20 33 C27 29, 32 37.5, 38 33"
        stroke="#C8A96E" strokeWidth="1.4" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-[1px] flex-shrink-0">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
    </svg>
  );
}
