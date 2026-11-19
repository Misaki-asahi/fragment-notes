import { useState } from "react";
import { ThemeToggle } from "../ThemeToggle";
import { sampleDecks } from "../../mock/sampleDecks";
import type { StudyDeck } from "../../types/deck";
import { FlashCardDeck } from "./FlashCardDeck";
import { ConceptMatrix } from "./ConceptMatrix";
import { WrongBookView, type WrongItem } from "./WrongBookView";
import { FocusTimerBar } from "./FocusTimerBar";

const deck = sampleDecks[0];

const initialWrongItems: WrongItem[] = deck.quizzes.slice(0, 2).map((quiz, i) => ({
  id: `wrong-${quiz.id}`,
  deckTitle: deck.title,
  quiz,
  userChoiceIndex: (quiz.answerIndex + 1 + i) % 4,
}));

const MOCK_ANALOGIES = [
  "就像寄快递：TCP 是签收确认的挂号信，UDP 是往邮筒一扔的明信片。",
  "把网络想象成马路：流量控制怕收件人拆不过来，拥塞控制怕整条路堵死。",
  "记忆像肌肉：翻卡是举铁，小测是体测，错题本是教练的动作纠正。",
];

export function RookiePreview() {
  const [cards, setCards] = useState<StudyDeck["flashcards"]>(deck.flashcards);
  const [wrongItems, setWrongItems] = useState<WrongItem[]>(initialWrongItems);

  const handleUpdateStatus = (cardId: string, status: "review" | "mastered") => {
    console.log("[RookiePreview] onUpdateStatus:", cardId, status);
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, status } : c)));
  };

  const handleRemove = (id: string) => {
    console.log("[RookiePreview] onRemove:", id);
    setWrongItems((prev) => prev.filter((w) => w.id !== id));
  };

  const handleAskMoreAnalogy = async (id: string) => {
    console.log("[RookiePreview] onAskMoreAnalogy:", id);
    await new Promise((r) => setTimeout(r, 800));
    setWrongItems((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              customAnalogies: [
                ...(w.customAnalogies ?? []),
                MOCK_ANALOGIES[(w.customAnalogies?.length ?? 0) % MOCK_ANALOGIES.length],
              ],
            }
          : w,
      ),
    );
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

        <FocusTimerBar />

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

        <section>
          <ConceptMatrix
            summary={deck.sourceSummary}
            concepts={deck.concepts}
            confusions={deck.confusions}
          />
        </section>

        <section>
          <WrongBookView
            wrongItems={wrongItems}
            onRemove={handleRemove}
            onAskMoreAnalogy={handleAskMoreAnalogy}
          />
        </section>
      </div>
    </div>
  );
}