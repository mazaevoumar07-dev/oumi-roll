"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LangContext";
import { LANGS } from "@/i18n";

export default function Header() {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { user, logout } = useAuth();
  const { lang, t, setLang } = useLang();
  const dropRef = useRef<HTMLDivElement>(null);

  const NAV_LINKS = [
    { href: "#menu",    label: t.nav.menu },
    { href: "#about",   label: t.nav.about },
    { href: "#reviews", label: t.nav.reviews },
  ];

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setUserDropOpen(false);
    }
    document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  function closeMobileMenu() { setMenuOpen(false); }

  return (
    <>
      {/* ===== HEADER ===== */}
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50 h-[72px] border-b transition-all duration-200",
          scrolled
            ? "bg-[#0D0D0D]/88 backdrop-blur-md border-[#2A2A2A]/60"
            : "bg-[#0D0D0D] border-[#2A2A2A]",
        ].join(" ")}
      >
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 outline-offset-4" aria-label="OUMI ROLL — Accueil">
            <LogoIcon />
            <span className="flex flex-col leading-none gap-[3px]">
              <span className="font-[family-name:var(--font-cormorant)] font-bold text-[19px] tracking-[0.14em] text-[#F0EAD6] uppercase">
                OUMI
              </span>
              <span className="font-[family-name:var(--font-cormorant)] font-normal text-[11.5px] tracking-[0.32em] text-[#C8A96E] uppercase">
                ROLL
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-9" aria-label="Navigation principale">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="relative text-[12px] font-normal tracking-[0.12em] uppercase text-[#8A8A8A] hover:text-[#F0EAD6] transition-colors duration-200
                           after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-px after:bg-[#C8A96E]
                           after:scale-x-0 after:origin-left after:transition-transform after:duration-200
                           hover:after:scale-x-100"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Language switcher (from 640px) */}
            <div className="hidden sm:flex items-center gap-1 mr-1" aria-label={t.nav.changeLang}>
              {LANGS.map((l, i) => (
                <span key={l} className="flex items-center gap-1">
                  {i > 0 && <span className="text-[#2A2A2A] text-[12px] select-none">|</span>}
                  <button
                    onClick={() => setLang(l)}
                    className={[
                      "text-[11.5px] tracking-[0.06em] px-0.5 py-1 transition-colors duration-200",
                      lang === l ? "text-[#C8A96E]" : "text-[#8A8A8A] hover:text-[#C8A96E]",
                    ].join(" ")}
                  >
                    {l}
                  </button>
                </span>
              ))}
            </div>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center w-10 h-10 text-[#8A8A8A] hover:text-[#C8A96E] hover:bg-[#C8A96E]/8 rounded-[4px] transition-colors duration-200"
              aria-label={`${t.cart.title} (${itemCount})`}
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute top-[5px] right-[5px] min-w-[16px] h-4 px-1 bg-[#C8A96E] text-[#0D0D0D] text-[10px] font-medium leading-4 text-center rounded-full">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Login / User (desktop only) */}
            {user ? (
              <div ref={dropRef} className="relative hidden lg:block">
                <button
                  onClick={() => setUserDropOpen(v => !v)}
                  className="flex items-center gap-2 px-[14px] py-[9px] border border-[#C8A96E]/60 text-[#C8A96E] text-[12.5px] tracking-[0.04em] rounded-[4px] hover:bg-[#C8A96E]/10 hover:border-[#C8A96E] transition-all duration-200"
                >
                  <UserIcon />
                  <span className="max-w-[90px] truncate">{user.prenom}</span>
                </button>
                {userDropOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-44 bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] overflow-hidden shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-[#2A2A2A]">
                      <p className="text-[12px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] truncate">{user.prenom} {user.nom}</p>
                      <p className="text-[11px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] truncate mt-0.5">{user.telephone}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setUserDropOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] text-[#8A8A8A] hover:text-[#F0EAD6] hover:bg-[#2A2A2A] transition-colors font-[family-name:var(--font-dm-sans)]"
                    >
                      <LogoutIcon />
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/connexion"
                className="hidden lg:flex items-center gap-2 px-[18px] py-[9px] border border-[#C8A96E]/60 text-[#C8A96E] text-[12.5px] tracking-[0.06em] rounded-[4px] hover:bg-[#C8A96E]/10 hover:border-[#C8A96E] transition-all duration-200"
              >
                <UserIcon />
                <span>{t.nav.login}</span>
              </Link>
            )}

            {/* Burger (mobile only) */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="lg:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10 p-[10px] rounded-[4px] hover:bg-[#C8A96E]/8 transition-colors duration-200"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
            >
              <span className={`block w-5 h-[1.5px] bg-[#F0EAD6] rounded-sm origin-center transition-transform duration-250 ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-[#F0EAD6] rounded-sm transition-all duration-250 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-[#F0EAD6] rounded-sm origin-center transition-transform duration-250 ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
            </button>

          </div>
        </div>
      </header>

      {/* ===== MOBILE MENU ===== */}
      <div
        className={[
          "fixed top-[72px] left-0 right-0 bottom-0 z-40 bg-[#0D0D0D] border-t border-[#2A2A2A]",
          "flex flex-col gap-12 px-7 pt-12 pb-10 overflow-y-auto",
          "transition-transform duration-300 ease-in-out lg:hidden",
          menuOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none",
        ].join(" ")}
        aria-hidden={!menuOpen}
      >
        {/* Nav links */}
        <nav className="flex flex-col" aria-label="Menu mobile">
          {NAV_LINKS.map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              onClick={closeMobileMenu}
              className={[
                "font-[family-name:var(--font-cormorant)] text-[36px] font-normal tracking-[0.04em] text-[#8A8A8A] hover:text-[#F0EAD6]",
                "py-[14px] border-b border-[#2A2A2A] transition-colors duration-200",
                i === 0 ? "border-t" : "",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Language */}
        <div className="flex items-center gap-2.5">
          {LANGS.map((l, i) => (
            <span key={l} className="flex items-center gap-2.5">
              {i > 0 && <span className="text-[#2A2A2A] text-sm select-none">|</span>}
              <button
                onClick={() => { setLang(l); closeMobileMenu(); }}
                className={[
                  "text-sm tracking-[0.1em] py-1 transition-colors duration-200",
                  lang === l ? "text-[#C8A96E]" : "text-[#8A8A8A] hover:text-[#C8A96E]",
                ].join(" ")}
              >
                {l}
              </button>
            </span>
          ))}
        </div>

        {/* Login / user */}
        {user ? (
          <div className="flex flex-col gap-2">
            <p className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A]">
              {user.prenom} {user.nom}
            </p>
            <button
              onClick={() => { logout(); closeMobileMenu(); }}
              className="flex items-center justify-center gap-2 w-full px-6 py-[13px] border border-[#2A2A2A] text-[#8A8A8A] text-[12.5px] tracking-[0.06em] rounded-[4px] hover:border-[#C0392B]/40 hover:text-[#C0392B] transition-all duration-200 font-[family-name:var(--font-dm-sans)]"
            >
              <LogoutIcon />
              <span>{t.nav.logout}</span>
            </button>
          </div>
        ) : (
          <Link
            href="/connexion"
            onClick={closeMobileMenu}
            className="flex items-center justify-center gap-2 w-full px-6 py-[13px] border border-[#C8A96E]/60 text-[#C8A96E] text-[12.5px] tracking-[0.06em] rounded-[4px] hover:bg-[#C8A96E]/10 hover:border-[#C8A96E] transition-all duration-200 font-[family-name:var(--font-dm-sans)]"
          >
            <UserIcon />
            <span>{t.nav.login}</span>
          </Link>
        )}
      </div>
    </>
  );
}

/* ===== SVG Icons ===== */

function LogoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="17" r="12.5" stroke="#C8A96E" strokeWidth="1.4" />
      <circle cx="20" cy="17" r="4"    stroke="#C8A96E" strokeWidth="1.4" />
      <path
        d="M2 33 C8 28.5, 13 37, 20 33 C27 29, 32 37.5, 38 33"
        stroke="#C8A96E" strokeWidth="1.4" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
