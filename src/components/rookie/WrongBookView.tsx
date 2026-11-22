import { Check, LoaderCircle, MessageCircle, Quote, X } from "lucide-react";
import { useState } from "react";
import type { StudyDeck } from "../../types/deck";

export interface WrongItem {
  id: string;
  deckTitle: string;
  quiz: StudyDeck["quizzes"][number];
  userChoiceIndex: number;
  customAnalogies?: string[];
}

interface WrongBookViewProps {
  wrongItems: WrongItem[];
  onRemove: (id: string) => void;
  onAskMoreAnalogy: (id: string) => Promise<void> | void;
}

export function WrongBookView({ wrongItems, onRemove, onAskMoreAnalogy }: WrongBookViewProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const askAnalogy = async (id: string) => {
    if (loadingId !== null) return;
    setLoadingId(id);
    try {
      await onAskMoreAnalogy(id);
    } finally {
      setLoadingId(null);
    }
  };

  if (wrongItems.length === 0) {
    return (
      <section className="overflow-x-clip" aria-label="大白话错题本">
        <p className="kicker">大白话错题本</p>
        <hr className="rule-accent !mt-3 !mb-6" />
        <div className="card-flat p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border tint-ok text-ok">
            <Check className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-4 font-bold text-ink">暂时还没有错题，快去做一套 3 分钟小测验检验一下吧！</p>
          <p className="mt-2 text-sm text-ink-2">答错的题会自动收进这里，配大白话原理和生活比喻。</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 overflow-x-clip" aria-label="大白话错题本">
      <div className="flex items-center justify-between gap-2">
        <p className="kicker">大白话错题本</p>
        <span className="rounded-full border border-edge bg-surface px-2.5 py-0.5 text-xs font-bold text-ink-3 tabular-nums">
          {wrongItems.length} 道待搞懂
        </span>
      </div>

      {wrongItems.map((item, idx) => {
        const { quiz } = item;
        const loading = loadingId === item.id;
        return (
          <article key={item.id} className="rounded-xl border border-edge bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-md border tint-accent px-2.5 py-1 text-xs font-bold text-accent">
                {item.deckTitle}
              </span>
              <span className="font-mono text-xs font-bold text-ink-3 tabular-nums">
                #{String(idx + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-3 break-words text-base font-bold leading-relaxed text-ink">{quiz.question}</p>

            <ul className="mt-3.5 flex flex-col gap-2">
              {quiz.options.map((opt, i) => {
                const isWrongPick = i === item.userChoiceIndex;
                const isCorrect = i === quiz.answerIndex;
                return (
                  <li
                    key={i}
                    className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed ${
                      isWrongPick
                        ? "tint-bad font-bold text-bad"
                        : isCorrect
                          ? "tint-ok font-bold text-ok"
                          : "border-transparent bg-surface-2/35 text-ink-2"
                    }`}
                  >
                    {isWrongPick ? (
                      <X className="mt-0.5 h-4 w-4 shrink-0" aria-label="你的错选" />
                    ) : isCorrect ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0" aria-label="正确答案" />
                    ) : (
                      <span className="mt-0.5 w-4 shrink-0 text-center font-mono text-xs font-bold text-ink-3">
                        {String.fromCharCode(65 + i)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 break-words">{opt}</span>
                    {isWrongPick && (
                      <span className="shrink-0 rounded border tint-bad px-1.5 py-0.5 text-[10px] font-bold">
                        你的选择
                      </span>
                    )}
                    {isCorrect && (
                      <span className="shrink-0 rounded border tint-ok px-1.5 py-0.5 text-[10px] font-bold">
                        正确答案
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 rounded-xl border border-l-4 border-l-warn tint-warn p-4">
              <p className="text-xs font-bold text-warn">大白话原理</p>
              <p className="mt-1.5 break-words text-sm leading-relaxed text-ink">
                {quiz.plainExplanation}
              </p>
              {item.customAnalogies && item.customAnalogies.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2.5 border-t border-edge/80 pt-3">
                  {item.customAnalogies.map((analogy, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-ink-2">
                      <Quote className="mt-1 h-3.5 w-3.5 shrink-0 text-warn" />
                      <div className="min-w-0 flex-1">
                        <span className="mr-1.5 inline-block rounded border tint-warn px-1.5 py-0.5 text-[10px] font-bold text-warn">
                          比喻 #{i + 2}
                        </span>
                        <span className="break-words">{analogy}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                disabled={loading}
                onClick={() => askAnalogy(item.id)}
                className="btn-secondary !px-4 !py-2.5 text-sm"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" />
                    正在想新比喻…
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    还是有点绕？换个生活比喻
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="btn-primary !px-4 !py-2.5 text-sm"
              >
                ✅ 已搞懂，移出错题本
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}