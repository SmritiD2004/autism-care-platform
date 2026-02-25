import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const THEMES = {
  dark: {
    // Backgrounds
    bgBase: "#080f1a",
    bgSurface: "#0c1622",
    bgCard: "#0f1d2c",
    bgElevated: "#132233",
    bgInput: "rgba(255,255,255,0.04)",

    // Text
    text1: "#eef2f7",
    text2: "#8fa3b8",
    text3: "#4a5f72",
    textTeal: "#2dd4bf",
    textDanger: "#f87171",
    textWarn: "#fbbf24",
    textSuccess: "#34d399",

    // Semantic
    danger: "#ef4444",
    dangerBg: "rgba(239,68,68,0.10)",
    dangerBorder: "rgba(239,68,68,0.22)",
    warn: "#f59e0b",
    warnBg: "rgba(245,158,11,0.10)",
    warnBorder: "rgba(245,158,11,0.22)",
    success: "#10b981",
    successBg: "rgba(16,185,129,0.10)",
    successBorder: "rgba(16,185,129,0.22)",

    // Borders
    borderXs: "rgba(255,255,255,0.05)",
    borderSm: "rgba(255,255,255,0.08)",
    borderMd: "rgba(255,255,255,0.13)",

    // Accent
    teal500: "#14b8a6",
    teal600: "#0d9488",
    blue500: "#3b82f6",
  },
  light: {
    // Backgrounds
    bgBase: "#f8fafc",
    bgSurface: "#f0f4f8",
    bgCard: "#e8eef5",
    bgElevated: "#dce5f0",
    bgInput: "rgba(0,0,0,0.05)",

    // Text
    text1: "#0f1923",
    text2: "#4a5f72",
    text3: "#8fa3b8",
    textTeal: "#0d9488",
    textDanger: "#991b1b",
    textWarn: "#92400e",
    textSuccess: "#065f46",

    // Semantic
    danger: "#dc2626",
    dangerBg: "rgba(239,68,68,0.12)",
    dangerBorder: "rgba(239,68,68,0.35)",
    warn: "#d97706",
    warnBg: "rgba(245,158,11,0.12)",
    warnBorder: "rgba(245,158,11,0.35)",
    success: "#059669",
    successBg: "rgba(16,185,129,0.12)",
    successBorder: "rgba(16,185,129,0.35)",

    // Borders
    borderXs: "rgba(0,0,0,0.06)",
    borderSm: "rgba(0,0,0,0.10)",
    borderMd: "rgba(0,0,0,0.15)",

    // Accent
    teal500: "#0d9488",
    teal600: "#0f766e",
    blue500: "#2563eb",
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "dark";
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    const colors = THEMES[theme];
    
    // Set CSS variables for theme colors
    Object.entries(colors).forEach(([key, value]) => {
      const cssVarName = `--theme-${key
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()
        .replace(/^-/, "")}`;
      root.style.setProperty(cssVarName, value);
    });

    // Save to localStorage
    localStorage.setItem("app-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: THEMES[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
