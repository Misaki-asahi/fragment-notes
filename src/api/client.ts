import { isRecord } from "../utils/deckValidation";
import { getByok } from "../utils/byok";

const BASE = import.meta.env.DEV ? "http://127.0.0.1:8000" : "";

export class DeckApiError extends Error {
  code: string;
  retryable: boolean;
  constructor(code: string, message: string, retryable: boolean) {
    super(message);
    this.name = "DeckApiError";
    this.code = code;
    this.retryable = retryable;
  }
}

const messages: Record<string, string> = {
  invalid_input: "输入内容不完整或超出限制，请检查后重试",
  service_not_configured: "AI 服务尚未配置，请联系管理员",
  auth_error: "AI 服务密钥无效或无权限，请联系管理员",
  rate_limited: "请求太频繁，请稍后重试",
  upstream_busy: "免费模型当前繁忙，请稍后重试",
  upstream_error: "AI 服务暂时不可用，请稍后重试",
  timeout: "AI 响应超时，请稍后重试",
  bad_output: "AI 返回内容不完整，请重试",
};

export async function postApi<T>(path: string, body: unknown, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const byok = getByok();
    const payload =
      byok && isRecord(body)
        ? { ...body, userKey: byok.key, ...(byok.model !== "auto" ? { model: byok.model } : {}), ...(byok.endpoint !== "" ? { endpoint: byok.endpoint } : {}) }
        : body;
    const response = await fetch(`${BASE}/functions/v1/app${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: "same-origin",
    });
    if (response.status === 401) throw new DeckApiError("login_required", "请登录后重试", false);
    if (response.status === 403) throw new DeckApiError("forbidden", "你没有访问此服务的权限", false);
    const data: unknown = await response.json();
    if (response.ok && isRecord(data) && data.ok === true) return data as T;
    if (isRecord(data) && isRecord(data.error)) {
      const code = typeof data.error.code === "string" && Object.hasOwn(messages, data.error.code)
        ? data.error.code : "upstream_error";
      throw new DeckApiError(code, messages[code], data.error.retryable === true);
    }
    throw new DeckApiError("bad_response", "服务返回了异常内容，请重试", true);
  } catch (error) {
    if (error instanceof DeckApiError) throw error;
    if (controller.signal.aborted) throw new DeckApiError("timeout", messages.timeout, true);
    if (error instanceof SyntaxError) throw new DeckApiError("bad_response", "服务返回了异常内容，请重试", true);
    throw new DeckApiError("network", "网络连接失败，请检查网络后重试", true);
  } finally {
    clearTimeout(timer);
  }
}
