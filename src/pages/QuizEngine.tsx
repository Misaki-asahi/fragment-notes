import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, ListChecks, RotateCcw, Timer, XCircle } from "lucide-react";
import type { StudyDeck } from "../types/deck";
import { useDeckStore, addWrong, removeWrong } from "../store/useDeckStore";

type Quiz = StudyDeck["quizzes"][number];
type Phase = "intro" | "running" | "result";

const QUIZ_SECONDS = 180;

type Props = {
  deck: StudyDeck;
  retryQuestions?: Quiz[];
  onExit: (tab?: "wrong") => void;
};

export function QuizEngine({ deck, retryQuestions, onExit }: Props) {
  const { wrongItems } = useDeckStore();
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Quiz[]>(deck.quizzes);
  const [retryMode, setRetryMode] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(QUIZ_SECONDS);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadline = useRef(0);
  const submitted = useRef(false);
  const answerLock = useRef(false);
  const answersRef = useRef<(number | null)[]>([]);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const submit = (finalAnswers: (number | null)[]) => {
    if (submitted.current) return;
    submitted.current = true;
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setAnswers(finalAnswers);
    setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
    setPhase("result");
    questions.forEach((q, i) => {
      const choice = finalAnswers[i];
      const existing = wrongItems.find((w) => w.deckId === deck.id && w.quiz.id === q.id);
      if (choice === q.answerIndex) {
        if (retryMode && existing) removeWrong(existing.id);
      } else {
        addWrong({ deckId: deck.id, deckTitle: deck.title, quiz: q, userChoiceIndex: choice ?? -1 });
      }
    });
  };

  const latestSubmit = useRef(submit);
  useEffect(() => {
    latestSubmit.current = submit;
  });
  useEffect(() => {
    if (phase !== "running") return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) latestSubmit.current(answersRef.current);
    };
    const timer = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [phase]);

  function start(subset: Quiz[] | null) {
    const qs = subset ?? deck.quizzes;
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    submitted.current = false;
    answerLock.current = false;
    answersRef.current = new Array(qs.length).fill(null);
    deadline.current = Date.now() + QUIZ_SECONDS * 1000;
    setQuestions(qs);
    setRetryMode(subset !== null);
    setAnswers(answersRef.current);
    setIndex(0);
    setPicked(null);
    setRemaining(QUIZ_SECONDS);
    setPhase("running");
  }

  function pick(optionIndex: number) {
    if (answerLock.current || submitted.current || phase !== "running") return;
    if (Date.now() >= deadline.current) {
      submit(answersRef.current);
      return;
    }
    answerLock.current = true;
    setPicked(optionIndex);
    const merged = [...answersRef.current];
    merged[index] = optionIndex;
    answersRef.current = merged;
    setAnswers(merged);
    advanceTimer.current = setTimeout(() => {
      if (submitted.current) return;
      answerLock.current = false;
      setPicked(null);
      if (index + 1 < questions.length) setIndex(index + 1);
      else submit(merged);
    }, 650);
  }

  if (deck.quizzes.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-10">
        <section className="edge-glow p-8 text-center">
          <p className="text-sm text-ink-2">这份牌组没有自测题，无法开始小测</p>
          <button
            type="button"
            onClick={() => onExit()}
            className="mt-4 border border-edge px-4 py-2 font-mono text-xs tracking-wider text-ink-2 transition-colors hover:border-accent hover:text-ink"
          >
            返回工作台
          </button>
        </section>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-10">
        <section className="edge-glow p-6 sm:p-8">
          <p className="kicker">Quiz · 3 分钟小测</p>
          <h1 className="mt-2 font-display text-xl font-light tracking-wide text-ink">
            {deck.title}
          </h1>
          <ul className="mt-5 space-y-2 text-sm leading-relaxed text-ink-2">
            <li className="flex items-center gap-2">
              <Timer className="h-4 w-4 shrink-0 text-accent-2" />
              限时 {QUIZ_SECONDS} 秒，共 {(retryQuestions ?? deck.quizzes).length} 题，超时自动交卷
            </li>
            <li className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 shrink-0 text-accent-2" />
              每题 4 选 1，选完即判并进入下一题
            </li>
            <li className="flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0 text-accent-2" />
              答错与未作答自动收入大白话错题本，可重做、可换比喻
            </li>
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => start(retryQuestions ?? null)}
              className="inline-flex items-center gap-2 bg-accent px-5 py-2 text-sm font-semibold text-void transition-opacity hover:opacity-90"
            >
              <Timer className="h-4 w-4" />
              开始小测
            </button>
            <button
              type="button"
              onClick={() => onExit()}
              className="inline-flex items-center gap-2 border border-edge px-4 py-2 font-mono text-xs tracking-wider text-ink-2 transition-colors hover:border-accent hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              返回工作台
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (phase === "running") {
    const q = questions[index];
    const progress = ((QUIZ_SECONDS - remaining) / QUIZ_SECONDS) * 100;
    const urgent = remaining <= 30;
    return (
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-10">
        <section className="edge-glow p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="kicker">
              {retryMode ? "错题重做" : "Quiz"} · {index + 1} / {questions.length}
            </p>
            <p
              className={`inline-flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums ${
                urgent ? "text-bad" : "text-accent-2"
              }`}
              aria-live="polite"
            >
              <Timer className="h-4 w-4" />
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
            </p>
          </div>
          <div className="mt-3 h-1 w-full bg-surface-2">
            <div
              className={`h-full transition-all duration-1000 ${urgent ? "bg-bad" : "bg-accent"}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="mt-6 text-base font-semibold leading-relaxed text-ink">{q.question}</h2>
          <div className="mt-5 space-y-3">
            {q.options.map((option, i) => {
              const isPicked = picked === i;
              const isAnswer = i === q.answerIndex;
              const revealed = picked !== null;
              let cls = "border-edge hover:border-edge-2 hover:bg-surface-2";
              if (revealed && isAnswer) cls = "border-ok bg-surface-2";
              else if (revealed && isPicked) cls = "border-bad bg-surface-2";
              else if (revealed) cls = "border-edge opacity-60";
              return (
                <button
                  key={i}
                  type="button"
                  disabled={revealed}
                  onClick={() => pick(i)}
                  className={`flex w-full items-start gap-3 border p-3.5 text-left text-sm leading-relaxed text-ink transition-colors ${cls}`}
                >
                  <span className="shrink-0 font-mono text-xs text-ink-3">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0 flex-1">{option}</span>
                  {revealed && isAnswer && <CheckCircle2 className="h-4 w-4 shrink-0 text-ok" />}
                  {revealed && isPicked && !isAnswer && (
                    <XCircle className="h-4 w-4 shrink-0 text-bad" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => submit(answersRef.current)}
              className="border border-edge px-4 py-1.5 font-mono text-xs tracking-wider text-ink-3 transition-colors hover:border-edge-2 hover:text-ink-2"
            >
              提前交卷
            </button>
          </div>
        </section>
      </div>
    );
  }

  // result
  const correct = questions.filter((q, i) => answers[i] === q.answerIndex).length;
  const wrongList = questions
    .map((q, i) => ({ q, choice: answers[i] }))
    .filter(({ q, choice }) => choice !== q.answerIndex);
  const used = QUIZ_SECONDS - Math.max(remaining, 0);
  const pct = Math.round((correct / questions.length) * 100);

  return (
    <div className="mx-auto max-w-3xl px-6 pb-20 pt-10">
      <section className="edge-glow p-6 sm:p-8">
        <p className="kicker">Result · 判分</p>
        <div className="mt-3 flex flex-wrap items-baseline gap-4">
          <p className="font-display text-4xl font-extralight text-ink">
            {correct}
            <span className="text-lg text-ink-3"> / {questions.length}</span>
          </p>
          <p className={`font-mono text-sm font-semibold ${pct >= 60 ? "text-ok" : "text-warn"}`}>
            正确率 {pct}%
          </p>
          <p className="font-mono text-[11px] tracking-wider text-ink-3">
            用时 {Math.floor(used / 60)}:{String(used % 60).padStart(2, "0")}
            {remaining <= 0 && " · 超时自动交卷"}
          </p>
        </div>

        {wrongList.length > 0 ? (
          <div className="mt-6">
            <p className="kicker">Wrong · {wrongList.length} 题已收入错题本</p>
            <ul className="mt-4 space-y-4">
              {wrongList.map(({ q, choice }) => (
                <li key={q.id} className="border border-edge p-4">
                  <p className="text-sm font-semibold leading-snug text-ink">{q.question}</p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-2">
                    你的答案：
                    <span className="text-bad">
                      {choice === null || choice < 0 ? "未作答" : q.options[choice]}
                    </span>
                    {" · "}正确答案：
                    <span className="text-ok">{q.options[q.answerIndex]}</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{q.plainExplanation}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-3">{q.standardExplanation}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-6 flex items-center gap-2 text-sm text-ok">
            <CheckCircle2 className="h-4 w-4" />
            全对！这份牌组暂时难不倒你
          </p>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          {wrongList.length > 0 && (
            <button
              type="button"
              onClick={() => start(wrongList.map(({ q }) => q))}
              className="inline-flex items-center gap-2 bg-accent px-5 py-2 text-sm font-semibold text-void transition-opacity hover:opacity-90"
            >
              <RotateCcw className="h-4 w-4" />
              错题重做（{wrongList.length}）
            </button>
          )}
          <button
            type="button"
            onClick={() => start(retryQuestions ?? null)}
            className="inline-flex items-center gap-2 border border-edge px-4 py-2 font-mono text-xs tracking-wider text-ink-2 transition-colors hover:border-accent hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            再测一次
          </button>
          {wrongList.length > 0 && (
            <button
              type="button"
              onClick={() => onExit("wrong")}
              className="inline-flex items-center gap-2 border border-edge px-4 py-2 font-mono text-xs tracking-wider text-ink-2 transition-colors hover:border-accent-2 hover:text-ink"
            >
              <ListChecks className="h-3.5 w-3.5" />
              去错题本换比喻
            </button>
          )}
          <button
            type="button"
            onClick={() => onExit()}
            className="inline-flex items-center gap-2 border border-edge px-4 py-2 font-mono text-xs tracking-wider text-ink-2 transition-colors hover:border-accent hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回工作台
          </button>
        </div>
      </section>
    </div>
  );
}