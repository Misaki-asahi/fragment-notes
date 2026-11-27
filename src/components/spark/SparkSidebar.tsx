import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Flame,
  Hash,
  KeyRound,
  LayoutGrid,
  Layers,
  ListFilter,
  Sparkles,
  Star,
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import type { HeatmapCell, TagTreeNode } from "./sparkData";
import { SparkPomodoro } from "./SparkPomodoro";
import type { PomodoroController } from "./usePomodoro";

export type SparkView = "stream" | "clusters" | "quiz";

interface SparkSidebarProps {
  view: SparkView;
  onChangeView: (view: SparkView) => void;
  onStartQuiz: () => void;
  heatmap: HeatmapCell[];
  noteCount: number;
  tagTree: TagTreeNode[];
  totalTagCount: number;
  selectedTag: string | null;
  onlyStarred: boolean;
  onSelectTag: (tag: string | null) => void;
  onToggleStarred: () => void;
  hasByok: boolean;
  onOpenSettings: () => void;
  quizCount: number;
  pomodoro: PomodoroController;
  onReturnLanding?: () => void;
}

export function SparkSidebar({
  view,
  onChangeView,
  onStartQuiz,
  heatmap,
  noteCount,
  tagTree,
  totalTagCount,
  selectedTag,
  onlyStarred,
  onSelectTag,
  onToggleStarred,
  hasByok,
  onOpenSettings,
  quizCount,
  pomodoro,
  onReturnLanding,
}: SparkSidebarProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(() => new Set(["高数"]));
  const activeDays = heatmap.filter((c) => c.count > 0).length;

  const baseNodes = showAllTags ? tagTree : tagTree.slice(0, 6);
  const visibleNodes =
    !showAllTags &&
    selectedTag &&
    !baseNodes.some((n) => n.tag === selectedTag || n.children.some((c) => c.tag === selectedTag))
      ? [
          ...baseNodes,
          ...tagTree.filter(
            (n) => n.tag === selectedTag || n.children.some((c) => c.tag === selectedTag),
          ),
        ]
      : baseNodes;
  const hiddenNodeCount = tagTree.length - visibleNodes.length;

  function toggleParentExpand(tag: string) {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  return (
    <aside className="flex h-full flex-col gap-5 overflow-y-auto px-5 py-5" aria-label="导航与知识状态">
      {/* 顶部品牌区 + API 设置 + 主题切换 */}
      <div className="flex shrink-0 items-center justify-between gap-2">
        {onReturnLanding ? (
          <button
            type="button"
            onClick={onReturnLanding}
            title="返回首页"
            className="group flex items-center gap-2.5 rounded-xl text-left transition hover:opacity-85"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-3 text-white shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-black tracking-tight text-ink">SparkNote</p>
              <p className="text-[11px] font-semibold text-ink-3">返回首页</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-3 text-white shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-black tracking-tight text-ink">SparkNote</p>
              <p className="text-[11px] font-semibold text-ink-3">拾光碎片笔记</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="API 设置"
            title="API 设置（BYOK）"
            className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-edge bg-surface text-ink-2 transition hover:border-edge-2 hover:text-accent"
          >
            <KeyRound className="h-4 w-4" />
            {hasByok && (
              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-ok"
                aria-label="已配置自定义 Key"
              />
            )}
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* flomo 风格 12 周微型活跃热力图 */}
      <div className="shrink-0 rounded-xl border border-edge bg-surface p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between text-[11px] font-bold text-ink-3">
          <span>近 12 周记录热力</span>
          <span className="font-mono text-accent">{activeDays} 天活跃</span>
        </div>
        <div
          className="grid grid-flow-col grid-rows-7 gap-[3.5px]"
          role="img"
          aria-label={`近 12 周学习记录热力图，共有 ${activeDays} 天活跃记录`}
        >
          {heatmap.map((cell) => (
            <span
              key={cell.dateKey}
              title={`${cell.label}：${cell.count} 条记录`}
              className="aspect-square w-full rounded-[2px] transition-transform hover:scale-125"
              style={{ backgroundColor: `var(--heat-${cell.level})` }}
            />
          ))}
        </div>
        <p className="mt-3 text-[11px] font-medium text-ink-3 tabular-nums">
          {noteCount} 条碎片 · {totalTagCount} 个标签 · {activeDays} 天活跃
        </p>
      </div>

      {/* 快捷入口：开始 3 分钟自测 */}
      <button
        type="button"
        onClick={onStartQuiz}
        className="btn-primary w-full shrink-0 justify-between !px-4 !py-2.5 text-xs"
      >
        <span className="inline-flex items-center gap-2">
          <Flame className="h-4 w-4" aria-hidden="true" />
          开始 3 分钟自测
        </span>
        <span className="rounded-full bg-black/15 px-2 py-0.5 font-mono text-[11px] tabular-nums">
          {quizCount} 题
        </span>
      </button>

      {/* 专注番茄钟 */}
      <SparkPomodoro pomodoro={pomodoro} />

      {/* 视图切换器 */}
      <nav aria-label="主视图切换" className="shrink-0 space-y-1.5">
        <p className="px-2.5 pb-1 text-[11px] font-bold tracking-wider text-ink-3">工作视图</p>
        {(
          [
            { key: "stream", label: "碎片信息流", sub: "Stream", icon: ListFilter },
            { key: "clusters", label: "AI 专题白板", sub: "Clusters", icon: LayoutGrid },
            { key: "quiz", label: "闪卡自测模式", sub: "Quiz", icon: Layers },
          ] as const
        ).map(({ key, label, sub, icon: Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onChangeView(key)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs transition-all ${
                active
                  ? "border tint-accent font-bold text-accent shadow-xs"
                  : "border border-transparent font-semibold text-ink-2 hover:bg-surface hover:text-ink"
              }`}
            >
              <span className="inline-flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </span>
              <span className="font-mono text-[10px] text-ink-2">{sub}</span>
            </button>
          );
        })}
      </nav>

      {/* AI 自动标签树 */}
      <div className="shrink-0 space-y-1 pb-2">
        <p className="px-2.5 pb-1 text-[11px] font-bold tracking-wider text-ink-3">AI 自动标签树</p>
        <button
          type="button"
          onClick={() => {
            onSelectTag(null);
            if (onlyStarred) onToggleStarred();
          }}
          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
            selectedTag === null && !onlyStarred
              ? "bg-surface font-bold text-ink shadow-xs"
              : "font-medium text-ink-2 hover:bg-surface/60 hover:text-ink"
          }`}
        >
          <span>全部碎片</span>
          <span className="font-mono text-[11px] text-ink-3 tabular-nums">{noteCount}</span>
        </button>
        <button
          type="button"
          onClick={onToggleStarred}
          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors ${
            onlyStarred
              ? "border tint-gold font-bold text-gold"
              : "font-medium text-ink-2 hover:bg-surface/60 hover:text-ink"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" />
            重点标记
          </span>
        </button>

        <div className="space-y-1 pt-1">
          {visibleNodes.map((node) => {
            const active = selectedTag === node.tag;
            const hasChildren = node.children.length > 0;
            const isExpanded = expandedParents.has(node.tag);
            return (
              <div key={node.tag} className="space-y-0.5">
                <div
                  className={`flex items-center rounded-lg pr-2.5 transition-colors ${
                    active
                      ? "border tint-accent font-bold text-accent"
                      : "font-medium text-ink-2 hover:bg-surface/70 hover:text-ink"
                  }`}
                >
                  {hasChildren ? (
                    <button
                      type="button"
                      aria-label={isExpanded ? `收起 ${node.tag} 子标签` : `展开 ${node.tag} 子标签`}
                      aria-expanded={isExpanded}
                      onClick={() => toggleParentExpand(node.tag)}
                      className="flex h-7 w-6 shrink-0 items-center justify-center text-ink-3 hover:text-ink"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  ) : (
                    <span className="w-2.5 shrink-0" aria-hidden="true" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (hasChildren && !active) {
                        setExpandedParents((prev) => new Set(prev).add(node.tag));
                      }
                      onSelectTag(active ? null : node.tag);
                    }}
                    className="flex min-w-0 flex-1 items-center justify-between py-1.5 text-left text-xs"
                  >
                    <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                      <Hash className="h-3 w-3 shrink-0 text-ink-3" />
                      <span className="truncate">{node.tag}</span>
                    </span>
                    <span className="ml-2 shrink-0 font-mono text-[11px] text-ink-2 tabular-nums">
                      {node.count}
                    </span>
                  </button>
                </div>

                {hasChildren && isExpanded && (
                  <div className="ml-3 space-y-0.5 border-l border-edge pl-2.5">
                    {node.children.map((child) => {
                      const childActive = selectedTag === child.tag;
                      return (
                        <button
                          key={child.tag}
                          type="button"
                          onClick={() => onSelectTag(childActive ? null : child.tag)}
                          className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs transition-colors ${
                            childActive
                              ? "border tint-accent font-bold text-accent"
                              : "font-medium text-ink-3 hover:bg-surface/70 hover:text-ink"
                          }`}
                        >
                          <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                            <span className="h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
                            <span className="truncate">{child.tag}</span>
                          </span>
                          <span className="ml-2 shrink-0 font-mono text-[11px] opacity-80 tabular-nums">
                            {child.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {tagTree.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllTags((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:bg-surface/60 hover:text-ink"
            >
              <span>{showAllTags ? "收起标签" : `展开全部标签 (+${hiddenNodeCount})`}</span>
              {showAllTags ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
