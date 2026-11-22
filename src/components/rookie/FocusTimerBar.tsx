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
      <div className="relative z-10 w-full max-w-sm rounded-md border border-edge bg-surface p-8 text-center">
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-sm border border-edge p-2 text-ink-2 transition hover:border-edge-2 hover:text-accent"
        >
          <X className="h-4 w-4" />
        </button>
        <style>{`@keyframes rookie-breathe{0%,100%{transform:scale(0.72);opacity:0.65}50%{transform:scale(1.12);opacity:1}}`}</style>
        <div
          className="mx-auto h-32 w-32 rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 45%, var(--accent), var(--accent-3))",
            animation: "rookie-breathe 8s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
        <p className="mt-6 text-xl font-bold text-accent" aria-live="polite">
          {inhale ? "吸气…" : "呼气…"}
        </p>
        <p className="mt-2 font-bold">当下稳稳记住就好</p>
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
  const mm = String(Math.floor(Math.max(secondsLeft, 0) / 60)).padStart(2, "0");
  const ss = String(Math.max(secondsLeft, 0) % 60).padStart(2, "0");

  return (
    <>
      <div
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border border-edge bg-surface px-4 py-2"
        role="timer"
        aria-label="专注倒计时"
      >
        <span className="flex items-center gap-1.5 text-sm font-bold tabular-nums">
          <Timer className="h-4 w-4 text-accent" />
          {mm}:{ss}
        </span>

        {running && <span className="text-xs font-bold text-accent">专注复习中 ✨</span>}
        {!running && started && <span className="text-xs font-bold text-ink-3">已暂停</span>}

        {!started && (
          <span className="flex items-center gap-1" role="group" aria-label="选择专注时长">
            {DURATIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => pickDuration(m)}
                aria-pressed={minutes === m}
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition active:opacity-70 ${
                  minutes === m
                    ? "btn-primary"
                    : "bg-surface-2 text-ink-2 hover:text-accent"
                }`}
              >
                {m} 分钟
              </button>
            ))}
          </span>
        )}

        <span className="flex items-center gap-1">
          <button
            type="button"
            aria-label={running ? "暂停" : "开始"}
            onClick={() => setTimer((t) => ({ ...t, started: true, running: !t.running }))}
            className="btn-primary rounded-full p-1.5"
          >
            {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            aria-label="重置"
            onClick={reset}
            className="rounded-full border border-edge p-1.5 text-ink-2 transition hover:border-edge-2 hover:text-accent active:opacity-70"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setBreathing(true)}
            className="rounded-full border border-edge px-2.5 py-1 text-xs font-bold text-ink-2 transition hover:border-edge-2 hover:text-accent active:opacity-70"
          >
            😌 休息一下
          </button>
        </span>
      </div>

      {showBreathing && <BreathingOverlay onClose={closeBreathing} />}
    </>
  );
}