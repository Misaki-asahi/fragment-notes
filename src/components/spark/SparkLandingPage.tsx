import { useState } from "react";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { SparkDualWings } from "./SparkDualWings";
import { SparkOnboardingModal } from "./SparkOnboardingModal";
import { SparkShardCanvas } from "./SparkShardCanvas";

interface SparkLandingPageProps {
  onEnter: () => void;
}

export function SparkLandingPage({ onEnter }: SparkLandingPageProps) {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <div className="site-shell theme-smooth relative flex min-h-screen flex-col overflow-hidden bg-void text-ink">
      {/* 动态背景：浅色纸飞机 ↔ 深紫碎玻璃平滑过渡 */}
      <SparkShardCanvas />

      {/* 顶部柔和环境光斑，保留中下层通透留白 */}
      <div
        aria-hidden="true"
        className="light-spot pointer-events-none fixed inset-x-0 top-0 z-0 h-[58vh] transition-opacity duration-700"
      />

      {/* 极简顶部栏 */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3.5 sm:px-10 sm:py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-3 text-white shadow-sm transition-colors duration-500">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <span className="block text-sm font-black tracking-tight text-ink transition-colors duration-500">SparkNote</span>
            <span className="block text-[11px] font-semibold text-ink-3 transition-colors duration-500">拾光碎片笔记</span>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* 主视觉入口区 + 下方双色六翼天使光翼 */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-between px-6 pb-5 pt-2 text-center sm:pt-4">
        <div className="landing-fade-in max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface/80 px-3.5 py-1 text-xs font-bold text-accent shadow-xs backdrop-blur-md transition-colors duration-500">
            <Sparkles className="h-3.5 w-3.5 text-ai transition-colors duration-500" aria-hidden="true" />
            极简录入 · AI 隐形关联 · 3D 闪卡自测
          </span>

          <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-ink transition-colors duration-500 sm:text-5xl sm:leading-[1.18]">
            接住每一次闪念，
            <span className="block text-accent transition-colors duration-500">让碎片自然长成体系</span>
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-ink-2 transition-colors duration-500 sm:text-base">
            散落的课堂要点、灵光一现与错题反思，在这里被轻柔接住、自动串联，并在 3 分钟自测中化为长久记忆。
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onEnter}
              className="btn-primary !rounded-xl !px-6 !py-3 text-sm sm:text-base"
            >
              进入工作台
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="btn-secondary !rounded-xl !bg-surface/80 !px-5 !py-3 text-sm backdrop-blur-md sm:text-base"
            >
              <Compass className="h-4 w-4 text-ai" aria-hidden="true" />
              新手引导
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-ink-3 transition-colors duration-500">
            <span>Ctrl / Cmd + Enter 速记</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>自动标签树与白板聚类</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>离线开箱即用</span>
          </div>
        </div>

        <SparkDualWings />
      </main>

      <SparkOnboardingModal
        key={guideOpen ? "open" : "closed"}
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onEnterWorkspace={onEnter}
      />
    </div>
  );
}
