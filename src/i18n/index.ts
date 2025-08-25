import en from "./translation/en.json";
import vi from "./translation/vi.json";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

export type LanguageCode = "vi" | "en";
const languageCodes: LanguageCode[] = ["vi", "en"];

export const languages: {
  [key in LanguageCode]: {
    nativeName: string;
  };
} = {
  vi: { nativeName: "Tiếng Việt" },
  en: { nativeName: "English" },
};

type ResourcesType = {
  [key in keyof typeof languages]: {
    translation: object;
  };
};

const resources: ResourcesType = {
  vi: {
    translation: vi,
  },
  en: {
    translation: en,
  },
};

export const defaultLanguage = languageCodes[0];

i18next.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
