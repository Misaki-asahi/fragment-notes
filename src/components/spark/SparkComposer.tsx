import { useRef, useState } from "react";
import { AlertTriangle, Loader2, Paperclip, Send, Sparkles } from "lucide-react";
import { DEMO_SNIPPETS, extractHashtags } from "./sparkData";

interface SparkComposerProps {
  value: string;
  onChange: (value: string) => void;
  onPublish: (text: string) => void;
  onUploadFile: (file: File) => Promise<void>;
  uploading: boolean;
  uploadNotice: string | null;
  uploadError: string | null;
}

export function SparkComposer({
  value,
  onChange,
  onPublish,
  onUploadFile,
  uploading,
  uploadNotice,
  uploadError,
}: SparkComposerProps) {
  const [snippetCursor, setSnippetCursor] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const tags = extractHashtags(value);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || uploading) return;
    onPublish(trimmed);
  }

  function fillDemoSnippet() {
    const snippet = DEMO_SNIPPETS[snippetCursor % DEMO_SNIPPETS.length];
    setSnippetCursor((c) => (c + 1) % DEMO_SNIPPETS.length);
    onChange(snippet);
  }

  return (
    <section
      className="rounded-2xl border border-edge bg-surface p-5 shadow-sm transition-all focus-within:border-accent-2/60 focus-within:shadow-md sm:p-6"
      aria-label="极简碎片输入框"
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        rows={3}
        disabled={uploading}
        aria-label="记录学习碎片"
        placeholder="记下一句课堂要点、易混概念或错题反思… 输入 #标签 可自动归类（Ctrl/Cmd + Enter 发布）"
        className="w-full resize-none bg-transparent text-[15px] leading-7 text-ink placeholder:text-ink-3 focus:outline-none disabled:opacity-60"
      />

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-label="识别到的标签">
          <span className="text-[11px] font-semibold text-ink-3">识别标签：</span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-surface-2/90 px-2 py-0.5 text-[11px] font-bold text-ai"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {uploadNotice && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border tint-warn px-3 py-2 text-xs text-warn">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {uploadNotice}
        </p>
      )}
      {uploadError && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg border tint-bad px-3 py-2 text-xs text-bad">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {uploadError}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-edge/60 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fillDemoSnippet}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg border tint-ai px-2.5 py-1.5 text-xs font-bold transition hover:opacity-85 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            填入示例课堂片段
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.html,.htm,image/jpeg,image/png,application/pdf,text/html"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void onUploadFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-surface-2/60 px-2.5 py-1.5 text-xs font-semibold text-ink-2 transition hover:border-edge-2 hover:text-ink disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" /> : <Paperclip className="h-3.5 w-3.5 shrink-0" />}
            {uploading ? "解析中…" : "上传图片/文本解析"}
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden font-mono text-[11px] text-ink-3 sm:inline">Ctrl + Enter</span>
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim() || uploading}
            className="btn-primary !px-4 !py-1.5 text-xs sm:text-sm"
          >
            <Send className="h-3.5 w-3.5" />
            发布碎片
          </button>
        </div>
      </div>
    </section>
  );
}
