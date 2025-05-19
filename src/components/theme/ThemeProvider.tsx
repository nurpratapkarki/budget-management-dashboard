
import { createContext, useContext, useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: string;
  setTheme: (theme: string) => void;
  isDarkMode: boolean;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { theme, setTheme } = useNextTheme();

  useEffect(() => {
    const currentTheme = theme || localStorage.getItem('theme') || 'system';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setIsDarkMode(
      currentTheme === 'dark' || 
      (currentTheme === 'system' && systemPrefersDark)
    );
  }, [theme]);

  return (
    <ThemeProviderContext.Provider
      value={{
        theme: theme || "system",
        setTheme,
        isDarkMode,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
