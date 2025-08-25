import { defaultTheme } from "@/config/themes.config";
import type { ThemeContextType } from "@/context/Themes/_interface/ThemeContextType";
import { createContext } from "react";

const defaultValue: ThemeContextType = {
  theme: defaultTheme,
  setTheme: () => {},
};
const ThemesContext = createContext<ThemeContextType>(defaultValue);

export default ThemesContext;
