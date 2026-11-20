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
        <hr className="rule-accent" />
        <div className="rounded-md border border-edge bg-surface p-8 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-3 font-bold">暂时还没有错题，快去做一套 3 分钟小测验检验一下吧！</p>
          <p className="mt-2 text-sm text-ink-2">答错的题会自动收进这里，配大白话原理和生活比喻。</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 overflow-x-clip" aria-label="大白话错题本">
      <div className="flex items-baseline justify-between gap-2">
        <p className="kicker">大白话错题本</p>
        <span className="text-xs font-bold text-ink-3">{wrongItems.length} 道待搞懂</span>
      </div>

      {wrongItems.map((item) => {
        const { quiz } = item;
        const loading = loadingId === item.id;
        return (
          <article key={item.id} className="rounded-md border border-edge bg-surface p-5">
            <span className="rounded-sm bg-surface-2 px-2.5 py-1 text-xs font-bold text-accent">
              {item.deckTitle}
            </span>
            <p className="mt-3 break-words font-bold leading-relaxed">{quiz.question}</p>

            <ul className="mt-3 flex flex-col gap-1.5">
              {quiz.options.map((opt, i) => {
                const isWrongPick = i === item.userChoiceIndex;
                const isCorrect = i === quiz.answerIndex;
                return (
                  <li
                    key={i}
                    className={`flex items-start gap-2 rounded-sm px-3 py-2 text-sm leading-relaxed ${
                      isWrongPick
                        ? "bg-surface-2 font-bold text-bad"
                        : isCorrect
                          ? "bg-surface-2 font-bold text-ok"
                          : "text-ink-2"
                    }`}
                  >
                    {isWrongPick ? (
                      <X className="mt-0.5 h-4 w-4 shrink-0" aria-label="你的错选" />
                    ) : isCorrect ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0" aria-label="正确答案" />
                    ) : (
                      <span className="mt-0.5 w-4 shrink-0 text-center text-xs font-bold text-ink-3">
                        {String.fromCharCode(65 + i)}
                      </span>
                    )}
                    <span className="break-words">{opt}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 rounded-sm border-l-2 border-warn bg-surface-2 p-4">
              <p className="text-xs font-bold text-warn">大白话原理</p>
              <p className="mt-1.5 break-words text-sm leading-relaxed text-ink-2">
                {quiz.plainExplanation}
              </p>
              {item.customAnalogies && item.customAnalogies.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2 border-t border-edge pt-3">
                  {item.customAnalogies.map((analogy, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-ink-2">
                      <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
                      <span className="break-words">{analogy}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={loading}
                onClick={() => askAnalogy(item.id)}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-edge bg-surface px-4 py-2.5 text-sm font-bold text-ink-2 transition hover:border-edge-2 hover:text-accent active:opacity-70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    正在想新比喻…
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    💬 还是有点绕？换个生活比喻
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="btn-primary px-4 py-2.5 text-sm"
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