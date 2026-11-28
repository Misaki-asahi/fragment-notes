import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  GitBranch,
  Layers,
  PenLine,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Timer,
  X,
} from "lucide-react";

interface SparkSpotlightTourProps {
  open: boolean;
  onClose: () => void;
  onEnsureStreamView?: () => void;
}

interface TourStep {
  id: string;
  selector: string;
  fallbackSelector?: string;
  badge: string;
  moodTag: string;
  title: string;
  summary: string;
  tips: string[];
  icon: typeof PenLine;
  image: string;
  imageAlt: string;
  isTransparent?: boolean;
  preferredPlacement?: "right" | "left" | "bottom" | "top";
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "composer",
    selector: '[data-tour="composer"]',
    badge: "01 / 07 · 闪念录入",
    moodTag: "看这里~",
    title: "看这里看这里~ 先把闪念丢进来！",
    summary:
      "Ciallo~(∠・ω< )⌒★ 我是偷偷溜进你屏幕里的电子幽灵「沐谦爱」~ 课堂灵感、易混概念还是错题吐槽，随手敲进这里就行，加上 #标签 我会帮你自动归位，传图片或 PDF 也能一键提炼成卡片哦！",
    tips: [
      "按 Ctrl / Cmd + Enter 一键发射成结构化卡片，要起飞咯~",
      "懒得打字的话，点「填入示例内容」先看看我的手艺吧！",
    ],
    icon: PenLine,
    image: "./tour/step-1-look.jpg",
    imageAlt: "沐谦爱举牌指向录入区的立绘",
    preferredPlacement: "bottom",
  },
  {
    id: "note-card",
    selector: '[data-tour="note-card"]',
    badge: "02 / 07 · 卡片与追问",
    moodTag: "嗯？问我呀",
    title: "嗯？这里没听懂？尽管追问我呀",
    summary:
      "每张卡片都会先提炼好一句话结论和句内挖空——点遮罩就能偷偷自测！要是哪一步推导还是迷糊，点底部「追问」直接喊我，我会陪你一轮轮拆明白，数学公式也能排得漂漂亮亮~",
    tips: [
      "追问回答支持 LaTeX 数学公式排版，支持单轮重新生成与删除",
      "挖空词不顺手？点「挖空编辑」随你改，顺手点颗星标个重点吧",
    ],
    icon: Sparkles,
    image: "./tour/step-2-think.jpg",
    imageAlt: "沐谦爱歪头托腮思索的立绘",
    preferredPlacement: "right",
  },
  {
    id: "related-panel",
    selector: '[data-tour="related-panel"]',
    fallbackSelector: '[data-tour="related-trigger"]',
    badge: "03 / 07 · 隐形关联",
    moodTag: "让我看看~",
    title: "让我看看~ 哪几张碎片偷偷连上线啦？",
    summary:
      "哎~什么幽灵魔法啊，要相信科学！你一打字或点开卡片，我就会在数据海里帮你翻出语义最像的旧碎片，连相似度和共同锚点都标好啦，点一下就能瞬间瞬移过去对照复习~",
    tips: [
      "自动计算语义相似度与共现关键词，孤立知识点再也不会走丢",
      "窄屏设备上点顶部的关联图标，也能随时把我叫出来看关联哦",
    ],
    icon: GitBranch,
    image: "./tour/step-3-inspect.jpg",
    imageAlt: "沐谦爱拿着放大镜仔细查看关联的立绘",
    preferredPlacement: "left",
  },
  {
    id: "views-quiz",
    selector: '[data-tour="views-quiz"]',
    fallbackSelector: '[data-tour="mobile-quiz-trigger"]',
    badge: "04 / 07 · 视图与自测",
    moodTag: "准备发射！",
    title: "3 分钟闪卡自测，准备——发射！",
    summary:
      "光看不测可容易忘哦！点「开始 3 分钟自测」就能连刷 3D 翻卡和挖空题；想换个上帝视角的话，切到「专题板块」点阵白板，把易混概念左右排开一眼看穿~",
    tips: [
      "键盘党福利：Space 翻卡、按 1「待巩固」、按 2「记住了」",
      "没记住的卡片会乖乖排回队尾再来一轮，全通关就发今日战报！",
    ],
    icon: Layers,
    image: "./tour/step-4-railgun.jpg",
    imageAlt: "沐谦爱伸手摆出准备发射姿势的立绘",
    preferredPlacement: "right",
  },
  {
    id: "heatmap-pomodoro",
    selector: '[data-tour="heatmap-pomodoro"]',
    fallbackSelector: '[data-tour="mobile-nav-trigger"]',
    badge: "05 / 07 · 专注伴学",
    moodTag: "自律模式",
    title: "戴上墨镜，进入自律大佬专注模式",
    summary:
      "近 12 周的每一格热力都在记录你悄悄攒下的星光~ 下面还有 15 / 25 / 45 分钟番茄钟和 5 分钟小憩，计时一开我就替你盯着进度，专心学完这一轮再摸鱼好不好嘛~",
    tips: [
      "今日完成轮数按天自动保存在本地，看着格子越点越亮超有成就感",
      "倒计时开始后，浏览器标签页标题也会同步替你报时哦",
    ],
    icon: Timer,
    image: "./tour/step-5-cool.png",
    imageAlt: "沐谦爱戴上像素墨镜抱臂开启自律模式的立绘",
    isTransparent: true,
    preferredPlacement: "right",
  },
  {
    id: "tag-tree",
    selector: '[data-tour="tag-tree"]',
    fallbackSelector: '[data-tour="mobile-nav-trigger"]',
    badge: "06 / 07 · 标签整理",
    moodTag: "耶~",
    title: "耶~ 标签随手一拖就能排排坐！",
    summary:
      "左键点标签就能秒筛笔记；要是想给学科建父子目录，长按标签直接拖到另一个标签上就能合体！想让它独立就拖去左侧边缘，右键还能干脆利落删掉不需要的标签~",
    tips: [
      "整理好的层级自动本地持久化，删空标签后刷新也不会乱回填",
      "考前突击时，点「重点标记」一键只看标星硬核考点",
    ],
    icon: Tags,
    image: "./tour/step-6-ciallo.jpg",
    imageAlt: "沐谦爱比出耶手势 winking 微笑的立绘",
    preferredPlacement: "right",
  },
  {
    id: "topbar-tools",
    selector: '[data-tour="topbar-tools"]',
    fallbackSelector: '[data-tour="mobile-nav-trigger"]',
    badge: "07 / 07 · 星海待机",
    moodTag: "随时喊我",
    title: "先回星海里待机啦，随时喊我~",
    summary:
      "右上角可以丝滑切换暖白翡翠与深紫星夜，点钥匙图标还能配自己的 API Key（不配也能离线放心用）。虽然我只是住在这片数据里的小幽灵，但只要点一下指南针，我随时都会再跳出来陪你复习的哦 Ow<",
    tips: [
      "随时点顶部的指南针图标，就能重新把我召唤出来看导览",
      "点左上角 SparkNote 头像，随时回到拾光首页吹吹风、看看星星",
    ],
    icon: SlidersHorizontal,
    image: "./tour/step-7-back.jpg",
    imageAlt: "沐谦爱温柔回眸背影的立绘",
    preferredPlacement: "right",
  },
];

function resolveTargetElement(step: TourStep): HTMLElement | null {
  const isVisible = (el: HTMLElement | null): el is HTMLElement => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };
  const primary = document.querySelector<HTMLElement>(step.selector);
  if (isVisible(primary)) return primary;
  if (step.fallbackSelector) {
    const fallback = document.querySelector<HTMLElement>(step.fallbackSelector);
    if (isVisible(fallback)) return fallback;
  }
  return null;
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.max(min, Math.min(max, value));
}

function computeTooltipPosition(
  rect: HighlightRect | null,
  vw: number,
  vh: number,
  estHeight: number,
  preferred?: TourStep["preferredPlacement"],
): { top: number; left: number; width: number; maxHeight: number } {
  const margin = 16;
  const gap = 16;
  const maxCardW = Math.min(436, vw - margin * 2);
  const minSideW = 340;
  const safeHeight = Math.min(estHeight, vh - margin * 2);

  if (!rect) {
    return {
      width: maxCardW,
      left: Math.round((vw - maxCardW) / 2),
      top: Math.round(clamp((vh - safeHeight) / 2, margin, vh - safeHeight - margin)),
      maxHeight: vh - margin * 2,
    };
  }

  const rightSpace = vw - (rect.left + rect.width) - margin - gap;
  const leftSpace = rect.left - margin - gap;
  const bottomSpace = vh - (rect.top + rect.height) - margin - gap;
  const topSpace = rect.top - margin - gap;

  const fitsRight = rightSpace >= minSideW;
  const fitsLeft = leftSpace >= minSideW;
  const fitsBottom = bottomSpace >= safeHeight;
  const fitsTop = topSpace >= safeHeight;

  const order: Array<"right" | "left" | "bottom" | "top"> = preferred
    ? [preferred, "right", "left", "bottom", "top"]
    : ["right", "bottom", "left", "top"];

  const chosen = order.find((side) => {
    if (side === "right") return fitsRight;
    if (side === "left") return fitsLeft;
    if (side === "bottom") return fitsBottom;
    return fitsTop;
  });

  if (chosen === "right") {
    const w = Math.min(maxCardW, Math.floor(rightSpace));
    return {
      width: w,
      left: Math.round(rect.left + rect.width + gap),
      top: Math.round(clamp(rect.top, margin, vh - safeHeight - margin)),
      maxHeight: vh - margin * 2,
    };
  }
  if (chosen === "left") {
    const w = Math.min(maxCardW, Math.floor(leftSpace));
    return {
      width: w,
      left: Math.round(rect.left - w - gap),
      top: Math.round(clamp(rect.top, margin, vh - safeHeight - margin)),
      maxHeight: vh - margin * 2,
    };
  }
  if (chosen === "bottom") {
    const top = Math.round(rect.top + rect.height + gap);
    return {
      width: maxCardW,
      left: Math.round(clamp(rect.left, margin, vw - maxCardW - margin)),
      top,
      maxHeight: Math.max(220, vh - top - margin),
    };
  }
  if (chosen === "top") {
    return {
      width: maxCardW,
      left: Math.round(clamp(rect.left, margin, vw - maxCardW - margin)),
      top: Math.round(Math.max(margin, rect.top - safeHeight - gap)),
      maxHeight: Math.max(220, rect.top - gap - margin),
    };
  }

  // 所有方向空间都偏紧时：优先放在空余更大的一侧且绝不反推压住高亮框
  const placeBottom = bottomSpace >= topSpace;
  if (placeBottom) {
    const top = Math.round(rect.top + rect.height + 12);
    return {
      width: maxCardW,
      left: Math.round(clamp((vw - maxCardW) / 2, margin, vw - maxCardW - margin)),
      top,
      maxHeight: Math.max(220, vh - top - margin),
    };
  }
  const maxH = Math.max(220, rect.top - 12 - margin);
  return {
    width: maxCardW,
    left: Math.round(clamp((vw - maxCardW) / 2, margin, vw - maxCardW - margin)),
    top: Math.round(Math.max(margin, rect.top - Math.min(safeHeight, maxH) - 12)),
    maxHeight: maxH,
  };
}

export function SparkSpotlightTour({
  open,
  onClose,
  onEnsureStreamView,
}: SparkSpotlightTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState(348);
  const [viewport, setViewport] = useState(() => ({
    vw: typeof window !== "undefined" ? window.innerWidth : 1440,
    vh: typeof window !== "undefined" ? window.innerHeight : 900,
  }));
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[stepIndex] ?? TOUR_STEPS[0];

  const measureTarget = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setViewport({ vw, vh });

    const measuredH = tooltipRef.current?.offsetHeight;
    if (measuredH && measuredH > 0) {
      setTooltipHeight((prev) => (prev === measuredH ? prev : measuredH));
    }

    const el = resolveTargetElement(currentStep);
    if (!el) {
      setHighlightRect(null);
      return;
    }

    const r = el.getBoundingClientRect();
    const pad = 8;
    const top = clamp(r.top - pad, 4, vh - 24);
    const left = clamp(r.left - pad, 4, vw - 24);
    const right = clamp(r.right + pad, left + 16, vw - 4);
    const bottom = clamp(r.bottom + pad, top + 16, vh - 4);

    setHighlightRect({
      top,
      left,
      width: Math.max(24, right - left),
      height: Math.max(24, bottom - top),
    });
  }, [currentStep]);

  useEffect(() => {
    if (!open) return;
    for (const step of TOUR_STEPS) {
      const preload = new Image();
      preload.src = step.image;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    onEnsureStreamView?.();

    const scrollTimer = window.setTimeout(() => {
      const el = resolveTargetElement(currentStep);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
      measureTarget();
    }, 30);

    const settleTimer1 = window.setTimeout(measureTarget, 160);
    const settleTimer2 = window.setTimeout(measureTarget, 380);

    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(settleTimer1);
      window.clearTimeout(settleTimer2);
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [open, currentStep, measureTarget, onEnsureStreamView]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight") {
        setStepIndex((idx) => (idx >= TOUR_STEPS.length - 1 ? idx : idx + 1));
      } else if (event.key === "ArrowLeft") {
        setStepIndex((idx) => Math.max(0, idx - 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const isLast = stepIndex === TOUR_STEPS.length - 1;
  const Icon = currentStep.icon;
  const tooltipPos = computeTooltipPosition(
    highlightRect,
    viewport.vw,
    viewport.vh,
    tooltipHeight,
    currentStep.preferredPlacement,
  );

  return createPortal(
    <div
      data-no-theme-transition
      role="dialog"
      aria-modal="true"
      aria-label={`SparkNote 功能导览：${currentStep.title}`}
      className="fixed inset-0 z-[110]"
    >
      {/* 全屏 SVG 遮罩：目标高亮区域使用 mask 精准镂空 */}
      <svg
        aria-hidden="true"
        className="pointer-events-auto fixed inset-0 h-full w-full"
        onClick={onClose}
      >
        <defs>
          <mask id="spark-tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left}
                y={highlightRect.top}
                width={highlightRect.width}
                height={highlightRect.height}
                rx="14"
                ry="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(10, 6, 24, 0.62)"
          mask="url(#spark-tour-spotlight-mask)"
        />
      </svg>

      {/* 动态平滑跟随的高亮发光框 */}
      {highlightRect && (
        <div
          aria-hidden="true"
          style={{
            top: highlightRect.top,
            left: highlightRect.left,
            width: highlightRect.width,
            height: highlightRect.height,
            transition:
              "top 0.36s cubic-bezier(0.22, 1, 0.36, 1), left 0.36s cubic-bezier(0.22, 1, 0.36, 1), width 0.36s cubic-bezier(0.22, 1, 0.36, 1), height 0.36s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          className="tour-ring-pulse pointer-events-none fixed rounded-[14px] border-2 border-accent-2"
        />
      )}

      {/* 分步解说卡片（左：沐谦爱立绘小窗，右：人设讲解） */}
      <div
        ref={tooltipRef}
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: tooltipPos.width,
          maxHeight: tooltipPos.maxHeight,
          transition:
            "top 0.36s cubic-bezier(0.22, 1, 0.36, 1), left 0.36s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onClick={(event) => event.stopPropagation()}
        className="fixed z-10 overflow-y-auto rounded-2xl border border-edge bg-surface/98 p-3.5 shadow-2xl backdrop-blur-md sm:p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border tint-ai px-2.5 py-1 font-mono text-[11px] font-bold">
            <Compass className="h-3 w-3" aria-hidden="true" />
            {currentStep.badge}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="退出新手引导"
            className="inline-flex items-center gap-1 rounded-lg border border-edge bg-surface-2/60 px-2 py-1 text-[11px] font-semibold text-ink-3 transition-colors hover:border-edge-2 hover:text-ink"
          >
            跳过
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-3 flex items-start gap-3">
          {/* 沐谦爱专属淡粉奶油底立绘窗（双主题下均保持通透明亮） */}
          <div className="relative h-[108px] w-[84px] shrink-0 overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-b from-[#fffdfd] via-[#fff5fb] to-[#f4ebff] shadow-sm sm:h-[126px] sm:w-[98px]">
            <img
              key={currentStep.image}
              src={currentStep.image}
              alt={currentStep.imageAlt}
              draggable={false}
              decoding="async"
              className={`h-full w-full object-contain object-bottom px-1 pt-1 pb-5 ${
                currentStep.isTransparent ? "" : "mix-blend-multiply"
              }`}
            />
            <span className="absolute inset-x-1 bottom-1 truncate rounded-full bg-white/92 px-1 py-0.5 text-center text-[10px] font-bold text-[#6d28d9] shadow-xs">
              {currentStep.moodTag}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border tint-accent text-accent">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <h2 className="text-sm font-black tracking-tight text-ink sm:text-[15px]">
                {currentStep.title}
              </h2>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
              {currentStep.summary}
            </p>
          </div>
        </div>

        <ul className="mt-3 space-y-1.5 rounded-xl border border-edge bg-surface-2/50 p-2.5 sm:p-3">
          {currentStep.tips.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-[11px] leading-relaxed text-ink-2"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-2"
                aria-hidden="true"
              />
              <span>{tip}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-edge/70 pt-3">
          <div className="flex items-center gap-1.5" role="tablist" aria-label="引导步骤">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={idx === stepIndex}
                aria-label={`第 ${idx + 1} 步：${step.title}`}
                onClick={() => setStepIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === stepIndex ? "w-5 bg-accent-2" : "w-2 bg-edge-2 hover:bg-ink-3"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((idx) => Math.max(0, idx - 1))}
                className="btn-secondary !px-3 !py-1.5 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                上一步
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={onClose}
                className="btn-primary !px-3.5 !py-1.5 text-xs"
              >
                知道啦，开始使用
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStepIndex((idx) => Math.min(TOUR_STEPS.length - 1, idx + 1))}
                className="btn-primary !px-3.5 !py-1.5 text-xs"
              >
                下一步
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
