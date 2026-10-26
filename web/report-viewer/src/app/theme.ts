import { useEffect, useState } from "react";

export type ThemeName = "light" | "dark";

export function currentTheme(): ThemeName {
  if (typeof document === "undefined") {
    return "light";
  }
  if (document.documentElement.classList.contains("dark")) {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: ThemeName) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.body.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeName>("light");
  useEffect(() => {
    const initial = currentTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };
  return { theme, toggleTheme };
}
