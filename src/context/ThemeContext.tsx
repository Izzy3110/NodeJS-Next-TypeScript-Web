"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import themeData from "@/app/theme.json"; // Default fallback

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  designSettings: Record<string, string>;
  refreshDesignSettings: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [designSettings, setDesignSettings] = useState<Record<string, string>>(themeData);

  const fetchDesignSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/design');
      if (res.ok) {
        const data = await res.json();
        const merged = { ...themeData, ...data };
        setDesignSettings(merged);
        
        // Apply to CSS variables on load
        Object.entries(merged).forEach(([key, value]) => {
          document.documentElement.style.setProperty(key, value as string);
        });
      }
    } catch (error) {
      console.error("Failed to fetch design settings:", error);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchDesignSettings();

    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, [fetchDesignSettings]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      designSettings, 
      refreshDesignSettings: fetchDesignSettings 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
