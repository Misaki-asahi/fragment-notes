import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { StudyDeck } from "../../types/deck";

type FlashCard = StudyDeck["flashcards"][number];

interface FlashCardDeckProps {
  cards: StudyDeck["flashcards"];
  onUpdateStatus: (cardId: string, status: "review" | "mastered") => void;
}

const DIFFICULTY: Record<FlashCard["difficulty"], { label: string; className: string }> = {
  easy: { label: "简单", className: "text-ok" },
  medium: { label: "中等", className: "text-gold" },
  hard: { label: "困难", className: "text-bad" },
};

const STATUS_LABEL: Record<FlashCard["status"], string> = {
  unseen: "未学",
  review: "待复习",
  mastered: "已掌握",
};

export function FlashCardDeck({ cards, onUpdateStatus }: FlashCardDeckProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const total = cards.length;
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const card = cards[safeIndex];
  const masteredCount = cards.filter((c) => c.status === "mastered").length;

  const goTo = (next: number) => {
    setIndex(((next % total) + total) % total);
    setFlipped(false);
  };

  const markAndNext = (status: "review" | "mastered") => {
    if (!card) return;
    onUpdateStatus(card.id, status);
    goTo(safeIndex + 1);
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
        setIndex((i) => (((i - 1) % total) + total) % total);
        setFlipped(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex((i) => (i + 1) % total);
        setFlipped(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  if (!card) {
    return (
      <div className="rounded-md border border-edge bg-surface p-8 text-center">
        <p className="font-bold">这个牌组还没有闪卡</p>
        <p className="mt-2 text-sm text-ink-2">先投喂一份学习资料，AI 会为你生成记忆闪卡。</p>
      </div>
    );
  }

  const difficulty = DIFFICULTY[card.difficulty];

  return (
    <section className="flex flex-col gap-4 overflow-x-clip" aria-label="记忆闪卡">
      <style>{`@keyframes rookie-card-in{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}`}</style>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="kicker">记忆闪卡</p>
        <div className="flex items-center gap-2">
          <span className={`rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-bold ${difficulty.className}`}>
            {difficulty.label}
          </span>
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-bold text-ink-2">
            {STATUS_LABEL[card.status]}
          </span>
          <span className="text-xs font-bold text-ink-3">
            第 {safeIndex + 1} / {total} 张
          </span>
        </div>
      </div>

      <div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={masteredCount} aria-valuemin={0} aria-valuemax={total} aria-label="已掌握进度">
          <div
            className="h-full rounded-full bg-accent-2 transition-all duration-500"
            style={{ width: `${total > 0 ? (masteredCount / total) * 100 : 0}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs font-bold text-ink-3">
          已掌握 {masteredCount} / {total}
        </p>
      </div>

      <div
        key={card.id}
        className="edge-glow h-72 cursor-pointer select-none p-0 sm:h-80 [perspective:1200px]"
        style={{ animation: "rookie-card-in 0.3s cubic-bezier(0.2,0.7,0.2,1)" }}
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
        <div
          className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-md p-6 [backface-visibility:hidden]">
            <p className="break-words text-center text-lg font-bold leading-relaxed sm:text-xl">
              {card.front}
            </p>
            <p className="text-xs font-bold text-ink-3">点击翻转查看答案（空格）</p>
          </div>
          <div className="absolute inset-0 overflow-y-auto rounded-md bg-surface p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="kicker">答案</p>
            <p className="mt-3 break-words text-sm leading-relaxed text-ink-2">{card.back}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="上一张"
          onClick={() => goTo(safeIndex - 1)}
          className="shrink-0 rounded-sm border border-edge bg-surface p-2.5 text-ink-2 transition hover:border-edge-2 hover:text-accent active:opacity-70"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => markAndNext("review")}
          className="min-w-0 flex-1 truncate rounded-sm border border-edge bg-surface px-3 py-2.5 text-sm font-bold text-ink-2 transition hover:border-edge-2 hover:text-warn active:opacity-70"
        >
          😅 还要再记
        </button>
        <button
          type="button"
          onClick={() => markAndNext("mastered")}
          className="btn-primary min-w-0 flex-1 truncate px-3 py-2.5 text-sm"
        >
          ✅ 我已掌握
        </button>
        <button
          type="button"
          aria-label="下一张"
          onClick={() => goTo(safeIndex + 1)}
          className="shrink-0 rounded-sm border border-edge bg-surface p-2.5 text-ink-2 transition hover:border-edge-2 hover:text-accent active:opacity-70"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-ink-3">快捷键：空格翻转 · ←/→ 切卡</p>
    </section>
  );
}