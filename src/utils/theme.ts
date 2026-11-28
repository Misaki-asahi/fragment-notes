export type AppTheme = "light" | "dark";

const STORAGE_KEY = "fb-theme";
let switchingTimer: number | undefined;

/**
 * 安全读取当前生效的主题（兼容隐私模式或存储受限环境）
 */
export function readAppTheme(): AppTheme {
  if (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark") {
    return "dark";
  }
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/**
 * 切换全局主题并在切换期间挂载短暂过渡标记，保证全站色彩与渐变丝滑同步
 */
export function applyAppTheme(next: AppTheme, options?: { animate?: boolean }): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (options?.animate !== false && !reduceMotion) {
    root.dataset.themeSwitching = "true";
    if (switchingTimer !== undefined) {
      window.clearTimeout(switchingTimer);
    }
    switchingTimer = window.setTimeout(() => {
      delete root.dataset.themeSwitching;
      switchingTimer = undefined;
    }, 720);
  }

  root.dataset.theme = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // 隐私模式或存储受限时静默忽略
  }
}
