import { useState } from "react";
import { ThemeToggle } from "../ThemeToggle";
import { sampleDecks } from "../../mock/sampleDecks";
import type { StudyDeck } from "../../types/deck";
import { FlashCardDeck } from "./FlashCardDeck";

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
          <FlashCardDeck cards={cards} onUpdateStatus={handleUpdateStatus} />
        </section>
      </div>
    </div>
  );
}