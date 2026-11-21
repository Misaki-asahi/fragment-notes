const BYOK_KEY = "fragment-notes:byok:v1";

export const BYOK_MODELS = [
  { value: "auto", label: "自动（跟随站点降级链，仅智谱官方）" },
  { value: "glm-4.6v-flash", label: "glm-4.6v-flash（免费·快）" },
  { value: "glm-4.1v-thinking-flash", label: "glm-4.1v-thinking-flash（免费·思考）" },
  { value: "glm-4v-flash", label: "glm-4v-flash（免费）" },
  { value: "glm-4v-plus", label: "glm-4v-plus（付费·更强）" },
  { value: "glm-4.5v", label: "glm-4.5v（付费·更强）" },
  { value: "glm-4.6v", label: "glm-4.6v（付费·更强）" },
] as const;

export type Byok = { key: string; model: string; endpoint: string };

export function getByok(): Byok | null {
  try {
    const raw = localStorage.getItem(BYOK_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const b = parsed as Record<string, unknown>;
    if (typeof b.key !== "string" || b.key.trim() === "") return null;
    const model = typeof b.model === "string" && b.model.trim() !== "" ? b.model : "auto";
    const endpoint = typeof b.endpoint === "string" ? b.endpoint.trim() : "";
    return { key: b.key, model, endpoint };
  } catch {
    return null;
  }
}

export function setByok(byok: Byok): void {
  localStorage.setItem(BYOK_KEY, JSON.stringify(byok));
}

export function clearByok(): void {
  localStorage.removeItem(BYOK_KEY);
}