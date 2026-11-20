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
      <div className="rounded-md border border-edge bg-surface-2 p-5">
        <p className="kicker flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" />
          一句话总结
        </p>
        <p className="mt-2 break-words text-sm font-bold leading-relaxed">{summary}</p>
      </div>

      <div>
        <p className="kicker">核心概念</p>
        <hr className="rule-accent" />
        {concepts.length === 0 ? (
          <p className="rounded-md border border-edge bg-surface p-5 text-sm text-ink-2">
            这份资料还没有提炼出核心概念。
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {concepts.map((c) => (
              <div key={c.term} className="flex flex-col rounded-md border border-edge bg-surface p-5">
                <p className="break-words font-bold">{c.term}</p>
                <p className="mt-2 flex-1 break-words text-sm leading-relaxed text-ink-2">
                  {c.definition}
                </p>
                <span className="mt-3 self-start rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-gold">
                  {c.keyPoint}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="kicker">易混点对比</p>
        <hr className="rule-accent" />
        {confusions.length === 0 ? (
          <p className="rounded-md border border-edge bg-surface p-5 text-sm text-ink-2">
            这份资料暂时没有易混点对比，专心啃核心概念就好。
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {confusions.map((c) => (
              <div key={c.topic} className="rounded-md border border-edge bg-surface p-5">
                <p className="break-words text-sm font-bold text-accent">{c.topic}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-sm bg-surface-2 p-4">
                    <p className="break-words font-bold">{c.itemAName}</p>
                    <p className="mt-1.5 break-words text-sm leading-relaxed text-ink-2">
                      {c.itemAFeature}
                    </p>
                  </div>
                  <div className="rounded-sm bg-surface-2 p-4">
                    <p className="break-words font-bold">{c.itemBName}</p>
                    <p className="mt-1.5 break-words text-sm leading-relaxed text-ink-2">
                      {c.itemBFeature}
                    </p>
                  </div>
                </div>
                <p className="mt-3 flex items-start gap-2 rounded-sm bg-surface-2 p-3 text-sm font-bold leading-relaxed text-warn">
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