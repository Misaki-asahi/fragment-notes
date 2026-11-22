import { Lightbulb, Sparkles } from "lucide-react";
import type { StudyDeck } from "../../types/deck";

interface ConceptMatrixProps {
  summary: string;
  concepts: StudyDeck["concepts"];
  confusions: StudyDeck["confusions"];
}

export function ConceptMatrix({ summary, concepts, confusions }: ConceptMatrixProps) {
  return (
    <section className="flex flex-col gap-8 overflow-x-clip" aria-label="概念与易混对比">
      <div className="relative overflow-hidden rounded-xl border tint-accent p-5">
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent to-accent-3"
          aria-hidden="true"
        />
        <p className="kicker flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" />
          一句话总结
        </p>
        <p className="mt-2 break-words text-sm font-bold leading-relaxed text-ink">{summary}</p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="kicker">核心概念</p>
          <span className="font-mono text-xs font-bold text-ink-3">{concepts.length} 项</span>
        </div>
        <hr className="rule-accent !mt-3 !mb-6" />
        {concepts.length === 0 ? (
          <p className="card-flat p-5 text-sm text-ink-2">
            这份资料还没有提炼出核心概念。
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {concepts.map((c, idx) => (
              <div key={c.term} className="group edge-glow flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md border tint-accent px-1.5 font-mono text-[11px] font-bold text-accent">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p className="break-words text-base font-bold leading-snug text-ink">{c.term}</p>
                  </div>
                  <p className="mt-2.5 break-words text-sm leading-relaxed text-ink-2">
                    {c.definition}
                  </p>
                </div>
                <div className="mt-4 rounded-lg border tint-gold px-3 py-2 text-xs font-bold leading-relaxed text-gold break-words">
                  {c.keyPoint}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="kicker">易混点对比</p>
          <span className="font-mono text-xs font-bold text-ink-3">{confusions.length} 组</span>
        </div>
        <hr className="rule-accent !mt-3 !mb-6" />
        {confusions.length === 0 ? (
          <p className="card-flat p-5 text-sm text-ink-2">
            这份资料暂时没有易混点对比，专心啃核心概念就好。
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {confusions.map((c) => (
              <div key={c.topic} className="rounded-xl border border-edge bg-surface p-5 shadow-sm">
                <p className="break-words text-sm font-bold text-accent">{c.topic}</p>
                <div className="relative mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="rounded-lg border border-edge bg-surface-2/55 p-4 sm:pr-6">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border tint-accent font-mono text-[11px] font-bold text-accent">
                        A
                      </span>
                      <p className="break-words font-bold text-ink">{c.itemAName}</p>
                    </div>
                    <p className="mt-2 break-words text-sm leading-relaxed text-ink-2">
                      {c.itemAFeature}
                    </p>
                  </div>

                  <div className="flex justify-center sm:hidden" aria-hidden="true">
                    <span className="-my-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-edge-2 bg-surface font-mono text-[10px] font-black text-accent shadow-sm">
                      VS
                    </span>
                  </div>
                  <span
                    className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-edge-2 bg-surface font-mono text-[11px] font-black text-accent shadow-md sm:flex"
                    aria-hidden="true"
                  >
                    VS
                  </span>

                  <div className="rounded-lg border border-edge bg-surface-2/55 p-4 sm:pl-6">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border tint-gold font-mono text-[11px] font-bold text-gold">
                        B
                      </span>
                      <p className="break-words font-bold text-ink">{c.itemBName}</p>
                    </div>
                    <p className="mt-2 break-words text-sm leading-relaxed text-ink-2">
                      {c.itemBFeature}
                    </p>
                  </div>
                </div>
                <p className="mt-3.5 flex items-start gap-2.5 rounded-lg border tint-warn px-4 py-3 text-sm font-bold leading-relaxed text-warn">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="break-words">{c.distinctionTip}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}