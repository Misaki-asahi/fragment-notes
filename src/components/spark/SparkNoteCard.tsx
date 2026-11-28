import { useState } from "react";
import {
  GitBranch,
  Layers,
  LoaderCircle,
  MessageCirclePlus,
  Pencil,
  Plus,
  RotateCw,
  Send,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import type { FollowupHistoryItem } from "../../api/followup";
import { ClozeEditorDialog } from "./ClozeEditorDialog";
import { FormulaText } from "./FormulaText";
import { segmentByTerms, type SparkNote } from "./sparkData";

interface SparkNoteCardProps {
  note: SparkNote;
  selected: boolean;
  followupOpen: boolean;
  onSelect: (note: SparkNote) => void;
  onFollowupOpenChange: (open: boolean) => void;
  onToggleStar: (id: string) => void;
  onClickTag: (tag: string) => void;
  onMakeFlashcard: (note: SparkNote) => void;
  onDelete: (note: SparkNote) => void;
  onAddTag: (noteId: string, tag: string) => void;
  onTagContextMenu: (tag: string, noteId: string, x: number, y: number) => void;
  onUpdateCloze: (noteId: string, content: string, clozeTerms: string[]) => void;
  onAskFollowup: (
    noteId: string,
    question: string,
    history: FollowupHistoryItem[],
    regenerateId?: string,
  ) => Promise<void>;
  onDeleteFollowup: (noteId: string, turnId: string) => void;
}

function formatRelativeTime(ts: number): string {
  const diffMin = Math.floor((Date.now() - ts) / 60_000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `今天 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function SparkNoteCard({
  note,
  selected,
  followupOpen,
  onSelect,
  onFollowupOpenChange,
  onToggleStar,
  onClickTag,
  onMakeFlashcard,
  onDelete,
  onAddTag,
  onTagContextMenu,
  onUpdateCloze,
  onAskFollowup,
  onDeleteFollowup,
}: SparkNoteCardProps) {
  const [maskedInline, setMaskedInline] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [clozeEditorOpen, setClozeEditorOpen] = useState(false);
  const [followupDraft, setFollowupDraft] = useState("");
  const [followupError, setFollowupError] = useState<string | null>(null);
  const [pendingFollowupId, setPendingFollowupId] = useState<string | null>(null);
  const segments = segmentByTerms(note.content, note.clozeTerms);
  const followups = note.followups ?? [];
  const followupPending = pendingFollowupId !== null;

  function submitTag() {
    const tag = tagDraft.trim().replace(/^#+/, "");
    if (tag) onAddTag(note.id, tag);
    setTagDraft("");
    setAddingTag(false);
  }

  async function runFollowup(question: string, regenerateId?: string) {
    const trimmed = question.trim();
    if (!trimmed || followupPending) return;
    const turnIndex = regenerateId ? followups.findIndex((turn) => turn.id === regenerateId) : -1;
    const history = followups
      .slice(0, turnIndex >= 0 ? turnIndex : followups.length)
      .map((turn) => ({ question: turn.question, answer: turn.answer }));
    setFollowupError(null);
    setPendingFollowupId(regenerateId ?? "new");
    try {
      await onAskFollowup(note.id, trimmed, history, regenerateId);
      if (!regenerateId) setFollowupDraft("");
    } catch (error) {
      setFollowupError(error instanceof Error ? error.message : "追问失败，请稍后重试");
    } finally {
      setPendingFollowupId(null);
    }
  }

  return (
    <article
      onClick={() => onSelect(note)}
      className={`group relative cursor-pointer rounded-2xl border bg-surface p-5 transition-all sm:p-6 ${
        selected
          ? "border-accent-2 shadow-sm ring-2 ring-accent-2/12"
          : "border-edge shadow-xs hover:border-edge-2 hover:shadow-sm"
      }`}
    >
      {/* 顶部时间 + 专题归属 + 重点星标 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs font-medium text-ink-3">
            {formatRelativeTime(note.createdAt)}
          </span>
          <span className="rounded-md bg-surface-2/80 px-2 py-0.5 text-[11px] font-semibold text-ink-2">
            {note.cluster}
          </span>
        </div>
        <button
          type="button"
          aria-label={note.starred ? "取消重点标记" : "标为重点"}
          aria-pressed={note.starred}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(note.id);
          }}
          className={`rounded-lg p-1.5 transition-colors ${
            note.starred
              ? "text-gold hover:bg-surface-2"
              : "text-ink-3 hover:bg-surface-2 hover:text-gold"
          }`}
        >
          <Star className={`h-4 w-4 ${note.starred ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* AI 流式提炼中态 vs 提炼完成态 */}
      {note.aiProcessing ? (
        <div className="mt-3.5 space-y-3.5">
          <p className="break-words text-sm leading-7 text-ink-2">{note.content}</p>
          <div className="ai-shimmer flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-ai">
            <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse" />
            AI 提炼中：正在归纳一句话结论、自动标签与关键概念挖空点…
          </div>
        </div>
      ) : (
        <div className="mt-3.5">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-ai">
              <Sparkles className="h-2.5 w-2.5" />
              结论
            </span>
            <h3 className="break-words text-[15px] font-bold leading-snug text-ink">
              {note.aiTitle}
            </h3>
          </div>

          <p className="mt-3 break-words text-sm leading-7 text-ink-2">
            {segments.map((seg, i) =>
              seg.isCloze ? (
                <button
                  key={i}
                  type="button"
                  title={maskedInline ? "点击揭晓核心概念" : "点击切换挖空遮罩"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMaskedInline((m) => !m);
                  }}
                  className={
                    maskedInline
                      ? "cloze-hidden !py-0 !text-xs"
                      : "mx-0.5 inline rounded-xs bg-surface-2/90 px-1 py-0.5 font-semibold text-ink underline decoration-ai/50 decoration-2 underline-offset-4 transition hover:decoration-ai"
                  }
                >
                  {seg.text}
                </button>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {note.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClickTag(tag);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagContextMenu(tag, note.id, e.clientX, e.clientY);
                }}
                className="rounded-md bg-surface-2/80 px-2.5 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-surface-2"
              >
                #{tag}
              </button>
            ))}
            {addingTag ? (
              <input
                autoFocus
                value={tagDraft}
                maxLength={20}
                aria-label="添加标签"
                placeholder="输入标签"
                title="Enter 添加 · Esc 取消"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitTag();
                  }
                  if (e.key === "Escape") {
                    setTagDraft("");
                    setAddingTag(false);
                  }
                }}
                onBlur={() => {
                  setTagDraft("");
                  setAddingTag(false);
                }}
                className="h-7 w-28 rounded-md border border-accent/60 bg-surface px-2 text-xs text-ink outline-none placeholder:text-ink-3 focus:border-accent"
              />
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddingTag(true);
                }}
                aria-label="添加标签"
                title="添加标签"
                className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-dashed border-edge-2 text-ink-3 transition-colors hover:border-accent hover:text-accent"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="ml-auto flex items-center gap-3">
              {note.clozeTerms.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMaskedInline((m) => !m);
                  }}
                  className="text-[11px] font-medium text-ink-3 transition-colors hover:text-ai"
                >
                  {maskedInline ? "显示挖空词" : "挖空自测"}
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setClozeEditorOpen(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-3 transition-colors hover:text-ai"
              >
                <Pencil className="h-3 w-3" />
                挖空编辑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部轻量操作栏（去边框幽灵按钮） */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-edge/50 pt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMakeFlashcard(note);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:bg-surface-2/80 hover:text-accent"
        >
          <Layers className="h-3.5 w-3.5" />
          生成闪卡
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(note);
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
            selected
              ? "bg-surface-2 font-bold text-ai"
              : "font-medium text-ink-3 hover:bg-surface-2/80 hover:text-ai"
          }`}
        >
          <GitBranch className="h-3.5 w-3.5" />
          查看关联
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(note.id);
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
            note.starred
              ? "bg-surface-2 font-bold text-gold"
              : "font-medium text-ink-3 hover:bg-surface-2/80 hover:text-gold"
          }`}
        >
          <Star className="h-3.5 w-3.5" />
          {note.starred ? "已标重点" : "标为重点"}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFollowupOpenChange(!followupOpen);
            setFollowupError(null);
          }}
          aria-expanded={followupOpen}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
            followupOpen
              ? "bg-surface-2 font-bold text-ai"
              : "text-ink-3 hover:bg-surface-2/80 hover:text-ai"
          }`}
        >
          <MessageCirclePlus className="h-3.5 w-3.5" />
          追问
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note);
          }}
          aria-label="删除碎片笔记"
          title="删除碎片笔记"
          className="ml-auto inline-flex items-center rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-surface-2/80 hover:text-bad"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {followupOpen && (
        <div
          className="mt-4 space-y-3 border-t border-edge/50 pt-4"
          onClick={(event) => event.stopPropagation()}
        >
          {followups.map((turn, index) => (
            <div key={turn.id} className="rounded-xl border border-edge bg-surface-2/40 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-ink-3">第 {index + 1} 轮追问</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={followupPending}
                    onClick={() => void runFollowup(turn.question, turn.id)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-ink-3 transition-colors hover:bg-surface-2 hover:text-ai disabled:opacity-50"
                  >
                    <RotateCw className={`h-3 w-3 ${pendingFollowupId === turn.id ? "animate-spin" : ""}`} />
                    {pendingFollowupId === turn.id ? "生成中" : "重新生成"}
                  </button>
                  <button
                    type="button"
                    disabled={followupPending}
                    onClick={() => {
                      if (window.confirm("确定删除这轮追问与回答吗？")) onDeleteFollowup(note.id, turn.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-ink-3 transition-colors hover:bg-surface-2 hover:text-bad disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    删除
                  </button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-ink">
                {turn.question}
              </p>
              <div className="mt-2 flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 shrink-0 items-center rounded bg-surface-2 px-1.5 text-[10px] font-bold text-ai">
                  AI
                </span>
                {pendingFollowupId === turn.id ? (
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-ink-2">
                    正在结合卡片上下文重新生成…
                  </p>
                ) : (
                  <FormulaText
                    text={turn.answer}
                    className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-7 text-ink-2"
                  />
                )}
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-edge bg-surface p-3.5">
            <textarea
              value={followupDraft}
              onChange={(event) => setFollowupDraft(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault();
                  void runFollowup(followupDraft);
                }
              }}
              rows={2}
              maxLength={2000}
              disabled={followupPending}
              placeholder="输入你的追问…"
              aria-label="输入追问"
              className="w-full resize-none bg-transparent text-sm leading-6 text-ink outline-none placeholder:text-ink-3 disabled:opacity-60"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className={`min-w-0 text-[11px] leading-5 ${followupError ? "text-bad" : "text-ink-3"}`}>
                {followupError ?? (followupPending ? "AI 正在回答，请稍候…" : "Ctrl / Cmd + Enter 发送")}
              </span>
              <button
                type="button"
                disabled={followupPending || !followupDraft.trim()}
                onClick={() => void runFollowup(followupDraft)}
                className="btn-primary inline-flex shrink-0 items-center gap-1.5 !px-3 !py-1.5 text-xs"
              >
                {pendingFollowupId === "new" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {pendingFollowupId === "new" ? "发送中" : "发送"}
              </button>
            </div>
          </div>
        </div>
      )}

      {clozeEditorOpen && (
        <ClozeEditorDialog
          content={note.content}
          clozeTerms={note.clozeTerms}
          onClose={() => setClozeEditorOpen(false)}
          onSave={(nextContent, nextTerms) => {
            onUpdateCloze(note.id, nextContent, nextTerms);
            setMaskedInline(false);
          }}
        />
      )}
    </article>
  );
}
