import { useCallback, useEffect, useState } from "react";

export const FOCUS_PRESETS = [15, 25, 45] as const;
export const BREAK_MINUTES = 5;

const STORAGE_KEY = "sparknote:pomodoro:v1";
const BASE_DOC_TITLE = "碎片笔记 · 一键变闪卡与自测题";

export type PomodoroPhase = "focus" | "break";
export type FocusPreset = (typeof FOCUS_PRESETS)[number];

export interface PomodoroState {
  phase: PomodoroPhase;
  focusMinutes: FocusPreset;
  totalSeconds: number;
  secondsLeft: number;
  running: boolean;
  started: boolean;
  runAnchorMs: number | null;
  runAnchorLeft: number;
  completedToday: number;
  soundTick: number;
  notice: string | null;
}

export interface PomodoroController {
  state: PomodoroState;
  toggleRun: () => void;
  reset: () => void;
  selectFocusMinutes: (minutes: FocusPreset) => void;
  selectBreak: () => void;
  dismissNotice: () => void;
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadTodayCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as { dateKey?: unknown }).dateKey === getTodayKey() &&
      typeof (parsed as { completedToday?: unknown }).completedToday === "number"
    ) {
      return Math.max(0, Math.floor((parsed as { completedToday: number }).completedToday));
    }
    return 0;
  } catch {
    return 0;
  }
}

function saveTodayCount(count: number): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ dateKey: getTodayKey(), completedToday: count }),
    );
  } catch {
    // 隐私模式或存储受限时静默降级
  }
}

function playPomodoroChime(phase: PomodoroPhase): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = phase === "break" ? [523.25, 659.25] : [659.25, 523.25];
    const now = ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.16);
      gain.gain.setValueAtTime(0.001, now + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.16 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.16 + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.16);
      osc.stop(now + idx * 0.16 + 0.34);
    });
    setTimeout(() => {
      void ctx.close().catch(() => undefined);
    }, 900);
  } catch {
    // 音频上下文不可用时静默忽略
  }
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function usePomodoro(): PomodoroController {
  const [state, setState] = useState<PomodoroState>(() => ({
    phase: "focus",
    focusMinutes: 25,
    totalSeconds: 25 * 60,
    secondsLeft: 25 * 60,
    running: false,
    started: false,
    runAnchorMs: null,
    runAnchorLeft: 25 * 60,
    completedToday: loadTodayCount(),
    soundTick: 0,
    notice: null,
  }));

  useEffect(() => {
    if (!state.running) return;
    const id = setInterval(() => {
      setState((prev) => {
        if (!prev.running || prev.runAnchorMs === null) return prev;
        const elapsed = Math.floor((Date.now() - prev.runAnchorMs) / 1000);
        const nextLeft = Math.max(0, prev.runAnchorLeft - elapsed);

        if (nextLeft <= 0) {
          if (prev.phase === "focus") {
            const nextCount = prev.completedToday + 1;
            saveTodayCount(nextCount);
            return {
              ...prev,
              phase: "break",
              totalSeconds: BREAK_MINUTES * 60,
              secondsLeft: BREAK_MINUTES * 60,
              running: false,
              started: false,
              runAnchorMs: null,
              runAnchorLeft: BREAK_MINUTES * 60,
              completedToday: nextCount,
              soundTick: prev.soundTick + 1,
              notice: "专注完成！已计 1 轮，可休息 5 分钟",
            };
          }
          const focusSec = prev.focusMinutes * 60;
          return {
            ...prev,
            phase: "focus",
            totalSeconds: focusSec,
            secondsLeft: focusSec,
            running: false,
            started: false,
            runAnchorMs: null,
            runAnchorLeft: focusSec,
            soundTick: prev.soundTick + 1,
            notice: "休息结束，准备开始下一轮专注",
          };
        }

        if (nextLeft === prev.secondsLeft) return prev;
        return { ...prev, secondsLeft: nextLeft };
      });
    }, 500);
    return () => clearInterval(id);
  }, [state.running]);

  useEffect(() => {
    if (state.soundTick > 0) {
      playPomodoroChime(state.phase);
    }
  }, [state.soundTick, state.phase]);

  useEffect(() => {
    if (state.running) {
      const clock = formatClock(state.secondsLeft);
      const tag = state.phase === "focus" ? "专注中" : "休息中";
      document.title = `${clock} ${tag} · 碎片笔记`;
    } else {
      document.title = BASE_DOC_TITLE;
    }
    return () => {
      document.title = BASE_DOC_TITLE;
    };
  }, [state.running, state.secondsLeft, state.phase]);

  const toggleRun = useCallback(() => {
    setState((prev) => {
      if (prev.running) {
        const elapsed =
          prev.runAnchorMs !== null ? Math.floor((Date.now() - prev.runAnchorMs) / 1000) : 0;
        const left = Math.max(0, prev.runAnchorLeft - elapsed);
        return {
          ...prev,
          running: false,
          secondsLeft: left,
          runAnchorMs: null,
          runAnchorLeft: left,
        };
      }
      return {
        ...prev,
        running: true,
        started: true,
        runAnchorMs: Date.now(),
        runAnchorLeft: prev.secondsLeft,
        notice: null,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => {
      const resetSeconds =
        prev.phase === "focus" ? prev.focusMinutes * 60 : BREAK_MINUTES * 60;
      return {
        ...prev,
        totalSeconds: resetSeconds,
        secondsLeft: resetSeconds,
        running: false,
        started: false,
        runAnchorMs: null,
        runAnchorLeft: resetSeconds,
        notice: null,
      };
    });
  }, []);

  const selectFocusMinutes = useCallback((minutes: FocusPreset) => {
    const sec = minutes * 60;
    setState((prev) => ({
      ...prev,
      phase: "focus",
      focusMinutes: minutes,
      totalSeconds: sec,
      secondsLeft: sec,
      running: false,
      started: false,
      runAnchorMs: null,
      runAnchorLeft: sec,
      notice: null,
    }));
  }, []);

  const selectBreak = useCallback(() => {
    const sec = BREAK_MINUTES * 60;
    setState((prev) => ({
      ...prev,
      phase: "break",
      totalSeconds: sec,
      secondsLeft: sec,
      running: false,
      started: false,
      runAnchorMs: null,
      runAnchorLeft: sec,
      notice: null,
    }));
  }, []);

  const dismissNotice = useCallback(() => {
    setState((prev) => (prev.notice ? { ...prev, notice: null } : prev));
  }, []);

  return { state, toggleRun, reset, selectFocusMinutes, selectBreak, dismissNotice };
}
