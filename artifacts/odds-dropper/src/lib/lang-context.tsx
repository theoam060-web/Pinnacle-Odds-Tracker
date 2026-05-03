import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type LangCode, LANGUAGES } from "./i18n";

const STORAGE_KEY = "st_lang";

function detectLang(): LangCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (stored && LANGUAGES.some(l => l.code === stored)) return stored;
    const browser = navigator.language.slice(0, 2).toLowerCase();
    const match = LANGUAGES.find(l => l.code === browser);
    return match ? match.code : "en";
  } catch {
    return "en";
  }
}

interface LangContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
}

const LangContext = createContext<LangContextValue>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(detectLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, [lang]);

  const setLang = (l: LangCode) => {
    setLangState(l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export { LANGUAGES };
export type { LangCode };
