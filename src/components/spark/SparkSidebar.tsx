import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Compass,
  Flame,
  GripVertical,
  Hash,
  KeyRound,
  LayoutGrid,
  Layers,
  ListFilter,
  Star,
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { findTagNode, type HeatmapCell, type TagTreeNode } from "./sparkData";
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
  onStartTour?: () => void;
  quizCount: number;
  pomodoro: PomodoroController;
  onReturnLanding?: () => void;
  onTagContextMenu: (tag: string, x: number, y: number) => void;
  onMergeTag: (source: string, target: string) => void;
  onDetachTag: (tag: string) => void;
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
  onStartTour,
  quizCount,
  pomodoro,
  onReturnLanding,
  onTagContextMenu,
  onMergeTag,
  onDetachTag,
}: SparkSidebarProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const [collapsedParents, setCollapsedParents] = useState<Set<string>>(() => new Set());
  const [dragging, setDragging] = useState<{ tag: string; x: number; y: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [dropToRoot, setDropToRoot] = useState(false);
  const pressTimer = useRef<number | undefined>(undefined);
  const pressStart = useRef({ x: 0, y: 0 });
  const suppressClick = useRef(false);
  const activeDays = heatmap.filter((c) => c.count > 0).length;

  function cancelPress() {
    if (pressTimer.current !== undefined) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = undefined;
    }
  }

  function startTagPress(event: ReactPointerEvent<HTMLButtonElement>, tag: string) {
    if (event.button !== 0) return;
    cancelPress();
    const x = event.clientX;
    const y = event.clientY;
    pressStart.current = { x, y };
    pressTimer.current = window.setTimeout(() => {
      pressTimer.current = undefined;
      suppressClick.current = true;
      setDragging({ tag, x, y });
      setDropTarget(null);
    }, 420);
  }

  const draggingTag = dragging?.tag;

  useEffect(() => {
    if (!draggingTag) return;
    const source = draggingTag;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    const findDrop = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y);
      return {
        target: element?.closest<HTMLElement>("[data-tag-row]")?.dataset.tagRow ?? null,
        root: Boolean(element?.closest("[data-tag-root-zone]")),
      };
    };
    const onMove = (event: PointerEvent) => {
      event.preventDefault();
      setDragging((prev) => (prev ? { ...prev, x: event.clientX, y: event.clientY } : prev));
      const { target, root } = findDrop(event.clientX, event.clientY);
      setDropTarget(target && target !== source ? target : null);
      setDropToRoot(root && !target);
    };
    const finish = (event: PointerEvent) => {
      event.preventDefault();
      const { target, root } = findDrop(event.clientX, event.clientY);
      if (target && target !== source) onMergeTag(source, target);
      else if (root && !target) onDetachTag(source);
      setDragging(null);
      setDropTarget(null);
      setDropToRoot(false);
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    };
    const cancel = () => {
      setDragging(null);
      setDropTarget(null);
      setDropToRoot(false);
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", cancel);
    return () => {
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [draggingTag, onMergeTag, onDetachTag]);

  useEffect(() => () => cancelPress(), []);

  const baseNodes = showAllTags ? tagTree : tagTree.slice(0, 6);
  const visibleNodes =
    !showAllTags &&
    selectedTag &&
    !baseNodes.some((node) => findTagNode([node], selectedTag))
      ? [
          ...baseNodes,
          ...tagTree.filter((node) => findTagNode([node], selectedTag)),
        ]
      : baseNodes;
  const hiddenNodeCount = tagTree.length - visibleNodes.length;

  function toggleParentExpand(tag: string) {
    setCollapsedParents((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function renderTagNode(node: TagTreeNode, depth: number) {
    const active = selectedTag === node.tag;
    const hasChildren = node.children.length > 0;
    const isExpanded = !collapsedParents.has(node.tag);
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
              aria-label={isExpanded ? `收起 ${node.tag} 子分类` : `展开 ${node.tag} 子分类`}
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
            data-tag-row={node.tag}
            title="左键筛选 · 长按拖动移动 · 右键删除"
            onPointerDown={(event) => startTagPress(event, node.tag)}
            onPointerMove={(event) => {
              if (
                pressTimer.current !== undefined &&
                Math.hypot(
                  event.clientX - pressStart.current.x,
                  event.clientY - pressStart.current.y,
                ) > 8
              ) {
                cancelPress();
              }
            }}
            onPointerUp={cancelPress}
            onPointerCancel={cancelPress}
            onClick={(event) => {
              if (suppressClick.current) {
                event.preventDefault();
                event.stopPropagation();
                suppressClick.current = false;
                return;
              }
              if (hasChildren && !active) {
                setCollapsedParents((prev) => {
                  const next = new Set(prev);
                  next.delete(node.tag);
                  return next;
                });
              }
              onSelectTag(active ? null : node.tag);
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onTagContextMenu(node.tag, event.clientX, event.clientY);
            }}
            className={`flex min-w-0 flex-1 select-none items-center justify-between py-1.5 text-left text-xs ${
              dropTarget === node.tag ? "bg-surface ring-2 ring-accent" : ""
            }`}
          >
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
              {depth === 0 ? (
                <Hash className="h-3 w-3 shrink-0 text-ink-3" />
              ) : (
                <span className="h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
              )}
              <span className="truncate">{node.tag}</span>
            </span>
            <span className="ml-2 shrink-0 font-mono text-[11px] text-ink-2 tabular-nums">
              {node.count}
            </span>
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-3 space-y-0.5 border-l border-edge pl-2.5">
            {node.children.map((child) => renderTagNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
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
            <img
              src="./app-icon.jpg"
              alt=""
              draggable={false}
              className="h-8 w-8 shrink-0 rounded-xl border border-edge/80 object-cover shadow-sm transition-transform group-hover:scale-105"
            />
            <div className="leading-tight">
              <p className="text-sm font-black tracking-tight text-ink">SparkNote</p>
              <p className="text-[11px] font-semibold text-ink-3">返回首页</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <img
              src="./app-icon.jpg"
              alt=""
              draggable={false}
              className="h-8 w-8 shrink-0 rounded-xl border border-edge/80 object-cover shadow-sm"
            />
            <div className="leading-tight">
              <p className="text-sm font-black tracking-tight text-ink">SparkNote</p>
              <p className="text-[11px] font-semibold text-ink-3">拾光碎片笔记</p>
            </div>
          </div>
        )}
        <div data-tour="topbar-tools" className="flex items-center gap-1">
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              aria-label="新手引导"
              title="重新观看新手引导"
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-edge bg-surface text-ink-2 transition hover:border-edge-2 hover:text-accent"
            >
              <Compass className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="API 设置"
            title="API 设置（BYOK）"
            className="relative flex h-8 w-8 items-center justify-center rounded-sm border border-edge bg-surface text-ink-2 transition hover:border-edge-2 hover:text-accent"
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

      {/* flomo 风格 12 周微型活跃热力图 + 专注番茄钟 */}
      <div data-tour="heatmap-pomodoro" className="shrink-0 space-y-5">
        <div className="rounded-xl border border-edge bg-surface p-4 shadow-xs">
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

        {/* 专注番茄钟 */}
        <SparkPomodoro pomodoro={pomodoro} />
      </div>

      {/* 快捷入口 + 视图切换器 */}
      <div data-tour="views-quiz" className="shrink-0 space-y-4">
        <button
          type="button"
          onClick={onStartQuiz}
          className="btn-primary w-full justify-between !px-4 !py-2.5 text-xs"
        >
          <span className="inline-flex items-center gap-2">
            <Flame className="h-4 w-4" aria-hidden="true" />
            开始 3 分钟自测
          </span>
          <span className="rounded-full bg-black/15 px-2 py-0.5 font-mono text-[11px] tabular-nums">
            {quizCount} 题
          </span>
        </button>

        {/* 视图切换器 */}
        <nav aria-label="主视图切换" className="space-y-1.5">
          <p className="px-2.5 pb-1 text-[11px] font-bold tracking-wider text-ink-3">工作视图</p>
          {(
            [
              { key: "stream", label: "碎片工作区", sub: "Stream", icon: ListFilter },
              { key: "clusters", label: "专题板块", sub: "Clusters", icon: LayoutGrid },
              { key: "quiz", label: "卡片自测", sub: "Quiz", icon: Layers },
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
      </div>

      {/* AI 自动标签树 */}
      <div data-tour="tag-tree" className="shrink-0 space-y-1 pb-2">
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

        <div className="relative space-y-1 rounded-lg pt-1">
          <div
            data-tag-root-zone
            aria-hidden="true"
            title="拖到此处移出分类"
            className={`absolute -left-5 top-0 h-full w-5 rounded-l-lg transition-colors ${
              dragging ? "pointer-events-auto" : "pointer-events-none"
            } ${dragging && dropToRoot ? "border-l-2 border-accent bg-accent/15" : ""}`}
          />
          {dragging && dropToRoot && (
            <p className="pointer-events-none absolute left-6 top-1 z-30 rounded-md bg-surface px-2 py-1 text-[11px] font-semibold text-accent shadow-sm">
              拖到左侧空白区移出分类
            </p>
          )}
          {visibleNodes.map((node) => renderTagNode(node, 0))}
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
    {dragging &&
      createPortal(
        <div
          aria-hidden="true"
          style={{ left: dragging.x + 12, top: dragging.y + 12 }}
          className="pointer-events-none fixed z-[120] flex max-w-48 items-center gap-1.5 rounded-full border border-accent bg-surface px-3 py-1.5 text-xs font-bold text-accent shadow-2xl"
        >
          <GripVertical className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">#{dragging.tag}</span>
        </div>,
        document.body,
      )}
    </>
  );
}
