import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { AlertTriangle, FileUp, Loader2, Sparkles, Wand2 } from "lucide-react";
import type { DeckPayload } from "../../api/generateDeck";
import { sampleDecks } from "../../mock/sampleDecks";
import { fileToPayload, TEXT_MAX_CHARS } from "../../utils/fileParser";

type Props = {
  busy: boolean;
  onSubmit: (payload: DeckPayload) => void;
};

function buildSampleText(): string {
  const deck = sampleDecks[0];
  const lines = deck.concepts.map((c) => `${c.term}：${c.definition}`);
  for (const c of deck.confusions) {
    lines.push(`易混对比 ${c.topic}：${c.itemAName}——${c.itemAFeature}；${c.itemBName}——${c.itemBFeature}`);
  }
  return `${deck.title}\n${lines.join("\n")}`;
}

export function UploadZone({ busy, onSubmit }: Props) {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const parsingLock = useRef(false);

  const locked = busy || parsing;
  const overLimit = text.length > TEXT_MAX_CHARS;

  async function handleFile(file: File) {
    if (busy || parsingLock.current) return;
    parsingLock.current = true;
    setParsing(true);
    setError(null);
    setNotice(null);
    try {
      const { payload, notice: n } = await fileToPayload(file);
      setNotice(n);
      onSubmit(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "文件解析失败，请重试");
    } finally {
      parsingLock.current = false;
      setParsing(false);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (locked) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function submitText() {
    if (locked) return;
    const trimmed = text.trim();
    setError(null);
    setNotice(null);
    if (!trimmed) {
      setError("先粘贴一段提纲，或上传照片 / PDF");
      return;
    }
    if (overLimit) {
      setError(`文本过长（${text.length} 字），请精简到 ${TEXT_MAX_CHARS} 字以内`);
      return;
    }
    onSubmit({ kind: "text", text: trimmed });
  }

  return (
    <section className="edge-glow p-5 sm:p-6">
      <p className="kicker">Input · 喂料</p>
      <h2 className="mt-2 font-display text-lg font-light tracking-wide text-ink">
        粘贴提纲，或丢一份笔记进来
      </h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={locked}
        rows={6}
        aria-label="学习资料文本"
        placeholder="把课堂提纲 / 复习要点粘贴到这里，AI 会产出概念、易混对比、闪卡与自测题…"
        className="mt-4 w-full resize-y border border-edge bg-surface-2 p-3 text-sm leading-relaxed text-ink placeholder:text-ink-3 transition-colors focus:border-accent focus:outline-none disabled:opacity-60"
      />
      <div className="mt-1 flex items-center justify-between font-mono text-[11px] tracking-wider">
        <span className={overLimit ? "text-bad" : "text-ink-3"}>
          {text.length} / {TEXT_MAX_CHARS} 字
        </span>
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            disabled={locked}
            className="text-ink-3 transition-colors hover:text-ink-2"
          >
            清空
          </button>
        )}
      </div>

      {overLimit && <p role="alert" className="mt-2 text-xs text-bad">文本超过 {TEXT_MAX_CHARS} 字，请精简后生成。</p>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!locked) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`mt-4 flex flex-col items-center gap-2 border border-dashed px-4 py-8 text-center transition-colors ${
          dragActive ? "border-accent bg-surface-2" : "border-edge-2 bg-transparent"
        }`}
      >
        <FileUp className="h-6 w-6 text-accent-2" />
        <p className="text-sm text-ink-2">拖拽 JPG / PNG 笔记照片或 PDF 课件到这里</p>
        <p className="font-mono text-[11px] tracking-wider text-ink-3">
          PDF 提取前 15 页 · 照片自动压缩 · 扫描版 PDF 请改拍照
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={locked}
          className="mt-2 border border-edge-2 px-4 py-1.5 font-mono text-xs tracking-wider text-ink-2 transition-colors hover:border-accent hover:text-ink disabled:opacity-50"
        >
          {parsing ? "解析文件中…" : "选择文件"}
        </button>
      </div>

      {notice && (
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-warn">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {notice}
        </p>
      )}
      {error && (
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-bad">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={submitText}
          disabled={locked || overLimit}
          className="inline-flex items-center gap-2 bg-accent px-5 py-2 text-sm font-semibold text-void transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {busy ? "AI 生成中…" : "开始生成"}
        </button>
        <button
          type="button"
          onClick={() => {
            setText(buildSampleText());
            setError(null);
            setNotice(null);
          }}
          disabled={locked}
          className="inline-flex items-center gap-2 border border-edge px-4 py-2 font-mono text-xs tracking-wider text-ink-2 transition-colors hover:border-accent-2 hover:text-ink disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          一键填入示例
        </button>
      </div>
    </section>
  );
}