import type { StudyDeck } from '../types/deck';
import { DeckApiError, postApi } from './client';
import { isStudyDeck } from '../utils/deckValidation';

export type DeckPayload = { kind: 'text' | 'image' | 'pdf'; text?: string; imageBase64?: string };

export async function generateDeck(payload: DeckPayload): Promise<StudyDeck> {
  const result = await postApi<{ deck: StudyDeck }>('/generate-deck', payload, 190_000);
  const deck = result.deck;
  if (!isStudyDeck(deck) || deck.flashcards.length === 0 || deck.quizzes.length === 0) {
    throw new DeckApiError('bad_response', 'AI 返回的牌组数据不完整，请重试', true);
  }
  // 模型可能编造固定 id（如 deck1），本地强制 UUID，避免多次生成互相覆盖
  return { ...deck, id: crypto.randomUUID() };
}