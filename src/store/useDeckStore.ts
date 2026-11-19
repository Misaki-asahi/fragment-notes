import { useSyncExternalStore } from "react";
import type { StudyDeck } from "../types/deck";
import { sampleDecks } from "../mock/sampleDecks";
import { isQuiz, isRecord, isStudyDeck } from "../utils/deckValidation";

export type WrongItem = {
  id: string;
  deckId: string;
  deckTitle: string;
  quiz: StudyDeck["quizzes"][number];
  userChoiceIndex: number;
  customAnalogies?: string[];
};

export type CardStatus = StudyDeck["flashcards"][number]["status"];

export type DeckState = {
  decks: StudyDeck[];
  currentDeckId: string | null;
  wrongItems: WrongItem[];
  storageError: string | null;
};

export const STORAGE_KEY = "fragment-notes:deck-store:v1";

function isWrongItem(value: unknown): value is WrongItem {
  return isRecord(value) && typeof value.id === "string"
    && typeof value.deckId === "string" && typeof value.deckTitle === "string"
    && isQuiz(value.quiz) && Number.isInteger(value.userChoiceIndex)
    && Number(value.userChoiceIndex) >= -1 && Number(value.userChoiceIndex) < 4
    && (value.customAnalogies === undefined || (Array.isArray(value.customAnalogies)
      && value.customAnalogies.every((text) => typeof text === "string")));
}

function loadState(): DeckState {
  let storageError: string | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isRecord(parsed) && Array.isArray(parsed.decks) && parsed.decks.every(isStudyDeck)
        && new Set(parsed.decks.map((deck) => deck.id)).size === parsed.decks.length) {
        const decks = parsed.decks;
        const currentDeckId = typeof parsed.currentDeckId === "string"
          && decks.some((d) => d.id === parsed.currentDeckId)
          ? parsed.currentDeckId : (decks[0]?.id ?? null);
        const wrongItems = Array.isArray(parsed.wrongItems)
          ? parsed.wrongItems.filter(isWrongItem).filter((w) => decks.some((d) => d.id === w.deckId))
          : [];
        return { decks, currentDeckId, wrongItems, storageError: null };
      }
      storageError = "本地记录格式异常，暂时显示示例；原缓存尚未覆盖。";
    }
  } catch {
    storageError = "本地记录无法读取，暂时显示示例；请检查浏览器存储设置。";
  }
  return { decks: sampleDecks, currentDeckId: sampleDecks[0]?.id ?? null, wrongItems: [], storageError };
}

let state = loadState();
const listeners = new Set<() => void>();

function setState(next: Omit<DeckState, "storageError">) {
  const { decks, currentDeckId, wrongItems } = next;
  state = { decks, currentDeckId, wrongItems, storageError: null };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ decks, currentDeckId, wrongItems }));
  } catch {
    state = { ...state, storageError: "本地保存失败，刷新会丢失本次修改；请先导出牌组，再检查存储空间或权限。" };
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): DeckState {
  return state;
}

export function useDeckStore(): DeckState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

// ---------- actions ----------

export function addDeck(deck: StudyDeck) {
  setState({
    ...state,
    decks: [deck, ...state.decks.filter((d) => d.id !== deck.id)],
    currentDeckId: deck.id,
  });
}

export function selectDeck(id: string) {
  if (state.currentDeckId !== id && state.decks.some((d) => d.id === id)) {
    setState({ ...state, currentDeckId: id });
  }
}

export function deleteDeck(id: string) {
  const target = state.decks.find((d) => d.id === id);
  if (!target) return;
  const decks = state.decks.filter((d) => d.id !== id);
  setState({
    decks,
    currentDeckId:
      state.currentDeckId === id ? (decks[0]?.id ?? null) : state.currentDeckId,
    wrongItems: state.wrongItems.filter((w) => w.deckId !== id),
  });
}

// 闪卡 id 在各牌组内独立（fc1…），故只更新当前牌组内的卡片。
export function updateCardStatus(cardId: string, status: CardStatus) {
  const current = state.decks.find((d) => d.id === state.currentDeckId);
  if (!current || !current.flashcards.some((c) => c.id === cardId)) return;
  setState({
    ...state,
    decks: state.decks.map((d) =>
      d.id !== current.id
        ? d
        : {
            ...d,
            flashcards: d.flashcards.map((c) => (c.id === cardId ? { ...c, status } : c)),
          },
    ),
  });
}

// 同牌组同题重复答错时更新错选并保留已积累的比喻，避免错题本堆重复条目。
export function addWrong(entry: Omit<WrongItem, "id" | "customAnalogies">): string {
  const existing = state.wrongItems.find(
    (w) => w.deckId === entry.deckId && w.quiz.id === entry.quiz.id,
  );
  if (existing) {
    setState({
      ...state,
      wrongItems: state.wrongItems.map((w) =>
        w.id === existing.id
          ? { ...w, quiz: entry.quiz, userChoiceIndex: entry.userChoiceIndex }
          : w,
      ),
    });
    return existing.id;
  }
  const id = crypto.randomUUID();
  setState({ ...state, wrongItems: [{ ...entry, id }, ...state.wrongItems] });
  return id;
}

export function removeWrong(id: string) {
  if (!state.wrongItems.some((w) => w.id === id)) return;
  setState({ ...state, wrongItems: state.wrongItems.filter((w) => w.id !== id) });
}

export function appendAnalogy(id: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed || !state.wrongItems.some((w) => w.id === id)) return;
  setState({
    ...state,
    wrongItems: state.wrongItems.map((w) =>
      w.id === id
        ? { ...w, customAnalogies: [...(w.customAnalogies ?? []), trimmed] }
        : w,
    ),
  });
}