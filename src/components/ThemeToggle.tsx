import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "fb-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark"),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "切换到浅色护眼主题" : "切换到深紫主题"}
      title={theme === "dark" ? "切换到浅色护眼主题" : "切换到深紫主题"}
      className="flex h-9 w-9 items-center justify-center rounded-sm border border-edge bg-surface text-ink-2 transition hover:border-edge-2 hover:text-accent"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}