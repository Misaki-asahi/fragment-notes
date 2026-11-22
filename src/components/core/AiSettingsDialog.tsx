import { useEffect, useRef, useState } from "react";
import { KeyRound, RefreshCw, X } from "lucide-react";
import { BYOK_MODELS, clearByok, getByok, setByok } from "../../utils/byok";
import { listModels } from "../../api/listModels";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AiSettingsDialog({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [key, setKey] = useState("");
  const [model, setModel] = useState("auto");
  const [endpoint, setEndpoint] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState<string[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const current = getByok();
    setKey(current?.key ?? "");
    setModel(current?.model ?? "auto");
    setEndpoint(current?.endpoint ?? "");
    setSaved(Boolean(current));
    setError(null);
    setFetched(null);
    setFetchErr(null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function save() {
    const trimmed = key.trim();
    if (trimmed === "") {
      setError("先填入你的 API Key，或点「清除」改用站点默认");
      return;
    }
    if (!/^[!-~]+$/.test(trimmed)) {
      setError("Key 格式不对：应为不含空格的可见字符（智谱 Key 形如 id.secret）");
      return;
    }
    const ep = endpoint.trim();
    const md = model.trim();
    if (ep !== "") {
      let url: URL;
      try {
        url = new URL(ep);
      } catch {
        setError("端点不是合法 URL，请填写完整的 https 地址");
        return;
      }
      if (url.protocol !== "https:") {
        setError("自定义端点仅支持 https（转发层替你去请求，http 与内网地址会被拒绝）");
        return;
      }
      if (md === "" || md === "auto") {
        setError("自定义端点必须填具体模型名（auto 降级链只适用于智谱官方）");
        return;
      }
      if (!/^\S{1,100}$/u.test(md)) {
        setError("模型名应为 1~100 个不含空格的字符");
        return;
      }
    } else if (!BYOK_MODELS.some((m) => m.value === md)) {
      setError("智谱官方端点请从候选列表选模型；接其他服务商请填自定义端点");
      return;
    }
    setByok({ key: trimmed, model: md, endpoint: ep });
    setSaved(true);
    setError(null);
  }

  function clear() {
    clearByok();
    setKey("");
    setModel("auto");
    setEndpoint("");
    setSaved(false);
    setError(null);
    setFetched(null);
    setFetchErr(null);
  }

  async function fetchModels() {
    setFetching(true);
    setFetchErr(null);
    try {
      setFetched(await listModels(endpoint.trim(), key.trim()));
    } catch (e) {
      setFetchErr(e instanceof Error ? e.message : "拉取失败，请重试");
    } finally {
      setFetching(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      aria-label="AI 设置"
      className="fixed inset-0 m-auto h-fit max-h-[85dvh] w-[26rem] max-w-[92vw] overflow-y-auto rounded-xl border border-edge-2 bg-surface p-0 text-ink shadow-2xl backdrop:bg-void/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-edge px-5 py-4">
        <div><p className="kicker">AI Settings</p><h2 className="mt-1 font-display text-base font-bold">接入你自己的 API</h2></div>
        <button type="button" onClick={onClose} aria-label="关闭 AI 设置"
          className="rounded-lg border border-edge bg-surface-2/40 p-2 text-ink-2 transition-colors hover:border-accent hover:text-accent">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-xs leading-relaxed text-ink-2">
          留空则使用站点默认密钥与免费模型降级链。填入你自己的 API Key 后，生成与比喻追问都改用你的 Key，并可指定更强的模型或第三方兼容端点。
        </p>
        <label className="block">
          <span className="font-mono text-[11px] font-bold tracking-wider text-ink-3">API KEY</span>
          <input
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); setSaved(false); }}
            placeholder="你的 API Key（智谱形如 id.secret）"
            autoComplete="off"
            className="mt-1.5 w-full rounded-lg border border-edge bg-surface-2/60 p-2.5 font-mono text-sm text-ink placeholder:text-ink-3 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] font-bold tracking-wider text-ink-3">自定义端点（可选）</span>
          <input
            type="url"
            value={endpoint}
            onChange={(e) => { setEndpoint(e.target.value); setSaved(false); }}
            placeholder="留空 = 智谱官方；填 OpenAI 兼容代理地址"
            autoComplete="off"
            className="mt-1.5 w-full rounded-lg border border-edge bg-surface-2/60 p-2.5 font-mono text-sm text-ink placeholder:text-ink-3 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <span className="mt-1.5 block text-[11px] leading-relaxed text-ink-3">
            OpenAI 兼容代理地址，/chat/completions 会自动补全。仅 https 公网地址；内网/本机地址会被服务器拒绝。
          </span>
        </label>
        <label className="block">
          <span className="font-mono text-[11px] font-bold tracking-wider text-ink-3">模型名</span>
          <input
            type="text"
            list="byok-model-options"
            value={model}
            onChange={(e) => { setModel(e.target.value); setSaved(false); }}
            placeholder="auto 或具体模型名"
            autoComplete="off"
            className="mt-1.5 w-full rounded-lg border border-edge bg-surface-2/60 p-2.5 font-mono text-sm text-ink placeholder:text-ink-3 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <datalist id="byok-model-options">
            {(fetched ? fetched.map((id) => ({ value: id, label: id })) : BYOK_MODELS).map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </datalist>
          <span className="mt-1.5 block text-[11px] leading-relaxed text-ink-3">
            自定义端点时填该服务商的模型名；智谱官方可从候选选。
          </span>
          <span className="mt-2.5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void fetchModels()}
              disabled={fetching || key.trim() === ""}
              className="btn-secondary !px-3 !py-1.5 font-mono text-[11px]"
            >
              <RefreshCw className={`h-3 w-3 ${fetching ? "animate-spin" : ""}`} />
              {fetching ? "拉取中…" : "拉取可用模型"}
            </button>
            {fetched && <span className="text-[11px] font-semibold text-accent">拉取到 {fetched.length} 个模型，已填入候选</span>}
          </span>
          {fetchErr && <p role="alert" className="mt-2 rounded-lg border tint-bad px-3 py-2 text-xs text-bad">{fetchErr}</p>}
        </label>
        <p className="flex items-start gap-2 rounded-lg border border-edge bg-surface-2/40 p-3 text-[11px] leading-relaxed text-ink-3">
          <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          Key 只保存在你这台设备的浏览器里，请求时经 HTTPS 交给站点转发层即用即弃：服务器不保存、不写日志。公用电脑用完请点清除。
        </p>
        {error && <p role="alert" className="rounded-lg border tint-bad px-3 py-2 text-xs text-bad">{error}</p>}
        {saved && !error && (
          <p className="rounded-lg border tint-ok px-3 py-2 text-xs font-medium text-ok">
            已生效：当前使用你自己的 Key{model !== "auto" ? ` · ${model}` : ""}{endpoint !== "" ? ` · ${endpoint}` : ""}
          </p>
        )}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={save}
            className="btn-primary !px-5 !py-2 text-sm">
            保存
          </button>
          <button type="button" onClick={clear}
            className="btn-secondary hover:!border-bad hover:!text-bad">
            清除
          </button>
        </div>
      </div>
    </dialog>
  );
}