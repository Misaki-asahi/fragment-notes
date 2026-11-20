import { DeckApiError, postApi } from './client';

export type AnalogyInput = {
  question: string;
  options?: string[];
  answerIndex?: number;
  userChoiceIndex?: number;
  plainExplanation?: string;
};

export async function requestAnalogy(input: AnalogyInput): Promise<string> {
  const result = await postApi<{ analogy: string }>('/analogy', input, 65_000);
  if (typeof result.analogy !== 'string' || result.analogy.trim() === '') {
    throw new DeckApiError('bad_response', 'AI 没有返回有效的比喻，请重试', true);
  }
  return result.analogy;
}