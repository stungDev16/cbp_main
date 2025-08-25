import type { ThemeType } from "@/config/themes.config";

export type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};
