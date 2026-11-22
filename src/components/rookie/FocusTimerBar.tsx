import { Pause, Play, RotateCcw, Timer, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const DURATIONS = [15, 25] as const;
const BREATH_SECONDS = 20;

function BreathingOverlay({ onClose }: { onClose: () => void }) {
  const [left, setLeft] = useState(BREATH_SECONDS);
  const [inhale, setInhale] = useState(true);

  useEffect(() => {
    const tick = setInterval(() => setLeft((l) => l - 1), 1000);
    const phase = setInterval(() => setInhale((v) => !v), 4000);
    return () => {
      clearInterval(tick);
      clearInterval(phase);
    };
  }, []);

  useEffect(() => {
    if (left <= 0) onClose();
  }, [left, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="20 秒深呼吸休息"
    >
      <button
        type="button"
        aria-label="关闭深呼吸休息"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-void/80 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-edge-2 bg-surface p-8 text-center shadow-2xl">
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg border border-edge bg-surface-2/40 p-2 text-ink-2 transition hover:border-edge-2 hover:text-accent"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative mx-auto flex h-36 w-36 items-center justify-center" aria-hidden="true">
          <div
            className="absolute inset-0 rounded-full border border-accent/40"
            style={{ animation: "rookie-ripple 4s ease-out infinite" }}
          />
          <div
            className="h-28 w-28 rounded-full shadow-lg"
            style={{
              background: "radial-gradient(circle at 42% 38%, var(--accent), var(--accent-3))",
              boxShadow: "0 0 36px -4px color-mix(in srgb, var(--accent) 55%, transparent)",
              animation: "rookie-breathe 8s ease-in-out infinite",
            }}
          />
        </div>
        <p className="mt-6 text-xl font-bold text-accent" aria-live="polite">
          {inhale ? "吸气…" : "呼气…"}
        </p>
        <p className="mt-2 font-bold text-ink">当下稳稳记住就好</p>
        <p className="mt-2 text-xs font-bold text-ink-3">{Math.max(left, 0)} 秒后自动关闭 · 可随时点 ✕ 离开</p>
      </div>
    </div>
  );
}

interface TimerState {
  minutes: (typeof DURATIONS)[number];
  secondsLeft: number;
  running: boolean;
  started: boolean;
  justFinished: boolean;
}

export function FocusTimerBar() {
  const [timer, setTimer] = useState<TimerState>({
    minutes: 15,
    secondsLeft: 15 * 60,
    running: false,
    started: false,
    justFinished: false,
  });
  const [breathing, setBreathing] = useState(false);

  useEffect(() => {
    if (!timer.running) return;
    const tick = setInterval(() => {
      setTimer((t) =>
        t.secondsLeft <= 1
          ? { ...t, secondsLeft: t.minutes * 60, running: false, started: false, justFinished: true }
          : { ...t, secondsLeft: t.secondsLeft - 1 },
      );
    }, 1000);
    return () => clearInterval(tick);
  }, [timer.running]);

  const closeBreathing = useCallback(() => {
    setBreathing(false);
    setTimer((t) => (t.justFinished ? { ...t, justFinished: false } : t));
  }, []);

  const pickDuration = (m: (typeof DURATIONS)[number]) => {
    setTimer((t) => ({ ...t, minutes: m, secondsLeft: m * 60 }));
  };

  const reset = () => {
    setTimer((t) => ({ ...t, running: false, started: false, secondsLeft: t.minutes * 60 }));
  };

  const { minutes, secondsLeft, running, started } = timer;
  const showBreathing = breathing || timer.justFinished;
  const totalSeconds = minutes * 60;
  const progressPct = totalSeconds > 0 ? ((totalSeconds - Math.max(secondsLeft, 0)) / totalSeconds) * 100 : 0;
  const mm = String(Math.floor(Math.max(secondsLeft, 0) / 60)).padStart(2, "0");
  const ss = String(Math.max(secondsLeft, 0) % 60).padStart(2, "0");

  return (
    <>
      <div
        className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-edge bg-surface shadow-sm"
        role="timer"
        aria-label="专注倒计时"
      >
        <div className="h-1 w-full bg-surface-2">
          <div
            className="h-full bg-gradient-to-r from-accent-3 via-accent-2 to-accent transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border tint-accent text-accent">
              <Timer className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <span className="block font-mono text-2xl font-black tracking-tight text-ink tabular-nums sm:text-3xl">
                {mm}:{ss}
              </span>
              <div className="mt-0.5 flex items-center gap-2">
                {running && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-ok" aria-hidden="true" />
                    专注复习中 ✨
                  </span>
                )}
                {!running && started && (
                  <span className="text-xs font-bold text-ink-3">已暂停</span>
                )}
                {!started && (
                  <span className="text-xs font-semibold text-ink-3">准备专注 · {minutes} 分钟模式</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!started && (
              <span
                className="flex items-center gap-1 rounded-lg border border-edge bg-surface-2/50 p-1"
                role="group"
                aria-label="选择专注时长"
              >
                {DURATIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => pickDuration(m)}
                    aria-pressed={minutes === m}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition active:opacity-70 ${
                      minutes === m
                        ? "btn-primary !px-2.5 !py-1 !text-xs"
                        : "text-ink-2 hover:text-ink"
                    }`}
                  >
                    {m} 分钟
                  </button>
                ))}
              </span>
            )}

            <button
              type="button"
              aria-label={running ? "暂停" : "开始"}
              onClick={() => setTimer((t) => ({ ...t, started: true, running: !t.running }))}
              className="btn-primary !px-3.5 !py-2 text-xs sm:text-sm"
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "暂停" : started ? "继续" : "开始"}
            </button>
            <button
              type="button"
              aria-label="重置"
              onClick={reset}
              className="btn-secondary !p-2"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setBreathing(true)}
              className="btn-secondary !px-3 !py-2 text-xs"
            >
              😌 休息一下
            </button>
          </div>
        </div>
      </div>

      {showBreathing && <BreathingOverlay onClose={closeBreathing} />}
    </>
  );
}