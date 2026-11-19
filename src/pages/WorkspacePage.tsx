import { useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Download,
  History,
  Layers,
  ListChecks,
  Loader2,
  RotateCcw,
  Sparkles,
  Timer,
  Trash2,
} from "lucide-react";
import { UploadZone } from "../components/core/UploadZone";
import { LoadingSkeleton } from "../components/core/LoadingSkeleton";
import { HistoryDrawer } from "../components/core/HistoryDrawer";
import { useDeckStore, addDeck, selectDeck, deleteDeck, updateCardStatus, removeWrong, appendAnalogy } from "../store/useDeckStore";
import type { CardStatus, WrongItem } from "../store/useDeckStore";
import { generateDeck } from "../api/generateDeck";
import type { DeckPayload } from "../api/generateDeck";
import { requestAnalogy } from "../api/analogy";
import { DeckApiError } from "../api/client";
import type { StudyDeck } from "../types/deck";
import { QuizEngine } from "./QuizEngine";

type TabKey = "concepts" | "cards" | "wrong" | "focus";

const TABS: { key: TabKey; label: string; icon: typeof BookOpen }[] = [
  { key: "concepts", label: "概念矩阵", icon: BookOpen },
  { key: "cards", label: "记忆闪卡", icon: Layers },
  { key: "wrong", label: "大白话错题本", icon: ListChecks },
  { key: "focus", label: "专注计时", icon: Timer },
];

const STATUS_LABEL: Record<CardStatus, string> = {
  unseen: "未看",
  review: "复习中",
  mastered: "已掌握",
};

function errorHint(e: DeckApiError): string | null {
  switch (e.code) {
    case "network":
      return import.meta.env.DEV
        ? "本地开发：确认转发服务已启动（node api/dev-server.ts，端口 8000）"
        : "检查网络连接后重试";
    case "service_not_configured":
      return "后端尚未配置 AI_API_KEY，请找 A 在 Sites 后台填入 Secret";
    case "auth_error":
      return "API Key 无效或已过期，请检查密钥配置";
    case "rate_limited":
      return "请求太频繁（每分钟限 10 次），稍等片刻再试";
    default:
      return null;
  }
}

export function WorkspacePage() {
  const { decks, currentDeckId, wrongItems, storageError } = useDeckStore();
  const deck = decks.find((d) => d.id === currentDeckId) ?? null;

  const [tab, setTab] = useState<TabKey>("concepts");
  const [view, setView] = useState<"workspace" | "quiz">("workspace");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<DeckApiError | null>(null);
  const [lastPayload, setLastPayload] = useState<DeckPayload | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [retryQuestions, setRetryQuestions] = useState<StudyDeck["quizzes"] | undefined>();
  const generationLock = useRef(false);

  async function generate(payload: DeckPayload) {
    if (generationLock.current) return;
    generationLock.current = true;
    setGenerating(true);
    setError(null);
    setLastPayload(payload);
    try {
      const created = await generateDeck(payload);
      addDeck(created);
      setLastPayload(null);
      setTab("concepts");
    } catch (e) {
      setError(
        e instanceof DeckApiError
          ? e
          : new DeckApiError("unknown", "生成失败，请重试", true),
      );
    } finally {
      generationLock.current = false;
      setGenerating(false);
    }
  }

  if (view === "quiz" && deck) {
    return (
      <QuizEngine
        deck={deck}
        retryQuestions={retryQuestions}
        onExit={(exitTab) => {
          setView("workspace");
          if (exitTab) setTab(exitTab);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Workspace · 工作台</p>
          <h1 className="mt-2 font-display text-2xl font-extralight tracking-[0.04em] text-ink">
            碎片笔记 · 学习工作台
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button" disabled={!deck}
            onClick={() => {
              if (!deck) return;
              const url = URL.createObjectURL(new Blob([JSON.stringify(deck, null, 2)], { type: "application/json" }));
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = `${deck.title.replace(/[<>:"/\\|?*\p{Cc}]/gu, "_").slice(0, 80)}.json`;
              anchor.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
            className="inline-flex items-center gap-2 border border-edge px-4 py-2 font-mono text-xs text-ink-2 transition-colors hover:border-accent disabled:opacity-50"
          ><Download className="h-3.5 w-3.5" />导出牌组</button>
          <button
            type="button"
            onClick={() => {
              setRetryQuestions(undefined);
              setView("quiz");
            }}
            disabled={!deck || generating}
            className="inline-flex items-center gap-2 border border-edge px-4 py-2 font-mono text-xs tracking-wider text-ink-2 transition-colors hover:border-accent hover:text-ink disabled:opacity-50"
          >
            <Timer className="h-3.5 w-3.5" />
            3 分钟小测
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 border border-edge px-4 py-2 font-mono text-xs tracking-wider text-ink-2 transition-colors hover:border-accent hover:text-ink"
          >
            <History className="h-3.5 w-3.5" />
            历史牌组
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {storageError && <p role="alert" className="border border-warn p-3 text-sm text-warn">{storageError}</p>}
        <UploadZone busy={generating} onSubmit={(p) => void generate(p)} />

        {error && (
          <section className="edge-glow p-5" role="alert">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-bad">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error.message}
            </p>
            {errorHint(error) && (
              <p className="mt-2 pl-6 font-mono text-[11px] leading-relaxed tracking-wider text-ink-3">
                {errorHint(error)}
              </p>
            )}
            {error.retryable && lastPayload && (
              <button
                type="button"
                onClick={() => void generate(lastPayload)}
                disabled={generating}
                className="mt-4 inline-flex items-center gap-2 border border-edge-2 px-4 py-1.5 font-mono text-xs tracking-wider text-ink-2 transition-colors hover:border-accent hover:text-ink disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                重试
              </button>
            )}
          </section>
        )}

        {generating ? (
          <LoadingSkeleton />
        ) : deck ? (
          <DeckWorkspace deck={deck} tab={tab} onTab={setTab} wrongItems={wrongItems} onRetry={(item) => {
            selectDeck(item.deckId);
            setRetryQuestions([item.quiz]);
            setView("quiz");
          }} />
        ) : (
          <section className="edge-glow p-8 text-center">
            <p className="text-sm text-ink-2">还没有牌组</p>
            <p className="mt-2 font-mono text-[11px] tracking-wider text-ink-3">
              上传资料或点「一键填入示例」，生成第一份学习牌组
            </p>
          </section>
        )}
      </div>

      {drawerOpen && <HistoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        decks={decks}
        currentDeckId={currentDeckId}
        onSelect={selectDeck}
        onDelete={deleteDeck}
      />}
    </div>
  );
}

function DeckWorkspace({
  deck,
  tab,
  onTab,
  wrongItems,
  onRetry,
}: {
  deck: StudyDeck;
  tab: TabKey;
  onTab: (t: TabKey) => void;
  wrongItems: WrongItem[];
  onRetry: (item: WrongItem) => void;
}) {
  const mastered = deck.flashcards.filter((c) => c.status === "mastered").length;
  return (
    <section className="edge-glow p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="border border-edge px-2.5 py-0.5 font-mono text-[11px] tracking-wider text-accent-2">
          {deck.subjectTag}
        </span>
        <h2 className="font-display text-lg font-semibold leading-snug text-ink">{deck.title}</h2>
      </div>
      {deck.sourceSummary && (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">{deck.sourceSummary}</p>
      )}
      <p className="mt-3 font-mono text-[11px] tracking-wider text-ink-3">
        CONCEPTS {deck.concepts.length} · CONFUSIONS {deck.confusions.length} · FLASHCARDS{" "}
        {deck.flashcards.length}（已掌握 {mastered}）· QUIZZES {deck.quizzes.length}
      </p>

      <div className="mt-5 flex flex-wrap gap-1 border-b border-edge">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onTab(key)}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition-colors ${
              tab === key
                ? "border-accent font-semibold text-ink"
                : "border-transparent text-ink-3 hover:text-ink-2"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "concepts" && <ConceptsPlaceholder deck={deck} />}
        {tab === "cards" && <CardsTempView deck={deck} />}
        {tab === "wrong" && <WrongTempView wrongItems={wrongItems} onRetry={onRetry} />}
        {tab === "focus" && <FocusPlaceholder />}
      </div>
    </section>
  );
}

// C 的 ConceptMatrix 未就绪：占位块只展示真实切片概况，不写死假数据。
function ConceptsPlaceholder({ deck }: { deck: StudyDeck }) {
  return (
    <div className="border border-dashed border-edge-2 p-5">
      <p className="kicker">ConceptMatrix · C 组件待接入</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">
        已备好 Props：concepts {deck.concepts.length} 条、confusions {deck.confusions.length} 组。
        组件就绪后在此挂载，展示概念定义与易混点对比。
      </p>
      <ul className="mt-4 space-y-1.5 font-mono text-[11px] tracking-wider text-ink-3">
        {deck.concepts.map((c) => (
          <li key={c.term}>· {c.term}</li>
        ))}
        {deck.confusions.map((c) => (
          <li key={c.topic}>· 易混：{c.topic}</li>
        ))}
      </ul>
    </div>
  );
}

// C 的 FlashCardDeck 未就绪：真数据临时列表，保证掌握度闭环可验收。
function CardsTempView({ deck }: { deck: StudyDeck }) {
  return (
    <div>
      <p className="kicker">FlashCardDeck · C 组件待接入（临时视图）</p>
      <ul className="mt-4 space-y-3">
        {deck.flashcards.map((card) => (
          <li key={card.id} className="border border-edge p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-ink">{card.front}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{card.back}</p>
              </div>
              <span className="shrink-0 border border-edge px-2 py-0.5 font-mono text-[10px] tracking-wider text-ink-3">
                {card.difficulty}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              {(Object.keys(STATUS_LABEL) as CardStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateCardStatus(card.id, s)}
                  className={`border px-3 py-1 font-mono text-[11px] tracking-wider transition-colors ${
                    card.status === s
                      ? s === "mastered"
                        ? "border-ok text-ok"
                        : s === "review"
                          ? "border-warn text-warn"
                          : "border-accent text-accent"
                      : "border-edge text-ink-3 hover:border-edge-2 hover:text-ink-2"
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// C 的 WrongBookView 未就绪：真数据临时视图，含「换个生活比喻」联动。
function WrongTempView({ wrongItems, onRetry }: { wrongItems: WrongItem[]; onRetry: (item: WrongItem) => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errId, setErrId] = useState<string | null>(null);

  async function newAnalogy(item: WrongItem) {
    setBusyId(item.id);
    setErrId(null);
    try {
      const last = item.customAnalogies?.[item.customAnalogies.length - 1];
      const text = await requestAnalogy({
        question: item.quiz.question,
        options: item.quiz.options,
        answerIndex: item.quiz.answerIndex,
        userChoiceIndex: item.userChoiceIndex,
        plainExplanation: last ?? item.quiz.plainExplanation,
      });
      appendAnalogy(item.id, text);
    } catch {
      setErrId(item.id);
    } finally {
      setBusyId(null);
    }
  }

  if (wrongItems.length === 0) {
    return (
      <div className="border border-dashed border-edge-2 p-5">
        <p className="kicker">WrongBookView · C 组件待接入（临时视图）</p>
        <p className="mt-3 text-sm text-ink-2">
          错题本还是空的——完成一次 3 分钟小测，答错的题会自动收进来。
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="kicker">WrongBookView · C 组件待接入（临时视图）</p>
      <ul className="mt-4 space-y-4">
        {wrongItems.map((item) => (
          <li key={item.id} className="border border-edge p-4">
            <p className="font-mono text-[10px] tracking-wider text-ink-3">{item.deckTitle}</p>
            <p className="mt-1.5 text-sm font-semibold leading-snug text-ink">{item.quiz.question}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">
              你的错选：
              <span className="text-bad">{item.quiz.options[item.userChoiceIndex] ?? "未作答"}</span>
              {" · "}正确答案：
              <span className="text-ok">{item.quiz.options[item.quiz.answerIndex]}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.quiz.plainExplanation}</p>
            {item.customAnalogies?.map((a, i) => (
              <p key={i} className="mt-2 border-l-2 border-gold pl-3 text-sm leading-relaxed text-gold">
                {a}
              </p>
            ))}
            {errId === item.id && (
              <p className="mt-2 text-xs text-bad">比喻生成失败，请稍后再试</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => onRetry(item)} className="inline-flex items-center gap-1.5 border border-edge px-3 py-1 font-mono text-[11px] text-ink-2 hover:border-accent">
                <RotateCcw className="h-3 w-3" />重做此题
              </button>
              <button
                type="button"
                onClick={() => void newAnalogy(item)}
                disabled={busyId !== null}
                className="inline-flex items-center gap-1.5 border border-edge px-3 py-1 font-mono text-[11px] tracking-wider text-ink-2 transition-colors hover:border-accent-2 hover:text-ink disabled:opacity-50"
              >
                {busyId === item.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                换个生活比喻
              </button>
              <button
                type="button"
                onClick={() => removeWrong(item.id)}
                className="inline-flex items-center gap-1.5 border border-edge px-3 py-1 font-mono text-[11px] tracking-wider text-ink-3 transition-colors hover:border-bad hover:text-bad"
              >
                <Trash2 className="h-3 w-3" />
                移出错题本
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FocusPlaceholder() {
  return (
    <div className="border border-dashed border-edge-2 p-5">
      <p className="kicker">FocusTimerBar · C 组件待接入</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">
        专注计时条组件就绪后在此挂载（Props：当前牌组学习时长统计回调）。
      </p>
    </div>
  );
}