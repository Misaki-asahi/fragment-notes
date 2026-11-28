import { useEffect, useState } from "react";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { readAppTheme, type AppTheme } from "../../utils/theme";
import { SparkDualWings } from "./SparkDualWings";
import { SparkLandingScenery } from "./SparkLandingScenery";
import { SparkShardCanvas } from "./SparkShardCanvas";

interface SparkLandingPageProps {
  onEnter: () => void;
  onStartTour: () => void;
  exiting?: boolean;
}

export function SparkLandingPage({
  onEnter,
  onStartTour,
  exiting = false,
}: SparkLandingPageProps) {
  const [theme, setTheme] = useState<AppTheme>(readAppTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const next = readAppTheme();
      setTheme((prev) => (prev === next ? prev : next));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const isDark = theme === "dark";

  return (
    <div
      className={`site-shell theme-smooth relative flex min-h-screen flex-col overflow-hidden bg-void text-ink ${
        exiting ? "animate-[landing-fade-in_0.22s_ease-out_reverse_forwards]" : ""
      }`}
    >
      {/* 动态背景：浅色纸飞机 ↔ 深紫碎玻璃平滑过渡 */}
      <SparkShardCanvas />

      {/* 顶部双层静态柔和环境光斑，切换主题时交叉淡入淡出避免渐变瞬跳 */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[58vh] transition-opacity duration-700 ease-out"
        style={{
          opacity: isDark ? 0 : 1,
          background:
            "radial-gradient(50% 50%, rgba(16, 185, 129, 0.08) 20%, rgba(16, 185, 129, 0) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[58vh] transition-opacity duration-700 ease-out"
        style={{
          opacity: isDark ? 1 : 0,
          background:
            "radial-gradient(50% 50%, rgba(126, 79, 255, 0.14) 20%, rgba(126, 79, 255, 0) 100%)",
        }}
      />

      {/* 右上角六翼角标（兼作深紫 / 暖白主题切换） */}
      <SparkDualWings />

      {/* 极简顶部栏 */}
      <header className="relative z-10 flex w-full items-center justify-between px-6 py-3.5 sm:px-10 sm:py-4">
        <div className="flex items-center gap-2.5">
          <img
            src="./app-icon.jpg"
            alt=""
            draggable={false}
            className="h-9 w-9 shrink-0 rounded-xl border border-edge/80 object-cover shadow-sm"
          />
          <div className="leading-tight">
            <span className="block text-sm font-black tracking-tight text-ink">SparkNote</span>
            <span className="block text-[11px] font-semibold text-ink-3">拾光·碎片笔记</span>
          </div>
        </div>
      </header>

      {/* 主视觉入口区 */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-start px-6 pb-5 pt-20 text-center sm:pt-32">
        <div className="landing-fade-in max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface/80 px-3.5 py-1 text-xs font-bold text-accent shadow-xs backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-ai" aria-hidden="true" />
            简单录入 · AI 注解 · 闪卡自测
          </span>

          <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-ink sm:text-5xl sm:leading-[1.18]">
            抓住一闪而过的想法
            <span className="block text-accent">让碎片深根发芽</span>
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-ink-2 sm:text-base">
            零散的课堂要点、灵光一现亦或是错题记录，都可以在这里被轻松拾起、串联，并在 3 分钟自测中化为长久记忆。
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onEnter}
              className="btn-primary !rounded-xl !px-6 !py-3 text-sm sm:text-base"
            >
              开始记忆
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onStartTour}
              className="btn-secondary !rounded-xl !bg-surface/80 !px-5 !py-3 text-sm backdrop-blur-md sm:text-base"
            >
              <Compass className="h-4 w-4 text-ai" aria-hidden="true" />
              新手引导
            </button>
          </div>
        </div>
      </main>

      <SparkLandingScenery />
    </div>
  );
}
