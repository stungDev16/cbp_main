import type { languages } from "@i18n/index";
import type { i18n, TFunction } from "i18next";

export type LanguageContextType = {
  t: TFunction<"translation">;
  i18n: i18n;
  setLanguage: (lang: string) => void;
  languages: typeof languages;
  lang: keyof typeof languages;
};
