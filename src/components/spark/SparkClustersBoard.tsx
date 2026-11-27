import { useState } from "react";
import { Flame, LayoutGrid, Layers, Sparkles, Star } from "lucide-react";
import type { SparkNote } from "./sparkData";

interface SparkClustersBoardProps {
  notes: SparkNote[];
  selectedNoteId: string | null;
  onSelectNote: (note: SparkNote) => void;
  onQuizCluster: (cluster: string) => void;
}

export function SparkClustersBoard({
  notes,
  selectedNoteId,
  onSelectNote,
  onQuizCluster,
}: SparkClustersBoardProps) {
  const [activeCluster, setActiveCluster] = useState<string | null>(null);

  const grouped = new Map<string, SparkNote[]>();
  for (const n of notes) {
    const list = grouped.get(n.cluster) ?? [];
    list.push(n);
    grouped.set(n.cluster, list);
  }
  const clusters = Array.from(grouped.entries());
  const visibleClusters = activeCluster
    ? clusters.filter(([name]) => name === activeCluster)
    : clusters;

  return (
    <section
      className="whiteboard-grid min-h-[calc(100vh-5rem)] rounded-2xl border border-edge p-5 sm:p-8"
      aria-label="AI 专题白板"
    >
      {/* 顶部白板工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-edge bg-surface/95 px-5 py-4 shadow-xs backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-ai">
            <LayoutGrid className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-ink">AI 专题白板 · Clusters</h2>
            <p className="text-[11px] text-ink-3">
              按 AI 自动识别的 {clusters.length} 个主题聚合，支持空间浏览与易混辨析
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCluster(null)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              activeCluster === null
                ? "border tint-accent font-bold text-accent"
                : "bg-surface-2/70 text-ink-2 hover:text-ink"
            }`}
          >
            全部专题
          </button>
          {clusters.map(([name, items]) => (
            <button
              key={name}
              type="button"
              onClick={() => setActiveCluster(activeCluster === name ? null : name)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                activeCluster === name
                  ? "border tint-accent font-bold text-accent"
                  : "bg-surface-2/70 text-ink-2 hover:text-ink"
              }`}
            >
              {name.split(" · ")[0]} ({items.length})
            </button>
          ))}
        </div>
      </div>

      {/* 模块化专题分区 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {visibleClusters.map(([clusterName, items]) => {
          const confusions = items
            .map((i) => i.confusion)
            .filter((c): c is NonNullable<typeof c> => Boolean(c));

          return (
            <div
              key={clusterName}
              className="flex flex-col gap-4 rounded-2xl border border-edge bg-surface/95 p-5 shadow-sm backdrop-blur-xs sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge/60 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-2" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-ink">{clusterName}</h3>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-bold text-ink-2">
                    {items.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onQuizCluster(clusterName)}
                  className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-accent transition hover:opacity-85"
                >
                  <Flame className="h-3 w-3" />
                  测本专题
                </button>
              </div>

              {/* 该专题内的碎片卡片 */}
              <div className="space-y-3.5">
                {items.map((note) => {
                  const selected = note.id === selectedNoteId;
                  return (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => onSelectNote(note)}
                      className={`w-full rounded-xl border p-4 text-left transition-all ${
                        selected
                          ? "border-accent-2 bg-surface shadow-sm ring-2 ring-accent-2/12"
                          : "border-edge bg-surface-2/40 hover:border-edge-2 hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold leading-snug text-ink">{note.aiTitle}</p>
                        {note.starred && (
                          <Star className="h-3.5 w-3.5 shrink-0 fill-current text-gold" />
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-2">
                        {note.content}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        {note.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded bg-surface-2/80 px-2 py-0.5 text-[10px] font-medium text-accent"
                          >
                            #{t}
                          </span>
                        ))}
                        {note.clozeTerms.length > 0 && (
                          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-ink-3">
                            <Layers className="h-3 w-3" />
                            {note.clozeTerms.length} 个挖空点
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 专题内 AI 易混概念对比卡 */}
              {confusions.length > 0 && (
                <div className="mt-1 space-y-2 border-t border-edge/70 pt-3">
                  <p className="inline-flex items-center gap-1 text-[11px] font-bold text-ai">
                    <Sparkles className="h-3 w-3" />
                    AI 易混对照卡
                  </p>
                  {confusions.map((c) => (
                    <div
                      key={c.topic}
                      className="rounded-xl border border-edge bg-surface-2/50 p-3 text-xs"
                    >
                      <p className="font-bold text-ink">{c.topic}</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-lg border border-edge bg-surface p-2.5">
                          <p className="font-bold text-accent">{c.itemAName}</p>
                          <p className="mt-1 leading-relaxed text-ink-2">{c.itemAFeature}</p>
                        </div>
                        <div className="rounded-lg border border-edge bg-surface p-2.5">
                          <p className="font-bold text-gold">{c.itemBName}</p>
                          <p className="mt-1 leading-relaxed text-ink-2">{c.itemBFeature}</p>
                        </div>
                      </div>
                      <p className="mt-2 rounded-lg border tint-warn bg-surface px-2.5 py-1.5 text-[11px] font-bold text-warn">
                        {c.distinctionTip}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
