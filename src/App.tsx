import { BookOpen, Layers, ListChecks, Sparkles } from "lucide-react";
import { sampleDecks } from "./mock/sampleDecks";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            碎片笔记 · 一键变闪卡与自测题
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            阶段 1 基础框架：数据契约 + 内置示例已就绪，以下为离线 Mock 展示。
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sampleDecks.map((deck) => (
            <article
              key={deck.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="inline-block rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-semibold text-indigo-600">
                {deck.subjectTag}
              </span>
              <h2 className="mt-3 text-base font-bold leading-snug">{deck.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {deck.sourceSummary}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                  概念 {deck.concepts.length} · 易混 {deck.confusions.length}
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  闪卡 {deck.flashcards.length} 张
                </div>
                <div className="flex items-center gap-1.5">
                  <ListChecks className="h-3.5 w-3.5 text-slate-400" />
                  自测 {deck.quizzes.length} 题
                </div>
              </dl>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          正式 UI（3D 闪卡 / 概念对比 / 错题本 / 专注计时）将在阶段 2 接入。
        </p>
      </main>
    </div>
  );
}

export default App;