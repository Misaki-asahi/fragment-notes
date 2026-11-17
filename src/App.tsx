import { BookOpen, Layers, ListChecks } from "lucide-react";
import { ThemeToggle } from "./components/ThemeToggle";
import { sampleDecks } from "./mock/sampleDecks";

const totals = sampleDecks.reduce(
  (acc, d) => ({
    cards: acc.cards + d.flashcards.length,
    quizzes: acc.quizzes + d.quizzes.length,
  }),
  { cards: 0, quizzes: 0 },
);

function App() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-edge bg-void/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-bold tracking-[0.18em] text-accent-2">
              FLASHBIRD NOTES
            </span>
            <span className="text-sm text-ink-3">碎片笔记</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-14">
        <p className="kicker">Study Decks · 离线示例</p>
        <h1
          className="typewriter mt-4 font-display font-extralight tracking-[0.06em] text-ink"
          style={{ fontSize: "clamp(19px, 5vw, 38px)", ["--chars" as string]: 16 }}
        >
          碎片笔记 · 一键变闪卡与自测题
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-2">
          粘贴提纲、上传笔记照片或课件 PDF，AI 一次性产出概念摘要、易混点对比、记忆闪卡与随堂自测。
          当前提供内置示例的离线浏览，AI 解析与交互学习功能即将上线。
        </p>
        <p className="mt-6 font-mono text-xs tracking-wider text-ink-3">
          {sampleDecks.length} DECKS · {totals.cards} FLASHCARDS · {totals.quizzes} QUIZZES
        </p>

        <section className="mt-14">
          <div className="flex items-end justify-between">
            <div>
              <p className="kicker">Decks</p>
              <h2 className="mt-2 font-display text-xl font-light tracking-wide text-ink">
                内置示例牌组
              </h2>
            </div>
            <span className="font-mono text-xs text-ink-3">MOCK · OFFLINE</span>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sampleDecks.map((deck, i) => (
              <article key={deck.id} className="edge-glow p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="border border-edge px-2.5 py-0.5 font-mono text-[11px] tracking-wider text-accent-2">
                    {deck.subjectTag}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold leading-snug text-ink">
                  {deck.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{deck.sourceSummary}</p>
                <dl className="mt-5 space-y-1.5 font-mono text-[11px] tracking-wider text-ink-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    CONCEPTS {deck.concepts.length} · CONFUSIONS {deck.confusions.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" />
                    FLASHCARDS {deck.flashcards.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-3.5 w-3.5" />
                    QUIZZES {deck.quizzes.length}
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-16 border-t border-edge pt-6 font-mono text-[11px] tracking-wider text-ink-3">
          NEXT › 3D 闪卡 / 概念对比 / 3 分钟小测 / 大白话错题本 / 专注计时 · 即将上线
        </p>
      </main>
    </div>
  );
}

export default App;