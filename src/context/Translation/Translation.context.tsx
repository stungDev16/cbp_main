import type { LanguageContextType } from "@/context/Translation/_interface/LanguageContextType";
import { defaultLanguage, languages } from "@/i18n";
import type { i18n } from "i18next";
import { createContext } from "react";

const defaultValue: LanguageContextType = {
  t: ((key: string) => key) as LanguageContextType["t"],
  i18n: {} as i18n,
  setLanguage: () => {},
  languages,
  lang: defaultLanguage,
};

const LanguageContext = createContext<LanguageContextType>(defaultValue);

export default LanguageContext;
