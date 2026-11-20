import type { StudyDeck } from "../types/deck";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function strings(value: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => typeof value[key] === "string");
}

export function isQuiz(value: unknown): value is StudyDeck["quizzes"][number] {
  return isRecord(value)
    && strings(value, ["id", "question", "standardExplanation", "plainExplanation"])
    && value.id !== "" && value.question !== ""
    && Array.isArray(value.options) && value.options.length === 4
    && value.options.every((option) => typeof option === "string" && option.trim() !== "")
    && new Set(value.options.map((option: string) => option.trim())).size === 4
    && Number.isInteger(value.answerIndex)
    && Number(value.answerIndex) >= 0 && Number(value.answerIndex) < 4;
}

export function isStudyDeck(value: unknown): value is StudyDeck {
  if (!isRecord(value) || !strings(value, ["id", "title", "subjectTag", "sourceSummary"])
    || value.id === "" || value.title === "" || !Number.isFinite(value.createdAt)) return false;
  if (!Array.isArray(value.concepts) || !value.concepts.every((c) => isRecord(c)
    && strings(c, ["term", "definition", "keyPoint"]))) return false;
  if (!Array.isArray(value.confusions) || !value.confusions.every((c) => isRecord(c)
    && strings(c, ["topic", "itemAName", "itemAFeature", "itemBName", "itemBFeature", "distinctionTip"]))) return false;
  if (!Array.isArray(value.flashcards) || !value.flashcards.every((c) => isRecord(c)
    && strings(c, ["id", "front", "back"]) && c.id !== ""
    && ["easy", "medium", "hard"].includes(String(c.difficulty))
    && ["unseen", "review", "mastered"].includes(String(c.status)))) return false;
  if (!Array.isArray(value.quizzes) || !value.quizzes.every(isQuiz)) return false;
  return new Set(value.flashcards.map((c) => c.id)).size === value.flashcards.length
    && new Set(value.quizzes.map((q) => q.id)).size === value.quizzes.length;
}
