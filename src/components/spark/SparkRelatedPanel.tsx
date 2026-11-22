import { ArrowUpRight, Link2, Sparkles } from "lucide-react";
import type { RelatedMatch, SparkNote } from "./sparkData";

interface SparkRelatedPanelProps {
  queryText: string;
  activeNote: SparkNote | null;
  matches: RelatedMatch[];
  onJumpToNote: (note: SparkNote) => void;
}

export function SparkRelatedPanel({
  queryText,
  activeNote,
  matches,
  onJumpToNote,
}: SparkRelatedPanelProps) {
  const modeLabel = queryText.trim()
    ? "实时输入联想中 · Mem 语义检索"
    : activeNote
      ? `正在关联「${activeNote.aiTitle.slice(0, 14)}…」`
      : "AI 自动串联历史碎片";

  const topMatches = matches.slice(0, 3);

  return (
    <aside className="flex h-full flex-col gap-5 overflow-y-auto px-5 py-6" aria-label="AI 隐形关联上下文面板">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-ai">
            <Sparkles className="h-3 w-3" />
            AI 隐形关联
          </span>
          <span className="font-mono text-[11px] font-bold text-ink-3">
            {topMatches.length} 条相关
          </span>
        </div>
        <p className="mt-2.5 text-xs font-medium leading-relaxed text-ink-3">{modeLabel}</p>
      </div>

      {topMatches.length === 0 ? (
        <div className="rounded-xl border border-edge bg-surface p-6 text-center">
          <Link2 className="mx-auto h-5 w-5 text-ink-3" />
          <p className="mt-2.5 text-xs font-semibold text-ink-2">继续输入或点选中间任意卡片</p>
          <p className="mt-1 text-[11px] text-ink-3">系统会自动浮现语义相近的历史碎片</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topMatches.map((m) => (
            <button
              key={m.note.id}
              type="button"
              onClick={() => onJumpToNote(m.note)}
              className="group w-full rounded-xl border border-edge bg-surface p-4 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-ai/45 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-[11px] font-bold text-accent tabular-nums">
                  相似度 {m.score}%
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ai" />
              </div>

              <h4 className="mt-2.5 line-clamp-2 text-xs font-bold leading-snug text-ink">
                {m.note.aiTitle}
              </h4>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-2">
                {m.note.content}
              </p>

              <p className="mt-3 rounded-lg bg-surface-2/70 px-2.5 py-1.5 text-[11px] font-medium leading-snug text-ai">
                {m.reason}
              </p>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
