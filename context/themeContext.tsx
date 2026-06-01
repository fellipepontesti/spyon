import { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  mudarTema: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);
const THEME_STORAGE_KEY = "themePreference";

function getPreferredTheme(): Theme {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      }
    });

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
        if (savedTheme !== "dark" && savedTheme !== "light") {
          setTheme(colorScheme === "dark" ? "dark" : "light");
        }
      });
    });

    const browserThemeQuery =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : undefined;

    const handleBrowserThemeChange = (event: MediaQueryListEvent) => {
      AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
        if (savedTheme !== "dark" && savedTheme !== "light") {
          setTheme(event.matches ? "dark" : "light");
        }
      });
    };

    browserThemeQuery?.addEventListener("change", handleBrowserThemeChange);

    return () => {
      subscription.remove();
      browserThemeQuery?.removeEventListener("change", handleBrowserThemeChange);
    };
  }, []);

  const mudarTema = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, mudarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return context;
}
