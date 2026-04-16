import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LangCode, LANGUAGES } from "./i18n";

interface LangCtx {
  lang: LangCode;
  setLang: (l: LangCode) => void;
}

const LS_KEY = "st_lang";

const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    const stored = localStorage.getItem(LS_KEY) as LangCode | null;
    if (stored && LANGUAGES.some(l => l.code === stored)) return stored;
    const browser = navigator.language.slice(0, 2).toLowerCase() as LangCode;
    if (LANGUAGES.some(l => l.code === browser)) return browser;
    return "en";
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: LangCode) => setLangState(l);

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}
