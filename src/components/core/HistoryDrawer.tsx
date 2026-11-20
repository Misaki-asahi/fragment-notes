import { useEffect, useRef, useState } from "react";
import { Layers, ListChecks, Trash2, X } from "lucide-react";
import type { StudyDeck } from "../../types/deck";

type Props = {
  open: boolean;
  onClose: () => void;
  decks: StudyDeck[];
  currentDeckId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export function HistoryDrawer({ open, onClose, decks, currentDeckId, onSelect, onDelete }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right) onClose();
      }}
      aria-label="历史牌组"
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-80 max-w-[85vw] border-l border-edge bg-surface p-0 text-ink backdrop:bg-void/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-edge px-5 py-4">
          <div><p className="kicker">History</p><h2 className="mt-1 font-display text-base">历史牌组</h2></div>
          <button type="button" onClick={onClose} aria-label="关闭历史牌组"
            className="border border-edge p-2 text-ink-2 transition-colors hover:border-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {decks.length === 0 && <p className="mt-8 text-center text-sm text-ink-3">还没有历史牌组，生成一份就会出现在这里</p>}
          <ul className="space-y-3">
            {decks.map((deck) => (
              <li key={deck.id} className={`border p-3 ${deck.id === currentDeckId ? "border-accent bg-surface-2" : "border-edge"}`}>
                <button type="button" onClick={() => { onSelect(deck.id); onClose(); }} className="w-full text-left">
                  <div className="flex justify-between gap-2 text-[11px]">
                    <span className="text-accent-2">{deck.subjectTag}</span>
                    <span className="text-ink-3">{new Date(deck.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{deck.title}</p>
                  <span className="mt-2 flex items-center gap-3 text-xs text-ink-3">
                    <Layers className="h-3 w-3" />{deck.flashcards.length}
                    <ListChecks className="h-3 w-3" />{deck.quizzes.length}
                    {deck.id === currentDeckId && <span className="text-accent">当前</span>}
                  </span>
                </button>
                <div className="mt-2 flex justify-end gap-3 border-t border-edge pt-2 text-xs">
                  {confirmId === deck.id ? <>
                    <button type="button" onClick={() => { onDelete(deck.id); setConfirmId(null); }} className="p-1 text-bad">确认删除</button>
                    <button type="button" onClick={() => setConfirmId(null)} className="p-1 text-ink-2">取消</button>
                  </> : <button type="button" onClick={() => setConfirmId(deck.id)} aria-label={`删除 ${deck.title}`}
                    className="inline-flex items-center gap-1 p-1 text-ink-3 transition-colors hover:text-bad">
                    <Trash2 className="h-3 w-3" />删除
                  </button>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  );
}
