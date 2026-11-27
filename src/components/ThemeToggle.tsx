import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "fb-theme";

function readTheme(): "dark" | "light" {
  try {
    return document.documentElement.dataset.theme === "dark" ||
      localStorage.getItem(STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // 隐私模式或存储受限时静默忽略
    }
  }, [theme]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const next = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      setTheme((prev) => (prev === next ? prev : next));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

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
