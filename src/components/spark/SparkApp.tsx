import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Flame, GitBranch, Menu, Sparkles, Trash2, X } from "lucide-react";
import { generateDeck } from "../../api/generateDeck";
import { askFollowup, type FollowupHistoryItem } from "../../api/followup";
import { getByok } from "../../utils/byok";
import { fileToPayload } from "../../utils/fileParser";
import { AiSettingsDialog } from "../core/AiSettingsDialog";
import { SparkClustersBoard } from "./SparkClustersBoard";
import { SparkComposer } from "./SparkComposer";
import { SparkNoteCard } from "./SparkNoteCard";
import { SparkQuizView } from "./SparkQuizView";
import { usePomodoro } from "./usePomodoro";
import { SparkRelatedPanel } from "./SparkRelatedPanel";
import { SparkSidebar, type SparkView } from "./SparkSidebar";
import {
  buildHeatmapData,
  buildQuizQueue,
  buildSingleNoteQuiz,
  buildTagTree,
  canMergeTag,
  collectTagSubtree,
  deckToSparkNotes,
  enrichDraftToNote,
  findRelatedNotes,
  getTagPath,
  inferTagParentsForNotes,
  loadSparkNotes,
  loadTagParents,
  migrateTagSubtree,
  noteMatchesTagFilter,
  resolveTagAddition,
  saveSparkNotes,
  saveTagParents,
  type SparkNote,
  type SparkQuizCard,
  type TagParentMap,
} from "./sparkData";

interface SparkAppProps {
  onReturnLanding?: () => void;
}

interface TagMenuState {
  tag: string;
  noteId: string | null;
  x: number;
  y: number;
}

export function SparkApp({ onReturnLanding }: SparkAppProps) {
  const [notes, setNotes] = useState<SparkNote[]>(loadSparkNotes);
  const [view, setView] = useState<SparkView>("stream");
  const [draft, setDraft] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => notes[0]?.id ?? null);
  const [openFollowupNoteId, setOpenFollowupNoteId] = useState<string | null>(() =>
    notes[0]?.followups?.length ? notes[0].id : null,
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyStarred, setOnlyStarred] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [quizCards, setQuizCards] = useState<SparkQuizCard[]>(() => buildQuizQueue(notes));
  const [quizScope, setQuizScope] = useState("全部碎片混合复习");
  const [quizRunId, setQuizRunId] = useState(0);

  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [hasByok, setHasByok] = useState(() => Boolean(getByok()));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileRelatedOpen, setMobileRelatedOpen] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [tagMenu, setTagMenu] = useState<TagMenuState | null>(null);
  const [tagParents, setTagParents] = useState<TagParentMap>(loadTagParents);
  const pomodoro = usePomodoro();

  const notesRef = useRef(notes);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!tagMenu) return;
    const close = () => setTagMenu(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("click", close);
    window.addEventListener("blur", close);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("blur", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [tagMenu]);

  function changeView(next: SparkView) {
    startTransition(() => setView(next));
  }

  function selectNote(note: SparkNote) {
    if (selectedNoteId === note.id) {
      setOpenFollowupNoteId((current) =>
        current === note.id ? null : note.followups?.length ? note.id : null,
      );
      return;
    }
    setSelectedNoteId(note.id);
    setOpenFollowupNoteId(note.followups?.length ? note.id : null);
  }

  function commitNotes(updater: (prev: SparkNote[]) => SparkNote[]): boolean {
    const next = updater(notesRef.current);
    notesRef.current = next;
    setNotes(next);
    const saved = saveSparkNotes(next);
    setStorageWarning(
      saved
        ? null
        : "本地保存失败，刷新可能丢失本次修改；请检查浏览器存储空间或隐私模式权限。",
    );
    return saved;
  }

  function openTagMenu(tag: string, noteId: string | null, x: number, y: number) {
    setTagMenu({
      tag,
      noteId,
      x: Math.max(8, Math.min(x, window.innerWidth - 180)),
      y: Math.max(8, Math.min(y, window.innerHeight - 96)),
    });
  }

  const activeNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? notes[0] ?? null,
    [notes, selectedNoteId],
  );

  const heatmap = useMemo(() => buildHeatmapData(notes), [notes]);

  const { tree: tagTree, totalTagCount } = useMemo(
    () => buildTagTree(notes, tagParents),
    [notes, tagParents],
  );

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (onlyStarred && !n.starred) return false;
      if (selectedTag && !noteMatchesTagFilter(n, selectedTag, tagTree)) return false;
      return true;
    });
  }, [notes, onlyStarred, selectedTag, tagTree]);

  const relatedMatches = useMemo(
    () => findRelatedNotes(draft, activeNote, notes),
    [draft, activeNote, notes],
  );

  function scheduleAiFinish(noteId: string) {
    const timer = setTimeout(() => {
      const next = notesRef.current.map((n) =>
        n.id === noteId ? { ...n, aiProcessing: false } : n,
      );
      notesRef.current = next;
      setNotes(next);
    }, 650);
    timersRef.current.push(timer);
  }

  function publishNote(rawText: string) {
    const created = enrichDraftToNote(rawText);
    commitNotes((prev) => [created, ...prev]);
    setSelectedNoteId(created.id);
    setOpenFollowupNoteId(null);
    setDraft("");
    setSelectedTag(null);
    setOnlyStarred(false);
    setUploadError(null);
    scheduleAiFinish(created.id);
  }

  async function handleUploadFile(file: File) {
    setUploading(true);
    setUploadNotice(null);
    setUploadError(null);
    try {
      const { payload, notice } = await fileToPayload(file);
      if (notice) setUploadNotice(notice);
      try {
        const deck = await generateDeck(payload);
        const generated = deckToSparkNotes(deck);
        const nextParents = inferTagParentsForNotes(generated, tagParents);
        const notesSaved = commitNotes((prev) => [...generated, ...prev]);
        if (nextParents !== tagParents) {
          const parentsSaved = saveTagParents(nextParents);
          setTagParents(nextParents);
          if (!notesSaved || !parentsSaved) {
            setStorageWarning("卡片已生成，但分类或笔记保存失败，刷新后可能丢失。请检查浏览器存储空间或隐私模式权限。");
          }
        }
        setSelectedNoteId(generated[0].id);
        setOpenFollowupNoteId(null);
        changeView("stream");
        setUploadNotice(`已通过 AI 解析「${file.name}」，生成 ${generated.length} 张结构化碎片卡片`);
      } catch {
        // 若本地转发层或密钥未配置，仍从文本/文件名本地提炼卡片，确保演示流畅不卡死
        const rawSource =
          payload.kind === "text" && payload.text
            ? payload.text.slice(0, 260)
            : `已解析学习资料「${file.name}」：请对照资料提炼核心概念、易混对比与自测记忆点。 #资料解析`;
        const localNote = enrichDraftToNote(rawSource);
        commitNotes((prev) => [localNote, ...prev]);
        setSelectedNoteId(localNote.id);
        setOpenFollowupNoteId(null);
        scheduleAiFinish(localNote.id);
        setUploadNotice(`已提取「${file.name}」内容并完成本地提炼（配置 API 后可调用远端多模态深度解析）`);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "文件解析失败，请检查格式后重试");
    } finally {
      setUploading(false);
    }
  }

  function startQuizAll() {
    startTransition(() => {
      setQuizCards(buildQuizQueue(notes));
      setQuizScope(`全部碎片混合复习（${notes.length} 条）`);
      setQuizRunId((id) => id + 1);
      setView("quiz");
    });
    setMobileNavOpen(false);
  }

  function startQuizCluster(cluster: string) {
    startTransition(() => {
      const cards = buildQuizQueue(notes, cluster);
      setQuizCards(cards);
      setQuizScope(`专题：${cluster}`);
      setQuizRunId((id) => id + 1);
      setView("quiz");
    });
  }

  function startQuizSingleNote(note: SparkNote) {
    startTransition(() => {
      setQuizCards(buildSingleNoteQuiz(note));
      setQuizScope(`单卡速测：${note.aiTitle.slice(0, 14)}…`);
      setQuizRunId((id) => id + 1);
      setView("quiz");
    });
  }

  function jumpToNote(note: SparkNote) {
    selectNote(note);
    setSelectedTag(null);
    setOnlyStarred(false);
    changeView("stream");
    setMobileRelatedOpen(false);
  }

  function deleteNote(note: SparkNote) {
    if (!window.confirm("确定删除这条碎片笔记吗？此操作不可撤销。")) return;
    const next = notesRef.current.filter((item) => item.id !== note.id);
    if (selectedNoteId === note.id) {
      setSelectedNoteId(next[0]?.id ?? null);
      setOpenFollowupNoteId(null);
    }
    setQuizCards((cards) => cards.filter((card) => card.noteId !== note.id));
    commitNotes(() => next);
  }

  function addTag(noteId: string, rawTag: string) {
    const tag = rawTag.trim().replace(/^#+/, "");
    if (!tag || tag.length > 20 || /\s/.test(tag)) return;
    const note = notesRef.current.find((item) => item.id === noteId);
    if (!note) return;
    const result = resolveTagAddition(note.tags, tag, tagTree, tagParents);
    const notesSaved = commitNotes((prev) =>
      prev.map((item) => (item.id === noteId ? { ...item, tags: result.tags } : item)),
    );
    if (result.parents !== tagParents) {
      const parentsSaved = saveTagParents(result.parents);
      setTagParents(result.parents);
      if (!notesSaved || !parentsSaved) {
        setStorageWarning("标签已更新，但本地保存失败，刷新后可能丢失。请检查浏览器存储空间或隐私模式权限。");
      }
    }
  }

  function moveTag(source: string, target: string | null) {
    const result = migrateTagSubtree(notesRef.current, source, target, tagTree, tagParents);
    const notesSaved = commitNotes(() => result.notes);
    const parentsSaved = saveTagParents(result.parents);
    setTagParents(result.parents);
    if (!notesSaved || !parentsSaved) {
      setStorageWarning("标签移动已应用，但本地保存失败，刷新后可能丢失。请检查浏览器存储空间或隐私模式权限。");
    }
  }

  function mergeTag(source: string, target: string) {
    if (source === target) return;
    const sourcePath = getTagPath(tagTree, source);
    if (sourcePath && sourcePath[sourcePath.length - 2] === target) return;
    if (!canMergeTag(source, target, tagParents)) {
      window.alert("不能把标签移动到它自己或它的子分类下。");
      return;
    }
    moveTag(source, target);
  }

  function detachTag(source: string) {
    const sourcePath = getTagPath(tagTree, source);
    if (!sourcePath || sourcePath.length === 1) return;
    moveTag(source, null);
  }

  function updateCloze(noteId: string, content: string, clozeTerms: string[]) {
    commitNotes((prev) =>
      prev.map((note) => (note.id === noteId ? { ...note, content, clozeTerms } : note)),
    );
  }

  async function submitFollowup(
    noteId: string,
    question: string,
    history: FollowupHistoryItem[],
    regenerateId?: string,
  ) {
    const note = notesRef.current.find((item) => item.id === noteId);
    if (!note) return;
    const result = await askFollowup({
      note: {
        title: note.aiTitle,
        content: note.content,
        question: note.question,
        plainExplanation: note.plainExplanation,
        confusion: note.confusion,
      },
      question,
      history,
    });
    commitNotes((prev) =>
      prev.map((item) => {
        if (item.id !== noteId) return item;
        const followups = item.followups ?? [];
        if (regenerateId) {
          return {
            ...item,
            followups: followups.map((turn) =>
              turn.id === regenerateId
                ? { ...turn, answer: result.answer, model: result.model, updatedAt: Date.now() }
                : turn,
            ),
          };
        }
        return {
          ...item,
          followups: [
            ...followups,
            {
              id: crypto.randomUUID(),
              question,
              answer: result.answer,
              createdAt: Date.now(),
              model: result.model,
            },
          ],
        };
      }),
    );
  }

  function deleteFollowup(noteId: string, turnId: string) {
    commitNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? { ...note, followups: (note.followups ?? []).filter((turn) => turn.id !== turnId) }
          : note,
      ),
    );
  }

  function removeTagFromMenu() {
    if (!tagMenu) return;
    const descendants = collectTagSubtree(tagTree, tagMenu.tag).slice(1);
    const tagsToRemove = tagMenu.noteId
      ? [tagMenu.tag]
      : [tagMenu.tag, ...descendants];
    const message = tagMenu.noteId
      ? `确定从这张卡片移除标签「${tagMenu.tag}」吗？卡片不会被删除。`
      : descendants.length > 0
        ? `确定删除分类「${tagMenu.tag}」吗？该分类及其 ${descendants.length} 个后代标签会从所有卡片中移除。`
        : `确定删除标签「${tagMenu.tag}」吗？该标签会从所有卡片中移除。`;
    if (!window.confirm(message)) {
      setTagMenu(null);
      return;
    }
    const notesSaved = commitNotes((prev) =>
      prev.map((note) => {
        if (tagMenu.noteId && note.id !== tagMenu.noteId) return note;
        const tags = note.tags.filter((tag) => !tagsToRemove.includes(tag));
        return tags.length === note.tags.length ? note : { ...note, tags };
      }),
    );
    let parentsSaved = true;
    if (!tagMenu.noteId) {
      const nextParents = Object.fromEntries(
        Object.entries(tagParents).filter(
          ([child, parent]) =>
            !tagsToRemove.includes(child) &&
            !(typeof parent === "string" && tagsToRemove.includes(parent)),
        ),
      );
      parentsSaved = saveTagParents(nextParents);
      setTagParents(nextParents);
    }
    if (!notesSaved || !parentsSaved) {
      setStorageWarning("标签删除已应用，但本地保存失败，刷新后可能丢失。请检查浏览器存储空间或隐私模式权限。");
    }
    if (selectedTag && tagsToRemove.includes(selectedTag)) setSelectedTag(null);
    setTagMenu(null);
  }

  const sidebarProps = {
    view,
    onChangeView: (next: SparkView) => {
      if (next === "quiz") {
        startQuizAll();
        return;
      }
      changeView(next);
      setMobileNavOpen(false);
    },
    onStartQuiz: startQuizAll,
    heatmap,
    noteCount: notes.length,
    tagTree,
    totalTagCount,
    selectedTag,
    onlyStarred,
    onSelectTag: (tag: string | null) => {
      startTransition(() => {
        setSelectedTag(tag);
        setView("stream");
      });
      setMobileNavOpen(false);
    },
    onToggleStarred: () => {
      startTransition(() => {
        setOnlyStarred((v) => !v);
        setView("stream");
      });
      setMobileNavOpen(false);
    },
    hasByok,
    onOpenSettings: () => {
      setAiSettingsOpen(true);
      setMobileNavOpen(false);
    },
    quizCount: notes.length,
    pomodoro,
    onReturnLanding: onReturnLanding
      ? () => {
          setMobileNavOpen(false);
          onReturnLanding();
        }
      : undefined,
    onTagContextMenu: (tag: string, x: number, y: number) => openTagMenu(tag, null, x, y),
    onMergeTag: mergeTag,
    onDetachTag: detachTag,
  };

  return (
    <div className="site-shell min-h-screen bg-void text-ink animate-[landing-fade-in_0.42s_ease-out_backwards]">
      {/* 移动端顶部紧凑栏（< lg 显示） */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-edge bg-surface/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <button
          type="button"
          aria-label="打开导航与标签栏"
          onClick={() => setMobileNavOpen(true)}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-edge bg-surface text-ink-2"
        >
          <Menu className="h-4 w-4" />
          {pomodoro.state.running && (
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-accent-2"
              aria-hidden="true"
            />
          )}
        </button>

        {onReturnLanding ? (
          <button
            type="button"
            onClick={onReturnLanding}
            title="返回首页"
            className="flex items-center gap-2 rounded-lg px-1 py-0.5 transition hover:opacity-85"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-3 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-black tracking-tight text-ink">SparkNote 拾光笔记</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-3 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-black tracking-tight text-ink">SparkNote 拾光笔记</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={startQuizAll}
            className="inline-flex items-center gap-1 rounded-lg border tint-accent px-2.5 py-1.5 text-xs font-bold text-accent"
          >
            <Flame className="h-3.5 w-3.5" />
            自测
          </button>
          <button
            type="button"
            aria-label="打开 AI 隐形关联面板"
            onClick={() => setMobileRelatedOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border tint-ai"
          >
            <GitBranch className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 桌面端三栏自适应框架：左 256px + 中央主工作区 + 右 304px */}
      <div className="mx-auto flex min-h-screen max-w-[1480px]">
        {/* 左栏：桌面常驻 256px */}
        <div className="hidden w-[256px] shrink-0 border-r border-edge bg-void lg:block">
          <div className="sticky top-0 h-screen">
            <SparkSidebar {...sidebarProps} />
          </div>
        </div>

        {/* 中央核心工作区 */}
        <main className="min-w-0 flex-1 px-5 py-7 sm:px-10 sm:py-9">
          <div
            className={`mx-auto ${
              view === "clusters" ? "max-w-[960px]" : "max-w-[700px]"
            }`}
          >
            {storageWarning && (
              <div
                role="alert"
                className="mb-5 flex items-center justify-between gap-3 rounded-xl border tint-warn bg-surface px-4 py-3 text-xs font-semibold text-warn shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {storageWarning}
                </span>
                <button
                  type="button"
                  onClick={() => setStorageWarning(null)}
                  aria-label="关闭存储提示"
                  className="shrink-0 rounded p-1 opacity-75 transition hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {view === "stream" && (
              <div className="space-y-6 flashcard-enter-next">
                {/* 中等桌面（1024~1279px）右栏收起时提供快速开启关联面板的提示条 */}
                <div className="flex flex-wrap items-center justify-between gap-2 xl:hidden">
                  <p className="text-xs font-semibold text-ink-3">
                    碎片流 · 共 {filteredNotes.length} 条记录
                    {selectedTag ? ` · 筛选 #${selectedTag}` : ""}
                    {onlyStarred ? " · 仅重点" : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMobileRelatedOpen(true)}
                    className="hidden items-center gap-1.5 rounded-lg border tint-ai px-2.5 py-1 text-xs font-bold lg:inline-flex"
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    查看 AI 隐形关联（{relatedMatches.length}）
                  </button>
                </div>

                <SparkComposer
                  value={draft}
                  onChange={setDraft}
                  onPublish={publishNote}
                  onUploadFile={handleUploadFile}
                  uploading={uploading}
                  uploadNotice={uploadNotice}
                  uploadError={uploadError}
                />

                {/* 筛选状态提示条 */}
                {(selectedTag || onlyStarred) && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-edge bg-surface px-4 py-2.5 text-xs">
                    <span className="font-semibold text-ink-2">
                      当前过滤：
                      {onlyStarred && <span className="ml-1 font-bold text-gold">⭐ 重点标记</span>}
                      {selectedTag && (
                        <span className="ml-1 font-bold text-accent">#{selectedTag}</span>
                      )}
                      （{filteredNotes.length} 条）
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTag(null);
                        setOnlyStarred(false);
                      }}
                      className="font-bold text-accent hover:underline"
                    >
                      清除筛选
                    </button>
                  </div>
                )}

                {/* 碎片卡片信息流 */}
                <div className="space-y-5">
                  {filteredNotes.length === 0 ? (
                    notes.length > 0 ? (
                      <div className="rounded-2xl border border-edge bg-surface p-8 text-center">
                        <p className="text-sm font-bold text-ink">当前筛选下还没有碎片笔记</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTag(null);
                            setOnlyStarred(false);
                          }}
                          className="btn-secondary mt-3 text-xs"
                        >
                          显示全部碎片
                        </button>
                      </div>
                    ) : null
                  ) : (
                    filteredNotes.map((note) => (
                      <SparkNoteCard
                        key={note.id}
                        note={note}
                        selected={note.id === activeNote?.id}
                        followupOpen={openFollowupNoteId === note.id}
                        onFollowupOpenChange={(open) => {
                          setOpenFollowupNoteId(open ? note.id : null);
                          if (open) setSelectedNoteId(note.id);
                        }}
                        onSelect={selectNote}
                        onToggleStar={(id) =>
                          commitNotes((prev) =>
                            prev.map((item) =>
                              item.id === id ? { ...item, starred: !item.starred } : item,
                            ),
                          )
                        }
                        onClickTag={(tag) => setSelectedTag((cur) => (cur === tag ? null : tag))}
                        onMakeFlashcard={startQuizSingleNote}
                        onDelete={deleteNote}
                        onAddTag={addTag}
                        onTagContextMenu={openTagMenu}
                        onUpdateCloze={updateCloze}
                        onAskFollowup={submitFollowup}
                        onDeleteFollowup={deleteFollowup}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {view === "clusters" && (
              <SparkClustersBoard
                notes={notes}
                selectedNoteId={activeNote?.id ?? null}
                onSelectNote={selectNote}
                onQuizCluster={startQuizCluster}
              />
            )}

            {view === "quiz" && (
              <SparkQuizView
                key={quizRunId}
                initialCards={quizCards}
                scopeLabel={quizScope}
                onBackToStream={() => changeView("stream")}
                onRestartAll={startQuizAll}
              />
            )}
          </div>
        </main>

        {/* 右栏：AI 隐形关联上下文面板（xl 以上常驻 304px） */}
        <div className="hidden w-[304px] shrink-0 border-l border-edge bg-void xl:block">
          <div className="sticky top-0 h-screen">
            <SparkRelatedPanel
              queryText={draft}
              activeNote={activeNote}
              matches={relatedMatches}
              onJumpToNote={jumpToNote}
            />
          </div>
        </div>
      </div>

      {/* 移动端左侧导航抽屉 */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="导航菜单">
          <button
            type="button"
            aria-label="关闭导航菜单"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />
          <div className="relative z-10 flex h-full w-[268px] max-w-[84vw] flex-col border-r border-edge bg-void shadow-2xl">
            <div className="flex items-center justify-between border-b border-edge px-4 py-2.5">
              <span className="text-xs font-bold text-ink-3">导航与状态</span>
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg border border-edge bg-surface p-1.5 text-ink-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SparkSidebar {...sidebarProps} />
            </div>
          </div>
        </div>
      )}

      {/* 移动与中屏右侧关联抽屉 */}
      {mobileRelatedOpen && (
        <div className="fixed inset-0 z-50 flex justify-end xl:hidden" role="dialog" aria-modal="true" aria-label="AI 隐形关联">
          <button
            type="button"
            aria-label="关闭 AI 隐形关联"
            onClick={() => setMobileRelatedOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />
          <div className="relative z-10 flex h-full w-[300px] max-w-[86vw] flex-col border-l border-edge bg-void shadow-2xl">
            <div className="flex items-center justify-between border-b border-edge px-4 py-2.5">
              <span className="text-xs font-bold text-ink-3">上下文关联</span>
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setMobileRelatedOpen(false)}
                className="rounded-lg border border-edge bg-surface p-1.5 text-ink-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SparkRelatedPanel
                queryText={draft}
                activeNote={activeNote}
                matches={relatedMatches}
                onJumpToNote={jumpToNote}
              />
            </div>
          </div>
        </div>
      )}

      {tagMenu && (
        <div
          role="menu"
          aria-label={`标签 ${tagMenu.tag} 操作`}
          onClick={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
          style={{ left: tagMenu.x, top: tagMenu.y }}
          className="fixed z-[100] w-44 rounded-xl border border-edge bg-surface p-1.5 shadow-2xl"
        >
          <p className="truncate px-2.5 py-1 text-[11px] font-semibold text-ink-3">#{tagMenu.tag}</p>
          <button
            type="button"
            role="menuitem"
            autoFocus
            onClick={removeTagFromMenu}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-bad transition-colors hover:bg-surface-2"
          >
            <Trash2 className="h-3.5 w-3.5" />
            删除标签
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => setTagMenu(null)}
            className="w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink-2 transition-colors hover:bg-surface-2"
          >
            取消
          </button>
        </div>
      )}

      {aiSettingsOpen && (
        <AiSettingsDialog
          open={aiSettingsOpen}
          onClose={() => {
            setAiSettingsOpen(false);
            setHasByok(Boolean(getByok()));
          }}
        />
      )}
    </div>
  );
}
