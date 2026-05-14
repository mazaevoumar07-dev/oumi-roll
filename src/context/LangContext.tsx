"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { LANGS, dictionaries, type Lang, type Dict } from "@/i18n";

interface LangContextValue {
  lang: Lang;
  t: Dict;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("FR");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && (LANGS as string[]).includes(saved)) setLangState(saved);
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    localStorage.setItem("lang", next);
    document.documentElement.lang = next.toLowerCase();
  }

  return (
    <LangContext.Provider value={{ lang, t: dictionaries[lang], setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
