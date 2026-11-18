import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  FileText,
  HardDrive,
  Layers,
  Lightbulb,
  ListChecks,
  Plus,
  Timer,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { sampleDecks } from "./mock/sampleDecks";
import type { StudyDeck } from "./types/deck";

const NAV = [
  { id: "decks", label: "示例牌组" },
  { id: "experience", label: "核心体验" },
  { id: "stats", label: "数据" },
  { id: "faq", label: "常见问题" },
];

const FEATURES = [
  {
    icon: FileText,
    title: "多源投喂",
    desc: "粘贴大段提纲、上传课堂笔记照片或课件 PDF，也可以一键填入内置示例，零门槛开始。",
  },
  {
    icon: Lightbulb,
    title: "知识梳理",
    desc: "自动提炼高频考点，用左右对照表讲清「概念 A vs 概念 B」的判别边界与考法。",
  },
  {
    icon: Layers,
    title: "3D 记忆闪卡",
    desc: "丝滑翻卡 + 键盘快捷键 + 掌握度标记，把短期记忆变成长期记忆。",
  },
  {
    icon: ListChecks,
    title: "3 分钟随堂小测",
    desc: "限时测验自动判分，答错的题自动归入错题本，闭环巩固不遗漏。",
  },
  {
    icon: BookOpen,
    title: "大白话错题本",
    desc: "每道错题附生活类比式原理解释，还能追问「换个比喻再讲一遍」。",
  },
  {
    icon: Timer,
    title: "专注伴学",
    desc: "轻量专注倒计时与深呼吸休息提示，复习节奏张弛有度。",
  },
];

const FAQ = [
  {
    q: "这个工具是怎么工作的？",
    a: "你把碎片资料交给 AI 多模态解析引擎，它按统一的数据契约一次性产出概念摘要、易混点对比、记忆闪卡与随堂自测四件套，再由界面渲染成可翻、可测、可复盘的学习材料。",
  },
  {
    q: "我的笔记和数据存在哪里？",
    a: "牌组历史、闪卡掌握度与错题本都保存在你浏览器本地的 localStorage 中，刷新不丢失；解析请求经服务端转发层调用大模型，API Key 不会暴露在前端。",
  },
  {
    q: "不配置密钥能体验吗？",
    a: "能。内置计算机网络、高等数学、心理学三套完整示例牌组，无需任何配置即可离线浏览概念、对比、闪卡与自测题内容。",
  },
  {
    q: "支持哪些资料格式？",
    a: "纯文本提纲、JPG/PNG 笔记照片与课件 PDF。PDF 在浏览器内提取文字、图片压缩后送往多模态模型，超长资料会给出友好的截断提示。",
  },
];

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
      <div className="relative z-10 max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-md border border-edge bg-surface p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-sm bg-surface-2 px-2.5 py-1 text-xs font-bold text-accent">
              {deck.subjectTag}
            </span>
            <h3 className="mt-3 text-xl font-bold">{deck.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-sm border border-edge p-2 text-ink-2 transition hover:border-edge-2 hover:text-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-2">{deck.sourceSummary}</p>

        <h4 className="kicker mt-8">核心概念</h4>
        {deck.concepts.map((c) => (
          <div key={c.term} className="mt-3 rounded-sm bg-surface-2 p-4">
            <p className="font-bold">{c.term}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-2">{c.definition}</p>
            <span className="mt-2 inline-block rounded-sm bg-surface px-2 py-0.5 text-xs font-bold text-gold">
              {c.keyPoint}
            </span>
          </div>
        ))}

        <h4 className="kicker mt-8">易混点对比</h4>
        {deck.confusions.map((c) => (
          <div key={c.topic} className="mt-3 rounded-sm bg-surface-2 p-4">
            <p className="text-sm font-bold text-accent">{c.topic}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-sm bg-surface p-3">
                <p className="font-bold">{c.itemAName}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{c.itemAFeature}</p>
              </div>
              <div className="rounded-sm bg-surface p-3">
                <p className="font-bold">{c.itemBName}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{c.itemBFeature}</p>
              </div>
            </div>
            <p className="mt-3 text-sm font-bold leading-relaxed text-warn">{c.distinctionTip}</p>
          </div>
        ))}

        <h4 className="kicker mt-8">闪卡预览</h4>
        {deck.flashcards.map((f) => (
          <div key={f.id} className="mt-2 rounded-sm border border-edge p-3">
            <p className="text-sm font-bold">{f.front}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-2">{f.back}</p>
          </div>
        ))}
        <p className="mt-5 text-xs text-ink-3">完整 3D 翻卡、随堂小测与错题本交互即将上线。</p>
      </div>
    </div>
  );
}

function App() {
  const [active, setActive] = useState("decks");
  const [selected, setSelected] = useState<StudyDeck | null>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="relative min-h-screen">
      <img
        src="/wave.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-0 z-0 max-h-screen w-full object-cover"
      />
      <div className="dot-grid pointer-events-none absolute right-0 top-40 -z-10 h-40 w-24 opacity-70" aria-hidden="true" />
      <div className="dot-grid pointer-events-none absolute left-0 top-[560px] -z-10 h-40 w-24 opacity-70" aria-hidden="true" />
      <div className="light-spot pointer-events-none absolute left-1/2 top-24 -z-10 h-[630px] w-[1010px] -translate-x-1/2 max-md:hidden" aria-hidden="true" />

      <header className="sticky top-0 z-40 w-full bg-surface/50 px-4 py-5 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-6xl items-center justify-between gap-4">
          <a href="#top" className="flex items-baseline gap-3 transition-opacity hover:opacity-80">
            <span className="text-base font-black tracking-wide md:text-lg">碎片笔记</span>
            <span className="hidden text-sm font-bold text-ink-3 md:inline">一键变闪卡与自测题</span>
          </a>
          <nav aria-label="主导航" className="flex items-center gap-3 md:gap-8">
            <ul className="flex items-center gap-3 text-xs md:gap-8 md:text-base">
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
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main id="top" className="container relative z-10 mx-auto flex max-w-6xl flex-col gap-20 px-4 md:gap-28">
        <section className="flex flex-col items-center justify-center pt-16 text-center md:pt-32">
          <div className="max-w-xl">
            <h1
              className="typewriter mx-auto py-6 text-4xl font-bold"
              style={{ fontSize: "clamp(24px, 5vw, 36px)", ["--chars" as string]: 16 }}
            >
              碎片笔记 · 一键变闪卡与自测题
            </h1>
            <p className="text-lg leading-relaxed text-ink-2">
              把散落的课堂笔记、复习提纲、课件 PDF，变成能翻、能测、能复盘的学习材料。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-12">
              <a href="#decks" className="btn-primary">
                浏览示例牌组
                <ArrowDown className="h-4 w-4" />
              </a>
              <a href="#faq" className="font-bold text-accent underline transition hover:opacity-80">
                它怎么工作？
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
                className="edge-glow w-full p-6 text-left"
              >
                <span className="rounded-sm bg-surface px-2.5 py-1 text-xs font-bold text-accent">
                  {deck.subjectTag}
                </span>
                <h3 className="mt-4 text-lg font-bold leading-snug">{deck.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{deck.sourceSummary}</p>
                <p className="mt-5 text-xs font-bold text-ink-3">
                  概念 {deck.concepts.length} · 闪卡 {deck.flashcards.length} · 自测 {deck.quizzes.length}
                </p>
                <p className="mt-3 flex items-center gap-1 text-xs font-bold text-accent">
                  点击查看内容
                  <ArrowRight className="h-3.5 w-3.5" />
                </p>
              </button>
            ))}
          </div>
        </section>

        <section id="experience" className="reveal">
          <p className="kicker">EXPERIENCE</p>
          <h2 className="mt-2 text-2xl font-bold">核心体验</h2>
          <hr className="rule-accent" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-md border border-edge bg-surface p-6">
                <f.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{f.desc}</p>
              </div>
            ))}
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
                className="flex h-32 flex-col items-center justify-center rounded-md border border-edge bg-surface-2"
              >
                <span className="text-4xl font-black">{s.n}</span>
                <span className="mt-1 text-sm font-bold text-ink-2">{s.label}</span>
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
          <div className="max-w-3xl">
            {FAQ.map((item) => (
              <details key={item.q} className="group border-b border-edge">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-bold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Plus className="h-4 w-4 shrink-0 text-accent transition-transform group-open:rotate-45" />
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-ink-2">{item.a}</p>
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