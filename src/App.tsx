import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  HardDrive,
  Layers,
  Lightbulb,
  ListChecks,
  Plus,
  Sparkles,
  Timer,
  X,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { FAQ, FEATURES, HERO, NAV } from "./content";
import { sampleDecks } from "./mock/sampleDecks";
import type { StudyDeck } from "./types/deck";

const WorkspacePage = lazy(() =>
  import("./pages/WorkspacePage").then((module) => ({ default: module.WorkspacePage })),
);

const FEATURE_ICONS: Record<string, typeof FileText> = {
  file: FileText,
  bulb: Lightbulb,
  layers: Layers,
  checks: ListChecks,
  book: BookOpen,
  timer: Timer,
};

const totals = sampleDecks.reduce(
  (acc, d) => ({
    concepts: acc.concepts + d.concepts.length,
    cards: acc.cards + d.flashcards.length,
    quizzes: acc.quizzes + d.quizzes.length,
  }),
  { concepts: 0, cards: 0, quizzes: 0 },
);

function DeckModal({ deck, onClose }: { deck: StudyDeck; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={deck.title}>
      <button
        type="button"
        aria-label="关闭详情"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-void/70 backdrop-blur-sm"
      />
      <div className="relative z-10 max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-edge-2 bg-surface p-6 shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block rounded-md border tint-accent px-2.5 py-1 text-xs font-bold text-accent">
              {deck.subjectTag}
            </span>
            <h3 className="mt-3 text-xl font-bold">{deck.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-lg border border-edge bg-surface-2/40 p-2 text-ink-2 transition hover:border-edge-2 hover:text-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 rounded-lg border tint-accent p-3.5 text-sm leading-relaxed text-ink-2">
          {deck.sourceSummary}
        </p>

        <h4 className="kicker mt-8">核心概念</h4>
        <div className="mt-3 space-y-3">
          {deck.concepts.map((c) => (
            <div key={c.term} className="card-flat p-4">
              <p className="font-bold text-ink">{c.term}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{c.definition}</p>
              <span className="mt-3 inline-block rounded-md border tint-gold px-2.5 py-1 text-xs font-bold text-gold">
                {c.keyPoint}
              </span>
            </div>
          ))}
        </div>

        <h4 className="kicker mt-8">易混点对比</h4>
        <div className="mt-3 space-y-3">
          {deck.confusions.map((c) => (
            <div key={c.topic} className="card-flat p-4">
              <p className="text-sm font-bold text-accent">{c.topic}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-edge/70 bg-surface-2/50 p-3.5">
                  <p className="font-bold text-ink">{c.itemAName}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">{c.itemAFeature}</p>
                </div>
                <div className="rounded-md border border-edge/70 bg-surface-2/50 p-3.5">
                  <p className="font-bold text-ink">{c.itemBName}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">{c.itemBFeature}</p>
                </div>
              </div>
              <p className="mt-3 rounded-md border tint-warn px-3 py-2 text-sm font-bold leading-relaxed text-warn">
                {c.distinctionTip}
              </p>
            </div>
          ))}
        </div>

        <h4 className="kicker mt-8">闪卡预览</h4>
        <div className="mt-3 space-y-2.5">
          {deck.flashcards.map((f) => (
            <div key={f.id} className="card-flat p-3.5">
              <p className="text-sm font-bold text-ink">{f.front}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{f.back}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-5">
          <p className="text-xs text-ink-3">
            3D 翻卡、随堂小测与大白话错题本已在学习工作台上线。
          </p>
          <a href="#workspace" className="btn-primary !px-4 !py-2 text-xs sm:text-sm">
            去工作台体验完整闭环
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [active, setActive] = useState("decks");
  const [selected, setSelected] = useState<StudyDeck | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(() => window.location.hash === "#workspace");

  useEffect(() => {
    const onHashChange = () => {
      setWorkspaceOpen(window.location.hash === "#workspace");
      setSelected(null);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (workspaceOpen) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    document.getElementById(window.location.hash.slice(1) || "top")?.scrollIntoView({ behavior: "instant" });
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) spy.observe(el);
    });
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            reveal.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));
    return () => {
      spy.disconnect();
      reveal.disconnect();
    };
  }, [workspaceOpen]);

  if (workspaceOpen) {
    return (
      <div className="site-shell relative min-h-screen overflow-x-clip">
        <div className="light-spot pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[960px] -translate-x-1/2 opacity-65 max-md:hidden" aria-hidden="true" />
        <div className="dot-grid pointer-events-none absolute right-0 top-28 -z-10 h-44 w-28 opacity-45" aria-hidden="true" />
        <header className="sticky top-0 z-40 border-b border-edge/70 bg-surface/75 px-4 py-3.5 backdrop-blur-md sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a href="#top" className="btn-secondary !px-3.5 !py-1.5 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                返回首页
              </a>
              <span className="hidden items-center gap-2 text-sm font-bold text-ink-2 sm:inline-flex">
                <Layers className="h-4 w-4 text-accent" aria-hidden="true" />
                {HERO.brand}
              </span>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="relative z-10">
          <Suspense fallback={<p role="status" className="p-6 text-center text-ink-2">正在加载学习工作台…</p>}>
            <WorkspacePage />
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <div className="site-shell relative min-h-screen overflow-x-clip">
      <img
        src="/wave.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-0 z-0 max-h-screen w-full object-cover"
      />
      <div className="dot-grid pointer-events-none absolute right-0 top-40 -z-10 h-40 w-24 opacity-70" aria-hidden="true" />
      <div className="dot-grid pointer-events-none absolute left-0 top-[560px] -z-10 h-40 w-24 opacity-70" aria-hidden="true" />
      <div className="light-spot pointer-events-none absolute left-1/2 top-24 -z-10 h-[630px] w-[1010px] -translate-x-1/2 max-md:hidden" aria-hidden="true" />

      <header className="sticky top-0 z-40 w-full border-b border-edge/50 bg-surface/70 px-4 py-4 backdrop-blur-md">
        <div className="container mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-4">
          <a href="#top" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap transition-opacity hover:opacity-85">
            <span className="hidden h-8 w-8 items-center justify-center rounded-lg border tint-accent text-accent sm:flex">
              <Layers className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex items-baseline gap-2.5">
              <span className="text-base font-black tracking-wide md:text-lg">{HERO.brand}</span>
              <span className="hidden text-sm font-bold text-ink-3 md:inline">{HERO.brandSub}</span>
            </span>
          </a>
          <nav aria-label="主导航" className="flex items-center gap-2.5 sm:gap-4 md:gap-8">
            <ul className="flex items-center gap-2.5 whitespace-nowrap text-xs sm:gap-5 md:gap-8 md:text-base">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    className={`font-bold transition ${active === n.id ? "text-accent" : "text-ink-2 hover:text-ink"}`}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="shrink-0">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      <main id="top" className="container relative z-10 mx-auto flex max-w-6xl flex-col gap-20 px-4 md:gap-28">
        <section className="flex flex-col items-center justify-center pt-14 text-center md:pt-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border tint-accent px-3.5 py-1 text-xs font-bold text-accent">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              AI 理解型学习闭环 · 概念 / 闪卡 / 小测 / 错题本
            </span>
            <h1
              className="typewriter mx-auto py-6 text-4xl font-bold"
              style={{ fontSize: "calc(clamp(24px, 5vw, 36px) * var(--site-type, 1))", ["--chars" as string]: HERO.title.length }}
            >
              {HERO.title}
            </h1>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg">{HERO.sub}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-10 sm:gap-5">
              <a href="#workspace" className="group btn-primary !px-6 !py-3">
                进入学习工作台
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
              <a href="#decks" className="btn-secondary !px-5 !py-3 !text-sm">
                {HERO.cta}
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#faq" className="px-2 py-1 text-sm font-bold text-accent underline underline-offset-4 transition hover:opacity-80">
                {HERO.ctaAlt}
              </a>
            </div>
          </div>
        </section>

        <section id="decks" className="reveal">
          <p className="kicker">DECKS</p>
          <h2 className="mt-2 text-2xl font-bold">示例牌组</h2>
          <hr className="rule-accent" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleDecks.map((deck) => (
              <button
                key={deck.id}
                type="button"
                onClick={() => setSelected(deck)}
                className="group edge-glow flex h-full w-full flex-col justify-between p-6 text-left"
              >
                <div>
                  <span className="inline-block rounded-md border tint-accent px-2.5 py-1 text-xs font-bold text-accent">
                    {deck.subjectTag}
                  </span>
                  <h3 className="mt-4 text-lg font-bold leading-snug text-ink">{deck.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{deck.sourceSummary}</p>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-edge/60 pt-4">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-ink-3">
                    <span className="rounded bg-surface/80 px-2 py-0.5">概念 {deck.concepts.length}</span>
                    <span className="rounded bg-surface/80 px-2 py-0.5">闪卡 {deck.flashcards.length}</span>
                    <span className="rounded bg-surface/80 px-2 py-0.5">自测 {deck.quizzes.length}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-accent">
                    查看内容
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section id="experience" className="reveal">
          <p className="kicker">EXPERIENCE</p>
          <h2 className="mt-2 text-2xl font-bold">核心体验</h2>
          <hr className="rule-accent" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = FEATURE_ICONS[f.icon];
              return (
                <div key={f.title} className="group edge-glow flex flex-col p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border tint-accent text-accent transition-transform duration-200 group-hover:scale-105">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="stats" className="reveal">
          <p className="kicker">NUMBERS</p>
          <h2 className="mt-2 text-2xl font-bold">内置示例数据</h2>
          <hr className="rule-accent" />
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { n: sampleDecks.length, label: "学科牌组" },
              { n: totals.concepts, label: "核心概念" },
              { n: totals.cards, label: "记忆闪卡" },
              { n: totals.quizzes, label: "随堂自测" },
            ].map((s) => (
              <div
                key={s.label}
                className="edge-glow flex h-36 flex-col items-center justify-center p-4 text-center"
              >
                <span className="accent-grad-text text-4xl font-black tabular-nums">{s.n}</span>
                <span className="mt-2 text-sm font-bold text-ink-2">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-ink-3">
            <HardDrive className="h-4 w-4 text-accent" />
            你的牌组历史、掌握度与错题本将保存在浏览器本地，刷新不丢失。
          </p>
        </section>

        <section id="faq" className="reveal">
          <p className="kicker">FAQ</p>
          <h2 className="mt-2 text-2xl font-bold">常见问题</h2>
          <hr className="rule-accent" />
          <div className="max-w-3xl space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-edge bg-surface/85 px-5 transition-colors hover:border-edge-2 open:border-accent/50"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold text-ink [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Plus className="h-4 w-4 shrink-0 text-accent transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-ink-2">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 mt-24 flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-ink-2">
          <a
            href="https://github.com/Misaki-asahi/fragment-notes"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-accent underline transition hover:opacity-80"
          >
            GitHub 仓库
          </a>
        </p>
        <p className="text-xs text-ink-3">碎片笔记 · Qoder 高校创造力大赛参赛作品 · 示例数据仅供演示</p>
      </footer>

      {selected && <DeckModal deck={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default App;