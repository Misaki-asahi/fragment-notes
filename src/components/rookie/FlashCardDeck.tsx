import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { StudyDeck } from "../../types/deck";

type FlashCard = StudyDeck["flashcards"][number];

interface FlashCardDeckProps {
  cards: StudyDeck["flashcards"];
  onUpdateStatus: (cardId: string, status: "review" | "mastered") => void;
}

const DIFFICULTY: Record<FlashCard["difficulty"], { label: string; className: string }> = {
  easy: { label: "简单", className: "tint-ok text-ok" },
  medium: { label: "中等", className: "tint-gold text-gold" },
  hard: { label: "困难", className: "tint-bad text-bad" },
};

const STATUS_LABEL: Record<FlashCard["status"], string> = {
  unseen: "未学",
  review: "待复习",
  mastered: "已掌握",
};

export function FlashCardDeck({ cards, onUpdateStatus }: FlashCardDeckProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dir, setDir] = useState<"next" | "prev">("next");

  const total = cards.length;
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const card = cards[safeIndex];
  const masteredCount = cards.filter((c) => c.status === "mastered").length;
  const pct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

  const goTo = (next: number, direction?: "next" | "prev") => {
    setDir(direction ?? (next >= safeIndex ? "next" : "prev"));
    setIndex(((next % total) + total) % total);
    setFlipped(false);
  };

  const markAndNext = (status: "review" | "mastered") => {
    if (!card) return;
    onUpdateStatus(card.id, status);
    goTo(safeIndex + 1, "next");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (total === 0 || e.repeat) return;
      const target = e.target;
      const interactive =
        target instanceof HTMLElement
          ? target.closest("button, input, textarea, select, [contenteditable]")
          : null;
      if (e.key === " " && !interactive) {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setDir("prev");
        setIndex((i) => (((i - 1) % total) + total) % total);
        setFlipped(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setDir("next");
        setIndex((i) => (i + 1) % total);
        setFlipped(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  if (!card) {
    return (
      <div className="card-flat p-8 text-center">
        <p className="font-bold text-ink">这个牌组还没有闪卡</p>
        <p className="mt-2 text-sm text-ink-2">先投喂一份学习资料，AI 会为你生成记忆闪卡。</p>
      </div>
    );
  }

  const difficulty = DIFFICULTY[card.difficulty];
  const statusCls =
    card.status === "mastered"
      ? "tint-ok text-ok"
      : card.status === "review"
        ? "tint-gold text-gold"
        : "border-edge bg-surface text-ink-2";

  return (
    <section className="flex flex-col gap-5 overflow-x-clip" aria-label="记忆闪卡">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="kicker">记忆闪卡</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${difficulty.className}`}>
            {difficulty.label}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusCls}`}>
            {STATUS_LABEL[card.status]}
          </span>
          <span className="font-mono text-xs font-bold text-ink-3 tabular-nums">
            {safeIndex + 1} / {total}
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <div
          className="h-2 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={masteredCount}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="已掌握进度"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-3 via-accent-2 to-accent transition-all duration-500"
            style={{ width: `${total > 0 ? (masteredCount / total) * 100 : 0}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-ink-3 tabular-nums">
            已掌握 {masteredCount} / {total}（{pct}%）
          </p>
          <div className="flex items-center gap-1" aria-label="卡片进度指示">
            {cards.map((c, idx) => {
              const isCurrent = idx === safeIndex;
              const dotColor =
                c.status === "mastered"
                  ? "bg-ok"
                  : c.status === "review"
                    ? "bg-gold"
                    : isCurrent
                      ? "bg-accent"
                      : "bg-edge-2";
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`跳到第 ${idx + 1} 张闪卡`}
                  onClick={() => goTo(idx, idx >= safeIndex ? "next" : "prev")}
                  className={`h-1.5 rounded-full transition-all duration-200 ${dotColor} ${
                    isCurrent ? "w-5" : "w-1.5 opacity-65 hover:opacity-100"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl pb-4">
        <div className="relative h-72 sm:h-80">
          {total > 2 && <div className="flashcard-stack-2" aria-hidden="true" />}
          {total > 1 && <div className="flashcard-stack-1" aria-hidden="true" />}
          <div
            key={card.id}
            className={`flashcard-stage h-full w-full cursor-pointer select-none ${
              dir === "next" ? "flashcard-enter-next" : "flashcard-enter-prev"
            }`}
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label={flipped ? "闪卡背面，点击翻回正面" : "闪卡正面，点击翻转查看答案"}
            onClick={() => setFlipped((f) => !f)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setFlipped((f) => !f);
              }
            }}
          >
            <div className={`flashcard-inner ${flipped ? "is-flipped" : ""}`}>
              <div className="flashcard-face flashcard-face-front p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md border tint-accent px-2.5 py-0.5 text-[11px] font-bold text-accent">
                    正面 · 提问
                  </span>
                  <span className="font-mono text-[11px] font-bold text-ink-3 tabular-nums">
                    #{String(safeIndex + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 items-center justify-center overflow-y-auto py-3">
                  <p className="break-words text-center text-lg font-bold leading-relaxed text-ink sm:text-xl">
                    {card.front}
                  </p>
                </div>
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface/80 px-3 py-1 text-xs font-semibold text-ink-3">
                    <RotateCw className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    点击翻转查看答案 · Space
                  </span>
                </div>
              </div>

              <div className="flashcard-face flashcard-face-back p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md border tint-ok px-2.5 py-0.5 text-[11px] font-bold text-ok">
                    背面 · 参考答案
                  </span>
                  <span className="font-mono text-[11px] font-bold text-ink-3 tabular-nums">
                    {safeIndex + 1} / {total}
                  </span>
                </div>
                <div className="mt-3 flex-1 overflow-y-auto pr-1">
                  <p className="break-words text-sm leading-relaxed text-ink sm:text-base">
                    {card.back}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3">
                    <RotateCw className="h-3.5 w-3.5 text-ok" aria-hidden="true" />
                    点击翻回正面
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          aria-label="上一张"
          onClick={() => goTo(safeIndex - 1, "prev")}
          className="btn-secondary shrink-0 !p-2 sm:!p-2.5"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => markAndNext("review")}
          className="btn-secondary min-w-0 flex-1 truncate !px-2 !py-2.5 text-xs hover:!border-warn/60 hover:!text-warn sm:!px-3 sm:text-sm"
        >
          😅 还要再记
        </button>
        <button
          type="button"
          onClick={() => markAndNext("mastered")}
          className="btn-primary min-w-0 flex-1 truncate !px-2 !py-2.5 text-xs sm:!px-3 sm:text-sm"
        >
          ✅ 我已掌握
        </button>
        <button
          type="button"
          aria-label="下一张"
          onClick={() => goTo(safeIndex + 1, "next")}
          className="btn-secondary shrink-0 !p-2 sm:!p-2.5"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="mx-auto flex w-full max-w-2xl flex-wrap items-center gap-1.5 text-xs text-ink-3">
        快捷键：
        <kbd className="rounded border border-edge bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-2">Space</kbd>
        翻转 ·
        <kbd className="rounded border border-edge bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-2">←</kbd>
        <kbd className="rounded border border-edge bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-2">→</kbd>
        切卡
      </p>
    </section>
  );
}