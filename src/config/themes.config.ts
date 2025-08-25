export const themes = ["light", "dark"] as const;
export type ThemeType = (typeof themes)[number];
export const defaultTheme: ThemeType = "light";
