import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { applyAppTheme, readAppTheme, type AppTheme } from "../utils/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<AppTheme>(readAppTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const next: AppTheme =
        document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      setTheme((prev) => (prev === next ? prev : next));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const next: AppTheme = theme === "dark" ? "light" : "dark";
    applyAppTheme(next, { animate: true });
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "切换到浅色护眼主题" : "切换到深紫主题"}
      title={theme === "dark" ? "切换到浅色护眼主题" : "切换到深紫主题"}
      className="flex h-8 w-8 items-center justify-center rounded-sm border border-edge bg-surface text-ink-2 transition hover:border-edge-2 hover:text-accent"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
