import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { segmentByTerms } from "./sparkData";

interface ClozeEditorDialogProps {
  content: string;
  clozeTerms: string[];
  onClose: () => void;
  onSave: (content: string, clozeTerms: string[]) => void;
}

function toDraft(content: string, terms: string[]): string {
  return segmentByTerms(content, terms)
    .map((segment) => (segment.isCloze ? `‘${segment.text}’` : segment.text))
    .join("");
}

function parseDraft(draft: string) {
  const pattern = /‘([^‘’]+)’/g;
  const terms: string[] = [];
  for (const match of draft.matchAll(pattern)) {
    const term = match[1].trim();
    if (term) terms.push(term);
  }
  const withoutMarkers = draft.replace(pattern, "$1");
  return {
    content: withoutMarkers.trim(),
    terms: Array.from(new Set(terms)),
    unmatched: /[‘’]/.test(withoutMarkers),
  };
}

export function ClozeEditorDialog({
  content,
  clozeTerms,
  onClose,
  onSave,
}: ClozeEditorDialogProps) {
  const [draft, setDraft] = useState(() => toDraft(content, clozeTerms));
  const parsed = useMemo(() => parseDraft(draft), [draft]);
  const preview = useMemo(
    () => (parsed.unmatched ? [] : segmentByTerms(parsed.content, parsed.terms)),
    [parsed],
  );

  function save() {
    if (parsed.unmatched || !parsed.content) return;
    onSave(parsed.content, parsed.terms);
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="挖空编辑"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-edge bg-surface p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-ink">挖空编辑</h2>
            <p className="mt-1 text-xs leading-6 text-ink-3">
              用中文单引号 <span className="font-mono font-bold text-accent">‘ ’</span> 包住要挖空的内容，例如：TCP 建立连接需要<span className="font-mono text-accent">‘三次握手’</span>。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭挖空编辑"
            className="rounded-lg border border-edge bg-surface p-1.5 text-ink-3 transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <textarea
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              save();
            }
          }}
          rows={8}
          aria-label="挖空编辑内容"
          placeholder="在这里编辑正文，并用‘ ’标记挖空区域"
          className="mt-4 w-full resize-y rounded-xl border border-edge bg-void p-3 text-sm leading-7 text-ink outline-none placeholder:text-ink-3 focus:border-accent"
        />

        <div className="mt-3 min-h-5 text-xs">
          {parsed.unmatched ? (
            <p className="font-semibold text-bad">中文单引号需要成对使用，请检查遗漏的 ‘ 或 ’。</p>
          ) : (
            <p className="text-ink-3">已识别 {parsed.terms.length} 处挖空</p>
          )}
        </div>

        {!parsed.unmatched && parsed.content && (
          <div className="mt-3 rounded-xl border border-edge bg-void p-3 text-sm leading-7 text-ink-2">
            <p className="mb-1 text-[11px] font-bold text-ink-3">效果预览</p>
            <p>
              {preview.map((segment, index) =>
                segment.isCloze ? (
                  <span
                    key={index}
                    className="mx-0.5 inline rounded-xs bg-surface-2 px-1 py-0.5 font-semibold text-ink underline decoration-ai/50 decoration-2 underline-offset-4"
                  >
                    {segment.text}
                  </span>
                ) : (
                  <span key={index}>{segment.text}</span>
                ),
              )}
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary !px-4 !py-2 text-xs"
          >
            取消
          </button>
          <button
            type="button"
            onClick={save}
            disabled={parsed.unmatched || !parsed.content}
            className="btn-primary !px-4 !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            保存挖空
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
