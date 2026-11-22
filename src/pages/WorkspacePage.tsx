import { useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Download,
  History,
  KeyRound,
  Layers,
  ListChecks,
  RotateCcw,
  Sparkles,
  Timer,
} from "lucide-react";
import { UploadZone } from "../components/core/UploadZone";
import { LoadingSkeleton } from "../components/core/LoadingSkeleton";
import { HistoryDrawer } from "../components/core/HistoryDrawer";
import { AiSettingsDialog } from "../components/core/AiSettingsDialog";
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
import { getByok } from "../utils/byok";
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
      return "后端尚未配置 AI_API_KEY，请联系站点管理员在 Sites Settings 填入 Secret";
    case "auth_error":
      return getByok()
        ? "你自己的 API Key 无效或已过期，请在「AI 设置」里检查或清除"
        : "API Key 无效或已过期，请检查密钥配置";
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
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [hasByok, setHasByok] = useState(() => Boolean(getByok()));
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
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Workspace · 工作台</p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink">
            碎片笔记 · 学习工作台
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={!deck}
            onClick={() => {
              if (!deck) return;
              const url = URL.createObjectURL(new Blob([JSON.stringify(deck, null, 2)], { type: "application/json" }));
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = `${deck.title.replace(/[<>:"/\\|?*\p{Cc}]/gu, "_").slice(0, 80)}.json`;
              anchor.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
            className="btn-secondary"
          >
            <Download className="h-3.5 w-3.5" />
            导出牌组
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="btn-secondary"
          >
            <History className="h-3.5 w-3.5" />
            历史牌组
            <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[11px] font-bold text-ink-2 tabular-nums">
              {decks.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setAiSettingsOpen(true)}
            className="btn-secondary"
          >
            <KeyRound className="h-3.5 w-3.5" />
            AI 设置
            {hasByok && (
              <span className="h-2 w-2 rounded-full bg-ok" title="已启用自定义 API 设置" aria-label="已启用自定义 API 设置" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setRetryQuestions(undefined);
              setView("quiz");
            }}
            disabled={!deck || generating}
            className="btn-primary !px-4 !py-2 text-xs sm:text-sm"
          >
            <Timer className="h-4 w-4" />
            3 分钟小测
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {storageError && (
          <p role="alert" className="rounded-lg border tint-warn p-3.5 text-sm font-medium text-warn">
            {storageError}
          </p>
        )}
        <UploadZone busy={generating} onSubmit={(p) => void generate(p)} />

        {error && (
          <section className="panel-shell rounded-xl border tint-bad p-5" role="alert">
            <p className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-bad">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error.message}
            </p>
            {errorHint(error) && (
              <p className="mt-2 pl-6 font-mono text-[11px] leading-relaxed tracking-wider text-ink-2">
                {errorHint(error)}
              </p>
            )}
            {error.retryable && lastPayload && (
              <button
                type="button"
                onClick={() => void generate(lastPayload)}
                disabled={generating}
                className="btn-secondary mt-4"
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
          <section className="panel-shell p-8 text-center sm:p-10">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border tint-accent text-accent">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-base font-bold text-ink">还没有牌组</p>
            <p className="mt-2 text-xs text-ink-3 sm:text-sm">
              在上方上传资料或点「一键填入示例」，生成第一份学习牌组
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
      {aiSettingsOpen && (
        <AiSettingsDialog
          open={aiSettingsOpen}
          onClose={() => {
            setAiSettingsOpen(false);
            setHasByok(Boolean(getByok()));
          }}
        />
      )}
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
    <section className="panel-shell p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-block rounded-md border tint-accent px-2.5 py-1 text-xs font-bold text-accent">
          {deck.subjectTag}
        </span>
        <h2 className="font-display text-lg font-bold leading-snug text-ink sm:text-xl">{deck.title}</h2>
      </div>
      {deck.sourceSummary && (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">{deck.sourceSummary}</p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-ink-3">
        <span className="rounded-md border border-edge bg-surface px-2.5 py-1">概念 {deck.concepts.length}</span>
        <span className="rounded-md border border-edge bg-surface px-2.5 py-1">易混 {deck.confusions.length}</span>
        <span className="rounded-md border border-edge bg-surface px-2.5 py-1">
          闪卡 已掌握 {mastered} / {deck.flashcards.length}
        </span>
        <span className="rounded-md border border-edge bg-surface px-2.5 py-1">自测 {deck.quizzes.length}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5 rounded-xl border border-edge bg-void/50 p-1.5">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          const badge =
            key === "cards"
              ? deck.flashcards.length
              : key === "wrong" && wrongItems.length > 0
                ? wrongItems.length
                : null;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onTab(key)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-all sm:text-sm ${
                active
                  ? "border-accent/40 bg-surface font-bold text-accent shadow-sm"
                  : "border-transparent font-semibold text-ink-3 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {badge !== null && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                    key === "wrong"
                      ? "tint-bad text-bad"
                      : active
                        ? "tint-accent text-accent"
                        : "bg-surface-2 text-ink-2"
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
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
        <p role="alert" className="rounded-lg border tint-bad p-3.5 text-sm font-medium text-bad">
          比喻生成失败，请稍后再试：{analogyErr}
        </p>
      )}
      {wrongItems.length > 0 && (
        <div className="card-flat flex flex-wrap items-center gap-2 p-3.5">
          <span className="text-xs font-bold text-ink-3">重做此题：</span>
          {wrongItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onRetry(item)}
              className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface-2/50 px-3 py-1 text-xs font-semibold text-ink-2 transition-colors hover:border-accent hover:text-accent"
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