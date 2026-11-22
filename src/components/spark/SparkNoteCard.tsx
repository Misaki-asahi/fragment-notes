import { useState } from "react";
import { GitBranch, Layers, Sparkles, Star } from "lucide-react";
import { segmentByTerms, type SparkNote } from "./sparkData";

interface SparkNoteCardProps {
  note: SparkNote;
  selected: boolean;
  onSelect: (note: SparkNote) => void;
  onToggleStar: (id: string) => void;
  onClickTag: (tag: string) => void;
  onMakeFlashcard: (note: SparkNote) => void;
}

function formatRelativeTime(ts: number): string {
  const diffMin = Math.floor((Date.now() - ts) / 60_000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `今天 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function SparkNoteCard({
  note,
  selected,
  onSelect,
  onToggleStar,
  onClickTag,
  onMakeFlashcard,
}: SparkNoteCardProps) {
  const [maskedInline, setMaskedInline] = useState(false);
  const segments = segmentByTerms(note.content, note.clozeTerms);

  return (
    <article
      onClick={() => onSelect(note)}
      className={`group relative cursor-pointer rounded-2xl border bg-surface p-5 transition-all sm:p-6 ${
        selected
          ? "border-accent-2 shadow-sm ring-2 ring-accent-2/12"
          : "border-edge shadow-xs hover:border-edge-2 hover:shadow-sm"
      }`}
    >
      {/* 顶部时间 + 专题归属 + 重点星标 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs font-medium text-ink-3">
            {formatRelativeTime(note.createdAt)}
          </span>
          <span className="rounded-md bg-surface-2/80 px-2 py-0.5 text-[11px] font-semibold text-ink-2">
            {note.cluster}
          </span>
        </div>
        <button
          type="button"
          aria-label={note.starred ? "取消重点标记" : "标为重点"}
          aria-pressed={note.starred}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(note.id);
          }}
          className={`rounded-lg p-1.5 transition-colors ${
            note.starred
              ? "text-gold hover:bg-surface-2"
              : "text-ink-3 hover:bg-surface-2 hover:text-gold"
          }`}
        >
          <Star className={`h-4 w-4 ${note.starred ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* AI 流式提炼中态 vs 提炼完成态 */}
      {note.aiProcessing ? (
        <div className="mt-3.5 space-y-3.5">
          <p className="break-words text-sm leading-7 text-ink-2">{note.content}</p>
          <div className="ai-shimmer flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-ai">
            <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse" />
            AI 提炼中：正在归纳一句话结论、自动标签与关键概念挖空点…
          </div>
        </div>
      ) : (
        <div className="mt-3.5">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-ai">
              <Sparkles className="h-2.5 w-2.5" />
              结论
            </span>
            <h3 className="break-words text-[15px] font-bold leading-snug text-ink">
              {note.aiTitle}
            </h3>
          </div>

          <p className="mt-3 break-words text-sm leading-7 text-ink-2">
            {segments.map((seg, i) =>
              seg.isCloze ? (
                <button
                  key={i}
                  type="button"
                  title={maskedInline ? "点击揭晓核心概念" : "点击切换挖空遮罩"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMaskedInline((m) => !m);
                  }}
                  className={
                    maskedInline
                      ? "cloze-hidden !py-0 !text-xs"
                      : "mx-0.5 inline rounded-xs bg-surface-2/90 px-1 py-0.5 font-semibold text-ink underline decoration-ai/50 decoration-2 underline-offset-4 transition hover:decoration-ai"
                  }
                >
                  {seg.text}
                </button>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </p>

          {note.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {note.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClickTag(tag);
                  }}
                  className="rounded-md bg-surface-2/80 px-2.5 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-surface-2"
                >
                  #{tag}
                </button>
              ))}
              {note.clozeTerms.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMaskedInline((m) => !m);
                  }}
                  className="ml-auto text-[11px] font-medium text-ink-3 transition-colors hover:text-ai"
                >
                  {maskedInline ? "显示挖空词" : "卡片内挖空自测"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 底部轻量操作栏（去边框幽灵按钮） */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-edge/50 pt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMakeFlashcard(note);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:bg-surface-2/80 hover:text-accent"
        >
          <Layers className="h-3.5 w-3.5" />
          生成闪卡
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(note);
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
            selected
              ? "bg-surface-2 font-bold text-ai"
              : "font-medium text-ink-3 hover:bg-surface-2/80 hover:text-ai"
          }`}
        >
          <GitBranch className="h-3.5 w-3.5" />
          查看关联
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(note.id);
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
            note.starred
              ? "bg-surface-2 font-bold text-gold"
              : "font-medium text-ink-3 hover:bg-surface-2/80 hover:text-gold"
          }`}
        >
          <Star className="h-3.5 w-3.5" />
          {note.starred ? "已标重点" : "标为重点"}
        </button>
      </div>
    </article>
  );
}
