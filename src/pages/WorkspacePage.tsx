import { useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Download,
  History,
  Layers,
  ListChecks,
  RotateCcw,
  Timer,
} from "lucide-react";
import { UploadZone } from "../components/core/UploadZone";
import { LoadingSkeleton } from "../components/core/LoadingSkeleton";
import { HistoryDrawer } from "../components/core/HistoryDrawer";
import { ConceptMatrix } from "../components/rookie/ConceptMatrix";
import { FlashCardDeck } from "../components/rookie/FlashCardDeck";
import { WrongBookView } from "../components/rookie/WrongBookView";
import { FocusTimerBar } from "../components/rookie/FocusTimerBar";
import { useDeckStore, addDeck, selectDeck, deleteDeck, updateCardStatus, removeWrong, appendAnalogy } from "../store/useDeckStore";
import type { WrongItem } from "../store/useDeckStore";
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

function errorHint(e: DeckApiError): string | null {
  switch (e.code) {
    case "network":
      return import.meta.env.DEV
        ? "本地开发：确认转发服务已启动（node dev/dev-server.ts，端口 8000）"
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
        {tab === "concepts" && (
          <ConceptMatrix summary={deck.sourceSummary} concepts={deck.concepts} confusions={deck.confusions} />
        )}
        {tab === "cards" && (
          <FlashCardDeck cards={deck.flashcards} onUpdateStatus={(id, status) => updateCardStatus(id, status)} />
        )}
        {tab === "wrong" && <WrongTab wrongItems={wrongItems} onRetry={onRetry} />}
        {tab === "focus" && <FocusTimerBar />}
      </div>
    </section>
  );
}

// 集成层：C 的 WrongBookView 按契约只收 onRemove/onAskMoreAnalogy；
// 「重做此题」与比喻失败提示属于业务闭环，由集成层补齐，不改 rookie 组件。
function WrongTab({ wrongItems, onRetry }: { wrongItems: WrongItem[]; onRetry: (item: WrongItem) => void }) {
  const [analogyErr, setAnalogyErr] = useState<string | null>(null);

  async function askAnalogy(id: string) {
    const item = wrongItems.find((w) => w.id === id);
    if (!item) return;
    setAnalogyErr(null);
    try {
      const last = item.customAnalogies?.[item.customAnalogies.length - 1];
      const text = await requestAnalogy({
        question: item.quiz.question,
        options: item.quiz.options,
        answerIndex: item.quiz.answerIndex,
        userChoiceIndex: item.userChoiceIndex,
        plainExplanation: last ?? item.quiz.plainExplanation,
      });
      appendAnalogy(id, text);
    } catch {
      setAnalogyErr(item.quiz.question);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {analogyErr && (
        <p role="alert" className="border border-bad p-3 text-sm text-bad">
          比喻生成失败，请稍后再试：{analogyErr}
        </p>
      )}
      {wrongItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] tracking-wider text-ink-3">重做此题：</span>
          {wrongItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onRetry(item)}
              className="inline-flex items-center gap-1.5 border border-edge px-3 py-1 font-mono text-[11px] text-ink-2 transition-colors hover:border-accent hover:text-ink"
            >
              <RotateCcw className="h-3 w-3" />
              {item.quiz.question.slice(0, 14)}…
            </button>
          ))}
        </div>
      )}
      <WrongBookView wrongItems={wrongItems} onRemove={removeWrong} onAskMoreAnalogy={askAnalogy} />
    </div>
  );
}