import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  Check,
  Eye,
  Flame,
  LoaderCircle,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Sparkles,
  Timer,
} from "lucide-react";
import { requestAnalogy } from "../../api/analogy";
import { getFallbackAnalogy, segmentByTerms, type SparkQuizCard } from "./sparkData";

interface SparkQuizViewProps {
  initialCards: SparkQuizCard[];
  scopeLabel: string;
  onBackToStream: () => void;
  onRestartAll: () => void;
}

const QUIZ_TOTAL_SECONDS = 180;

export function SparkQuizView({
  initialCards,
  scopeLabel,
  onBackToStream,
  onRestartAll,
}: SparkQuizViewProps) {
  const [modeFilter, setModeFilter] = useState<"all" | "flip" | "cloze">("all");
  const [queue, setQueue] = useState<SparkQuizCard[]>(initialCards);
  const [cursor, setCursor] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(() => new Set());
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [streakAnimKey, setStreakAnimKey] = useState(0);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => new Set());
  const [missedIds, setMissedIds] = useState<Set<string>>(() => new Set());
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_TOTAL_SECONDS);
  const [timerPaused, setTimerPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [analogiesByCard, setAnalogiesByCard] = useState<Record<string, string[]>>({});
  const [analogyLoading, setAnalogyLoading] = useState(false);

  const resetDeckState = useCallback(
    (nextMode: "all" | "flip" | "cloze") => {
      const filtered =
        nextMode === "all" ? initialCards : initialCards.filter((c) => c.mode === nextMode);
      setModeFilter(nextMode);
      setQueue(filtered.length > 0 ? filtered : initialCards);
      setCursor(0);
      setFlipped(false);
      setRevealedIndices(new Set());
      setStreak(0);
      setMaxStreak(0);
      setMasteredIds(new Set());
      setMissedIds(new Set());
      setSecondsLeft(QUIZ_TOTAL_SECONDS);
      setTimerPaused(false);
      setCompleted(false);
    },
    [initialCards],
  );

  useEffect(() => {
    if (completed || timerPaused) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [completed, timerPaused]);

  const card = queue[cursor];
  const uniqueTargetCount = useMemo(() => new Set(queue.map((q) => q.id)).size, [queue]);

  const toggleRevealAll = useCallback(
    (targetCard: SparkQuizCard) => {
      const segs = segmentByTerms(targetCard.clozeSentence, targetCard.clozeTerms);
      const allClozeIdx = segs.filter((s) => s.isCloze).map((s) => s.termIndex);
      setRevealedIndices((prev) => {
        if (prev.size >= allClozeIdx.length) return new Set();
        return new Set(allClozeIdx);
      });
    },
    [],
  );

  const handleRemembered = useCallback(() => {
    if (!card || completed) return;
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.add(card.id);
      return next;
    });
    setStreak((prev) => {
      const next = prev + 1;
      setMaxStreak((m) => Math.max(m, next));
      setStreakAnimKey((k) => k + 1);
      return next;
    });
    setFlipped(false);
    setRevealedIndices(new Set());

    if (cursor + 1 >= queue.length) {
      setCompleted(true);
    } else {
      setCursor((c) => c + 1);
    }
  }, [card, completed, cursor, queue.length]);

  const handleNeedRetry = useCallback(() => {
    if (!card || completed) return;
    setStreak(0);
    setMissedIds((prev) => {
      const next = new Set(prev);
      next.add(card.id);
      return next;
    });
    // 没掌握的卡片塞回当前队列末尾循环巩固
    setQueue((prev) => [...prev, { ...card, retryCount: card.retryCount + 1 }]);
    setFlipped(false);
    setRevealedIndices(new Set());
    setCursor((c) => c + 1);
  }, [card, completed]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (completed || !card || e.repeat) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable]")
      ) {
        return;
      }
      if (e.key === " ") {
        if (target instanceof HTMLElement && target.closest("button")) return;
        e.preventDefault();
        if (card.mode === "flip") setFlipped((f) => !f);
        else toggleRevealAll(card);
      } else if (e.key === "1") {
        e.preventDefault();
        handleNeedRetry();
      } else if (e.key === "2") {
        e.preventDefault();
        handleRemembered();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [card, completed, handleNeedRetry, handleRemembered, toggleRevealAll]);

  async function askExtraAnalogy(targetCard: SparkQuizCard) {
    if (analogyLoading) return;
    setAnalogyLoading(true);
    const existing = analogiesByCard[targetCard.id] ?? [];
    try {
      const text = await requestAnalogy({
        question: targetCard.frontQuestion,
        options: [targetCard.sourceExcerpt, "概念混淆项 A", "概念混淆项 B", "无关干扰项"],
        answerIndex: 0,
        userChoiceIndex: 1,
        plainExplanation: existing[existing.length - 1] ?? targetCard.backAnswer,
      });
      setAnalogiesByCard((prev) => ({
        ...prev,
        [targetCard.id]: [...(prev[targetCard.id] ?? []), text],
      }));
    } catch {
      // 无密钥或离线时使用贴合当前卡片的本地生活类比兜底，保证演示不中断
      const fallback = getFallbackAnalogy(targetCard.sourceExcerpt, existing.length);
      setAnalogiesByCard((prev) => ({
        ...prev,
        [targetCard.id]: [...(prev[targetCard.id] ?? []), fallback],
      }));
    } finally {
      setAnalogyLoading(false);
    }
  }

  function resetCurrentDeck() {
    resetDeckState(modeFilter);
  }

  if (queue.length === 0) {
    return (
      <section className="rounded-2xl border border-edge bg-surface p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-ink">当前没有可复习的闪卡</p>
        <button type="button" onClick={onBackToStream} className="btn-secondary mt-4">
          返回碎片信息流
        </button>
      </section>
    );
  }

  if (completed) {
    const firstPassCorrect = Math.max(0, uniqueTargetCount - missedIds.size);
    const accuracy =
      uniqueTargetCount > 0 ? Math.round((firstPassCorrect / uniqueTargetCount) * 100) : 100;
    const elapsed = QUIZ_TOTAL_SECONDS - secondsLeft;
    const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const ss = String(elapsed % 60).padStart(2, "0");

    return (
      <section
        className="rounded-2xl border border-edge bg-surface p-6 shadow-sm sm:p-8"
        aria-label="今日复习战报卡片"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border tint-accent px-3 py-1 text-xs font-bold text-accent">
            <Award className="h-4 w-4" />
            今日复习战报卡片
          </span>
          <span className="font-mono text-xs font-semibold text-ink-3">{scopeLabel}</span>
        </div>

        <h2 className="mt-4 text-2xl font-black tracking-tight text-ink">
          全部通关！{uniqueTargetCount} 张卡片已巩固
        </h2>
        <p className="mt-1.5 text-sm text-ink-2">
          自适应循环重测已完成——没掌握的卡片都已通过二次回忆加固记忆。
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-edge bg-surface-2/60 p-4 text-center">
            <p className="font-mono text-2xl font-black text-accent tabular-nums">
              {masteredIds.size}
            </p>
            <p className="mt-1 text-xs font-semibold text-ink-3">已掌握卡片</p>
          </div>
          <div className="rounded-xl border border-edge bg-surface-2/60 p-4 text-center">
            <p className="font-mono text-2xl font-black text-ink tabular-nums">{accuracy}%</p>
            <p className="mt-1 text-xs font-semibold text-ink-3">首轮一次记住</p>
          </div>
          <div className="rounded-xl border border-edge bg-surface-2/60 p-4 text-center">
            <p className="font-mono text-2xl font-black text-gold tabular-nums">
              {maxStreak} 🔥
            </p>
            <p className="mt-1 text-xs font-semibold text-ink-3">最高连胜</p>
          </div>
          <div className="rounded-xl border border-edge bg-surface-2/60 p-4 text-center">
            <p className="font-mono text-2xl font-black text-ink tabular-nums">
              {mm}:{ss}
            </p>
            <p className="mt-1 text-xs font-semibold text-ink-3">专注用时</p>
          </div>
        </div>

        {missedIds.size > 0 && (
          <div className="mt-5 rounded-xl border tint-warn p-4">
            <p className="text-xs font-bold text-warn">
              本轮触发重测的重点卡片（{missedIds.size} 张，建议明天间隔再看一遍）
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-ink-2">
              {Array.from(missedIds).map((id) => {
                const match = initialCards.find((c) => c.id === id);
                return match ? <li key={id}>• {match.sourceExcerpt}</li> : null;
              })}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={resetCurrentDeck} className="btn-primary text-sm">
            <RotateCcw className="h-4 w-4" />
            再闯一轮
          </button>
          <button type="button" onClick={onRestartAll} className="btn-secondary">
            测全部笔记
          </button>
          <button type="button" onClick={onBackToStream} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            返回碎片流
          </button>
        </div>
      </section>
    );
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const progressPct =
    uniqueTargetCount > 0
      ? Math.min(100, Math.round((masteredIds.size / uniqueTargetCount) * 100))
      : 0;
  const segments = segmentByTerms(card.clozeSentence, card.clozeTerms);
  const allClozeCount = segments.filter((s) => s.isCloze).length;
  const extraAnalogies = analogiesByCard[card.id] ?? [];

  return (
    <section className="flex flex-col gap-6" aria-label="交互式闪卡与自测模式">
      {/* 顶部返回 + 题型筛选 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToStream}
            className="btn-secondary !px-3 !py-1.5 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回信息流
          </button>
          <span className="text-xs font-bold text-ink-3">{scopeLabel}</span>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-edge bg-surface p-1">
          {(
            [
              { key: "all", label: "混合模式" },
              { key: "flip", label: "3D 概念卡" },
              { key: "cloze", label: "高亮挖空" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => resetDeckState(item.key)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                modeFilter === item.key
                  ? "tint-accent border font-bold text-accent"
                  : "text-ink-2 hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 顶部游戏化状态栏（进度条 + 连胜火焰 + 3 分钟倒计时） */}
      <div className="rounded-2xl border border-edge bg-surface p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-black text-ink tabular-nums">
              {Math.min(masteredIds.size + 1, uniqueTargetCount)} / {uniqueTargetCount}
            </span>
            <span className="text-xs font-medium text-ink-3">
              当前队列剩余 {queue.length - cursor} 张
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              key={streakAnimKey}
              className="streak-pop inline-flex items-center gap-1 rounded-full border tint-gold px-2.5 py-0.5 font-mono text-xs font-bold text-gold tabular-nums"
            >
              <Flame className="h-3.5 w-3.5 fill-current" />
              Streak {streak}
            </span>
            <button
              type="button"
              onClick={() => setTimerPaused((p) => !p)}
              aria-label={timerPaused ? "继续计时" : "暂停计时"}
              className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface-2/70 px-2.5 py-0.5 font-mono text-xs font-bold text-ink-2 tabular-nums transition hover:border-edge-2"
            >
              <Timer className="h-3.5 w-3.5 text-accent" />
              {mm}:{ss}
              {timerPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
          </div>
        </div>

        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="复习掌握进度"
        >
          <div
            className="h-full rounded-full bg-accent-2 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 卡片主体：模式 1 (3D 翻转概念卡) vs 模式 2 (高亮挖空卡) */}
      {card.mode === "flip" ? (
        <div className="pb-4">
          <div className="relative">
            {queue.length - cursor > 2 && <div className="flashcard-stack-2" aria-hidden="true" />}
            {queue.length - cursor > 1 && <div className="flashcard-stack-1" aria-hidden="true" />}
            <div
              key={`${card.id}-${cursor}`}
              className="flashcard-stage flashcard-enter-next w-full cursor-pointer select-none"
              role="button"
              tabIndex={0}
              aria-pressed={flipped}
              aria-label={flipped ? "闪卡背面，点击翻回正面" : "闪卡正面，点击翻转查看解析"}
              onClick={() => setFlipped((f) => !f)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setFlipped((f) => !f);
                }
              }}
            >
              <div className={`flashcard-inner ${flipped ? "is-flipped" : ""}`}>
                {/* 正面：核心提问 */}
                <div className="flashcard-face flashcard-face-front p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-md border tint-accent px-2.5 py-0.5 text-[11px] font-bold text-accent">
                      3D 概念翻卡 · 问题
                    </span>
                    <div className="flex items-center gap-1.5">
                      {card.retryCount > 0 && (
                        <span className="rounded-full border tint-warn px-2 py-0.5 text-[10px] font-bold text-warn">
                          ↻ 第 {card.retryCount} 次重测
                        </span>
                      )}
                      <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-ink-3">
                        {card.cluster}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 items-center justify-center py-5">
                    <p className="break-words text-center text-lg font-bold leading-relaxed text-ink sm:text-xl">
                      {card.frontQuestion}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface/90 px-3.5 py-1 text-xs font-semibold text-ink-3">
                      <RotateCw className="h-3.5 w-3.5 text-accent" />
                      点击或按空格翻转查看大白话解析
                    </span>
                  </div>
                </div>

                {/* 背面：大白话解析 + 原笔记出处 + 换比喻 */}
                <div className="flashcard-face flashcard-face-back p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-md border tint-ai px-2.5 py-0.5 text-[11px] font-bold">
                      大白话解析 & 笔记出处
                    </span>
                    <button
                      type="button"
                      disabled={analogyLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        void askExtraAnalogy(card);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-edge bg-surface px-2.5 py-1 text-[11px] font-bold text-ink-2 transition hover:border-ai hover:text-ai disabled:opacity-50"
                    >
                      {analogyLoading ? (
                        <LoaderCircle className="h-3 w-3 animate-spin" />
                      ) : (
                        <MessageCircle className="h-3 w-3" />
                      )}
                      {analogyLoading ? "生成比喻中…" : "换个生活比喻"}
                    </button>
                  </div>

                  <div className="mt-4 flex-1 space-y-3.5" aria-live="polite">
                    <p className="break-words text-sm leading-7 text-ink sm:text-base">
                      {card.backAnswer}
                    </p>
                    {extraAnalogies.map((txt, idx) => (
                      <p
                        key={idx}
                        className="break-words rounded-lg border tint-warn px-3.5 py-2.5 text-xs leading-relaxed text-ink"
                      >
                        <span className="mr-1 font-bold text-warn">比喻 #{idx + 2}：</span>
                        {txt}
                      </p>
                    ))}
                    <div className="break-words rounded-lg bg-surface-2/80 px-3.5 py-2.5 text-xs leading-relaxed text-ink-3">
                      <span className="font-bold text-ink-2">原始笔记结论：</span>
                      {card.sourceExcerpt}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-3">
                      <RotateCw className="h-3 w-3 text-ai" />
                      点击翻回问题
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 模式 2：高亮挖空卡 (Cloze) */
        <div
          key={`${card.id}-${cursor}`}
          className="flashcard-enter-next flex min-h-[21rem] flex-col justify-between rounded-2xl border border-edge bg-surface p-6 shadow-sm sm:min-h-[23rem] sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border tint-ai px-2.5 py-0.5 text-[11px] font-bold">
              <Sparkles className="h-3 w-3" />
              高亮挖空卡 · Cloze
            </span>
            <div className="flex items-center gap-1.5">
              {card.retryCount > 0 && (
                <span className="rounded-full border tint-warn px-2 py-0.5 text-[10px] font-bold text-warn">
                  ↻ 第 {card.retryCount} 次重测
                </span>
              )}
              <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-ink-3">
                {card.cluster}
              </span>
            </div>
          </div>

          <div className="my-6 flex-1 space-y-5">
            <p className="break-words text-base leading-[2.2] text-ink sm:text-lg">
              {segments.map((seg, i) => {
                if (!seg.isCloze) return <span key={i}>{seg.text}</span>;
                const isOpen = revealedIndices.has(seg.termIndex);
                return (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={isOpen}
                    aria-label={isOpen ? `已揭晓：${seg.text}` : "点击揭晓挖空术语"}
                    onClick={() =>
                      setRevealedIndices((prev) => {
                        const next = new Set(prev);
                        if (next.has(seg.termIndex)) next.delete(seg.termIndex);
                        else next.add(seg.termIndex);
                        return next;
                      })
                    }
                    className={isOpen ? "cloze-revealed" : "cloze-hidden"}
                  >
                    {seg.text}
                  </button>
                );
              })}
            </p>

            {revealedIndices.size >= allClozeCount && allClozeCount > 0 && (
              <div className="break-words rounded-xl border tint-accent p-4 text-xs leading-relaxed text-ink">
                <span className="font-bold text-accent">一句话结论：</span>
                {card.sourceExcerpt}
                <p className="mt-1.5 text-ink-2">{card.backAnswer}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-edge/60 pt-4">
            <span className="text-xs text-ink-3">
              已揭晓 {revealedIndices.size} / {allClozeCount} 个关键词（按 Space 全部切换）
            </span>
            <button
              type="button"
              onClick={() => toggleRevealAll(card)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2/80 px-3 py-1.5 text-xs font-bold text-ink-2 transition hover:text-ai"
            >
              <Eye className="h-3.5 w-3.5" />
              {revealedIndices.size >= allClozeCount ? "重新遮住" : "揭晓全部挖空"}
            </button>
          </div>
        </div>
      )}

      {/* 底部自适应重测操作区 */}
      <div className="grid gap-4 pt-1 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleNeedRetry}
          className="flex items-center justify-center gap-2 rounded-xl border tint-warn px-4 py-3 text-sm font-bold text-warn transition hover:opacity-90 active:scale-[0.99]"
        >
          <RotateCcw className="h-4 w-4" />
          没掌握，稍后再测
          <kbd className="ml-1 hidden rounded border border-current/30 px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            1
          </kbd>
        </button>
        <button
          type="button"
          onClick={handleRemembered}
          className="btn-primary !rounded-xl !py-3 text-sm"
        >
          <Check className="h-4 w-4" />
          记住了
          <kbd className="ml-1 hidden rounded border border-white/35 px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            2
          </kbd>
        </button>
      </div>
    </section>
  );
}
