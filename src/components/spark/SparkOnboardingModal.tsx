import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  GitBranch,
  Layers,
  PenLine,
  Sparkles,
  Timer,
  X,
} from "lucide-react";

interface SparkOnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onEnterWorkspace: () => void;
}

interface OnboardingStep {
  badge: string;
  title: string;
  summary: string;
  tips: string[];
  icon: typeof PenLine;
  previewLabel: string;
  previewChips: string[];
}

const STEPS: OnboardingStep[] = [
  {
    badge: "STEP 01 · 极简录入",
    title: "像发动态一样随手记下一句话",
    summary:
      "在顶部输入框写下课堂片段或错题感悟，输入 #标签 自动识别归类；支持一键填入示例片段，也支持上传图片、PDF 或文本由 AI 自动提炼。",
    tips: [
      "快捷键 Ctrl / Cmd + Enter 一键发布成结构化卡片",
      "AI 自动补齐一句话结论、标签树归类与关键概念挖空点",
    ],
    icon: PenLine,
    previewLabel: "TCP 三次握手本质是双向收发能力的最小确认闭环 #计算机网络 #TCP",
    previewChips: ["自动归类 #计算机网络", "提取挖空关键词", "流式生成结论"],
  },
  {
    badge: "STEP 02 · 隐形关联与白板",
    title: "孤立的碎片会自动串联成专题",
    summary:
      "打字或点选任意笔记卡片时，右侧边栏实时浮现语义相近的历史碎片；切换「AI 专题白板」即可在点阵画布中分组浏览与对比易混概念。",
    tips: [
      "左侧支持两级 AI 自动标签树（如 #高数 下收敛 #极限、#微积分）",
      "白板内自带「A vs B 易混对照卡」，一眼分清高频考点差异",
    ],
    icon: GitBranch,
    previewLabel: "右侧上下文关联面板 · 实时计算相似度与共现锚点",
    previewChips: ["相似度 97%", "两级标签树", "易混概念对照"],
  },
  {
    badge: "STEP 03 · 交互式闪卡自测",
    title: "3 分钟 3D 翻卡与高亮挖空闭环",
    summary:
      "点击「开始 3 分钟自测」或单张卡片的「生成闪卡」，交替体验 3D 翻转概念卡与句内挖空自测，记不住的卡片会自动回到队尾循环巩固。",
    tips: [
      "Space 翻转/揭晓 · 按 1「没掌握，稍后再测」· 按 2「记住了」",
      "背面可随时点击「换个生活比喻」，全部通关生成今日战报卡片",
    ],
    icon: Layers,
    previewLabel: "自适应循环队列 + Streak 连胜 + 今日复习战报",
    previewChips: ["3D 概念翻卡", "Cloze 高亮挖空", "错题循环回队列"],
  },
  {
    badge: "STEP 04 · 专注节奏与自由配置",
    title: "番茄专注、双色主题与自带 Key",
    summary:
      "左侧栏内置番茄钟（15/25/45 分钟专注与 5 分钟休息）与 12 周记录热力图；顶部可切换暖白翡翠与深紫护眼主题，右上角支持配置自己的 API Key。",
    tips: [
      "不配置任何密钥也能离线完整体验内置跨学科碎片与自测",
      "所有笔记、星标与番茄钟记录均安全保存在本地浏览器",
    ],
    icon: Timer,
    previewLabel: "25:00 番茄专注 · 12 周热力矩阵 · 浅绿 / 深紫双主题",
    previewChips: ["离线可用", "BYOK 可选配置", "本地持久化"],
  },
];

export function SparkOnboardingModal({
  open,
  onClose,
  onEnterWorkspace,
}: SparkOnboardingModalProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
      } else if (e.key === "ArrowLeft") {
        setStepIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const current = STEPS[stepIndex];
  const Icon = current.icon;
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="SparkNote 新手引导"
    >
      <button
        type="button"
        aria-label="关闭新手引导"
        onClick={onClose}
        className="absolute inset-0 bg-void/75 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-edge bg-surface/95 p-6 shadow-2xl backdrop-blur-md sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border tint-ai px-3 py-1 font-mono text-[11px] font-bold">
            <Sparkles className="h-3 w-3" />
            {current.badge}
          </span>
          <button
            type="button"
            aria-label="关闭引导"
            onClick={onClose}
            className="rounded-lg border border-edge bg-surface-2/60 p-1.5 text-ink-3 transition-colors hover:border-edge-2 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border tint-accent text-accent">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-black tracking-tight text-ink sm:text-xl">
              {current.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{current.summary}</p>
          </div>
        </div>

        {/* 轻量示意图卡片 */}
        <div className="mt-5 rounded-xl border border-edge bg-surface-2/55 p-4">
          <p className="font-mono text-xs leading-relaxed text-ink">{current.previewLabel}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {current.previewChips.map((chip) => (
              <span
                key={chip}
                className="rounded-md border border-edge bg-surface px-2.5 py-1 text-[11px] font-semibold text-accent"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {current.tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs leading-relaxed text-ink-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-2" aria-hidden="true" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>

        {/* 底部步骤指示与翻页按钮 */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-edge/70 pt-4">
          <div className="flex items-center gap-1.5" role="tablist" aria-label="引导步骤">
            {STEPS.map((s, idx) => (
              <button
                key={s.badge}
                type="button"
                role="tab"
                aria-selected={idx === stepIndex}
                aria-label={`第 ${idx + 1} 步`}
                onClick={() => setStepIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === stepIndex ? "w-6 bg-accent-2" : "w-2 bg-edge-2 hover:bg-ink-3"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((i) => i - 1)}
                className="btn-secondary !px-3.5 !py-2 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                上一步
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEnterWorkspace();
                }}
                className="btn-primary !px-4 !py-2 text-xs sm:text-sm"
              >
                进入工作台
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStepIndex((i) => i + 1)}
                className="btn-primary !px-4 !py-2 text-xs sm:text-sm"
              >
                下一步
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
