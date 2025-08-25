import { useEffect, useState } from "react";
import ThemeContext from "./Themes.context.tsx";
import { defaultTheme, type ThemeType } from "@/config/themes.config.ts";
import type { ProviderProps } from "../interface/Provider.types.ts";

const ThemesProvider = ({ children }: ProviderProps) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");
      return storedTheme ? (storedTheme as ThemeType) : defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemesProvider;
