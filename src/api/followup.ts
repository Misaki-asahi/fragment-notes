import { postApi } from "./client";

export interface FollowupNoteContext {
  title: string;
  content: string;
  question?: string;
  plainExplanation?: string;
  confusion?: unknown;
}

export interface FollowupHistoryItem {
  question: string;
  answer: string;
}

export interface FollowupPayload {
  note: FollowupNoteContext;
  question: string;
  history: FollowupHistoryItem[];
}

export async function askFollowup(payload: FollowupPayload): Promise<{ answer: string; model: string }> {
  return postApi<{ answer: string; model: string }>("/followup", payload, 130_000);
}
