import { postApi } from "./client";

export async function listModels(endpoint: string, userKey: string): Promise<string[]> {
  const result = await postApi<{ models: string[] }>(
    "/list-models",
    { ...(endpoint !== "" ? { endpoint } : {}), ...(userKey !== "" ? { userKey } : {}) },
    20_000,
  );
  return result.models;
}