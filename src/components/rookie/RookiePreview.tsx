import { useState } from "react";
import { ThemeToggle } from "../ThemeToggle";
import { sampleDecks } from "../../mock/sampleDecks";
import type { StudyDeck } from "../../types/deck";

const deck = sampleDecks[0];

export function RookiePreview() {
  const [cards, setCards] = useState<StudyDeck["flashcards"]>(deck.flashcards);

  const handleUpdateStatus = (cardId: string, status: "review" | "mastered") => {
    console.log("[RookiePreview] onUpdateStatus:", cardId, status);
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, status } : c)));
  };

  return (
    <div className="min-h-screen bg-void px-4 py-8 text-ink">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="kicker">ROOKIE SANDBOX</p>
            <h1 className="mt-1 text-2xl font-bold">组件预览台</h1>
          </div>
          <ThemeToggle />
        </header>

        <section className="edge-glow p-6">
          <span className="rounded-sm bg-surface px-2.5 py-1 text-xs font-bold text-accent">
            {deck.subjectTag}
          </span>
          <h2 className="mt-3 text-lg font-bold">{deck.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{deck.sourceSummary}</p>
          <p className="mt-4 text-xs font-bold text-ink-3">
            概念 {deck.concepts.length} · 闪卡 {cards.length} · 自测 {deck.quizzes.length}
          </p>
        </section>

        <section>
          <p className="kicker">FLASHCARDS</p>
          <hr className="rule-accent" />
          <div className="rounded-md border border-edge bg-surface p-6 text-sm text-ink-2">
            FlashCardDeck 组件将在 Level 1 挂载到这里。
            <span className="mt-2 block text-xs text-ink-3">
              回调已就绪：onUpdateStatus 会 console.log 并更新本地 cards 状态。
            </span>
            <button
              type="button"
              onClick={() => handleUpdateStatus(cards[0].id, "mastered")}
              className="btn-primary mt-4 px-4 py-2 text-xs"
            >
              试一下回调：标记第一张卡为已掌握
            </button>
            <p className="mt-2 text-xs text-ink-3">
              第一张卡当前状态：{cards[0].status}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}