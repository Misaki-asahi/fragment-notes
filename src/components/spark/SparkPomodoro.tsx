import { Coffee, Pause, Play, RotateCcw, Timer, X } from "lucide-react";
import {
  FOCUS_PRESETS,
  formatClock,
  type PomodoroController,
} from "./usePomodoro";

interface SparkPomodoroProps {
  pomodoro: PomodoroController;
}

export function SparkPomodoro({ pomodoro }: SparkPomodoroProps) {
  const { state, toggleRun, reset, selectFocusMinutes, selectBreak, dismissNotice } = pomodoro;
  const isBreak = state.phase === "break";
  const progressPct =
    state.totalSeconds > 0
      ? Math.min(100, Math.max(0, ((state.totalSeconds - state.secondsLeft) / state.totalSeconds) * 100))
      : 0;
  const clock = formatClock(state.secondsLeft);

  return (
    <section
      className="shrink-0 overflow-hidden rounded-xl border border-edge bg-surface shadow-xs"
      role="timer"
      aria-label="侧边栏番茄钟"
    >
      {/* 顶部细进度条 */}
      <div className="h-1 w-full bg-surface-2">
        <div
          className={`h-full transition-all duration-500 ${isBreak ? "bg-ok" : "bg-accent-2"}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="p-3.5">
        {/* 状态与今日完成轮次 */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${
              state.running
                ? isBreak
                  ? "text-ok"
                  : "text-accent"
                : isBreak
                  ? "text-ok"
                  : "text-ink-3"
            }`}
          >
            {isBreak ? (
              <Coffee className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <Timer className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            {state.running && (
              <span
                className={`h-1.5 w-1.5 animate-pulse rounded-full ${isBreak ? "bg-ok" : "bg-accent-2"}`}
                aria-hidden="true"
              />
            )}
            {state.running
              ? isBreak
                ? "休息中"
                : "专注中"
              : state.started
                ? "已暂停"
                : isBreak
                  ? "短休息"
                  : "番茄专注"}
          </span>

          <span
            className={`font-mono text-[11px] font-semibold tabular-nums ${
              state.completedToday > 0 ? "text-accent" : "text-ink-3"
            }`}
            title="今日已完成专注轮数"
          >
            今日 {state.completedToday} 轮
          </span>
        </div>

        {/* 主计时读数与启停按钮 */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="font-mono text-2xl font-black tracking-tight text-ink tabular-nums">
            {clock}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleRun}
              aria-label={state.running ? "暂停番茄钟" : state.started ? "继续番茄钟" : "开始番茄钟"}
              className="btn-primary !gap-1 !rounded-lg !px-2.5 !py-1.5 text-xs"
            >
              {state.running ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {state.running ? "暂停" : state.started ? "继续" : "开始"}
            </button>

            <button
              type="button"
              onClick={reset}
              aria-label="重置番茄钟"
              title="重置当前计时"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-edge bg-surface-2/60 text-ink-3 transition-colors hover:border-edge-2 hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 时长与休息预设档位 */}
        <div
          className="mt-3 grid grid-cols-4 gap-1 rounded-lg bg-surface-2/60 p-1"
          role="group"
          aria-label="番茄钟时长档位"
        >
          {FOCUS_PRESETS.map((m) => {
            const active = state.phase === "focus" && state.focusMinutes === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={active}
                onClick={() => selectFocusMinutes(m)}
                className={`rounded-md py-1 font-mono text-[11px] transition-colors ${
                  active
                    ? "bg-surface font-bold text-accent shadow-xs"
                    : "font-medium text-ink-2 hover:text-ink"
                }`}
              >
                {m}m
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={isBreak}
            onClick={selectBreak}
            className={`rounded-md py-1 font-mono text-[11px] transition-colors ${
              isBreak
                ? "bg-surface font-bold text-ok shadow-xs"
                : "font-medium text-ink-2 hover:text-ink"
            }`}
          >
            5m休
          </button>
        </div>

        {/* 本轮完成提示 */}
        {state.notice && (
          <div
            role="status"
            className={`mt-2.5 flex items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
              isBreak ? "tint-ok text-ok" : "tint-accent text-accent"
            }`}
          >
            <span className="leading-snug">{state.notice}</span>
            <button
              type="button"
              onClick={dismissNotice}
              aria-label="关闭提示"
              className="shrink-0 rounded p-0.5 opacity-75 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
