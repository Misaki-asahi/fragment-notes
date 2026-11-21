import { useEffect, useRef, useState } from "react";
import { KeyRound, X } from "lucide-react";
import { BYOK_MODELS, clearByok, getByok, setByok, type ByokModel } from "../../utils/byok";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AiSettingsDialog({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [key, setKey] = useState("");
  const [model, setModel] = useState<ByokModel>("auto");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const current = getByok();
    setKey(current?.key ?? "");
    setModel(current?.model ?? "auto");
    setSaved(Boolean(current));
    setError(null);
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
    setByok({ key: trimmed, model });
    setSaved(true);
    setError(null);
  }

  function clear() {
    clearByok();
    setKey("");
    setModel("auto");
    setSaved(false);
    setError(null);
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right) onClose();
      }}
      aria-label="AI 设置"
      className="fixed inset-0 m-auto h-fit max-h-[85dvh] w-96 max-w-[90vw] overflow-y-auto border border-edge bg-surface p-0 text-ink backdrop:bg-void/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-edge px-5 py-4">
        <div><p className="kicker">AI Settings</p><h2 className="mt-1 font-display text-base">接入你自己的 API</h2></div>
        <button type="button" onClick={onClose} aria-label="关闭 AI 设置"
          className="border border-edge p-2 text-ink-2 transition-colors hover:border-accent">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-xs leading-relaxed text-ink-2">
          留空则使用站点默认密钥与免费模型降级链。填入你自己的智谱 API Key 后，生成与比喻追问都改用你的 Key，并可指定更强的模型。
        </p>
        <label className="block">
          <span className="font-mono text-[11px] tracking-wider text-ink-3">API KEY</span>
          <input
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); setSaved(false); }}
            placeholder="智谱 Key，形如 id.secret"
            autoComplete="off"
            className="mt-1 w-full border border-edge bg-surface-2 p-2 font-mono text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] tracking-wider text-ink-3">MODEL</span>
          <select
            value={model}
            onChange={(e) => { setModel(e.target.value as ByokModel); setSaved(false); }}
            className="mt-1 w-full border border-edge bg-surface-2 p-2 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {BYOK_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </label>
        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-ink-3">
          <KeyRound className="mt-0.5 h-3 w-3 shrink-0" />
          Key 只保存在你这台设备的浏览器里，请求时经 HTTPS 交给站点转发层即用即弃：服务器不保存、不写日志。公用电脑用完请点清除。
        </p>
        {error && <p role="alert" className="text-xs text-bad">{error}</p>}
        {saved && !error && <p className="text-xs text-accent-2">已生效：当前使用你自己的 Key{model !== "auto" ? ` · ${model}` : ""}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={save}
            className="bg-accent px-4 py-2 text-sm font-semibold text-void transition-opacity hover:opacity-90">
            保存
          </button>
          <button type="button" onClick={clear}
            className="border border-edge px-4 py-2 font-mono text-xs tracking-wider text-ink-2 transition-colors hover:border-bad hover:text-bad">
            清除
          </button>
        </div>
      </div>
    </dialog>
  );
}