import { useEffect, useMemo, useRef, useState } from "react";
import { Flame, GitBranch, Menu, Sparkles, X } from "lucide-react";
import { generateDeck } from "../../api/generateDeck";
import { getByok } from "../../utils/byok";
import { fileToPayload } from "../../utils/fileParser";
import { AiSettingsDialog } from "../core/AiSettingsDialog";
import { SparkClustersBoard } from "./SparkClustersBoard";
import { SparkComposer } from "./SparkComposer";
import { SparkNoteCard } from "./SparkNoteCard";
import { SparkQuizView } from "./SparkQuizView";
import { SparkRelatedPanel } from "./SparkRelatedPanel";
import { SparkSidebar, type SparkView } from "./SparkSidebar";
import {
  buildHeatmapData,
  buildQuizQueue,
  buildSingleNoteQuiz,
  buildTagTree,
  deckToSparkNotes,
  enrichDraftToNote,
  findRelatedNotes,
  loadSparkNotes,
  noteMatchesTagFilter,
  saveSparkNotes,
  type SparkNote,
  type SparkQuizCard,
} from "./sparkData";

export function SparkApp() {
  const [notes, setNotes] = useState<SparkNote[]>(loadSparkNotes);
  const [view, setView] = useState<SparkView>("stream");
  const [draft, setDraft] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => notes[0]?.id ?? null);
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

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    saveSparkNotes(notes);
  }, [notes]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? notes[0] ?? null,
    [notes, selectedNoteId],
  );

  const heatmap = useMemo(() => buildHeatmapData(notes), [notes]);

  const { tree: tagTree, totalTagCount } = useMemo(() => buildTagTree(notes), [notes]);

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
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, aiProcessing: false } : n)),
      );
    }, 650);
    timersRef.current.push(timer);
  }

  function publishNote(rawText: string) {
    const created = enrichDraftToNote(rawText);
    setNotes((prev) => [created, ...prev]);
    setSelectedNoteId(created.id);
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
        setNotes((prev) => [...generated, ...prev]);
        setSelectedNoteId(generated[0].id);
        setView("stream");
        setUploadNotice(`已通过 AI 解析「${file.name}」，生成 ${generated.length} 张结构化碎片卡片`);
      } catch {
        // 若本地转发层或密钥未配置，仍从文本/文件名本地提炼卡片，确保演示流畅不卡死
        const rawSource =
          payload.kind === "text" && payload.text
            ? payload.text.slice(0, 260)
            : `已解析学习资料「${file.name}」：请对照资料提炼核心概念、易混对比与自测记忆点。 #资料解析`;
        const localNote = enrichDraftToNote(rawSource);
        setNotes((prev) => [localNote, ...prev]);
        setSelectedNoteId(localNote.id);
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
    setQuizCards(buildQuizQueue(notes));
    setQuizScope(`全部碎片混合复习（${notes.length} 条）`);
    setQuizRunId((id) => id + 1);
    setView("quiz");
    setMobileNavOpen(false);
  }

  function startQuizCluster(cluster: string) {
    const cards = buildQuizQueue(notes, cluster);
    setQuizCards(cards);
    setQuizScope(`专题：${cluster}`);
    setQuizRunId((id) => id + 1);
    setView("quiz");
  }

  function startQuizSingleNote(note: SparkNote) {
    setQuizCards(buildSingleNoteQuiz(note));
    setQuizScope(`单卡速测：${note.aiTitle.slice(0, 14)}…`);
    setQuizRunId((id) => id + 1);
    setView("quiz");
  }

  function jumpToNote(note: SparkNote) {
    setSelectedNoteId(note.id);
    setSelectedTag(null);
    setOnlyStarred(false);
    setView("stream");
    setMobileRelatedOpen(false);
  }

  const sidebarProps = {
    view,
    onChangeView: (next: SparkView) => {
      if (next === "quiz") {
        startQuizAll();
        return;
      }
      setView(next);
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
      setSelectedTag(tag);
      setView("stream");
      setMobileNavOpen(false);
    },
    onToggleStarred: () => {
      setOnlyStarred((v) => !v);
      setView("stream");
      setMobileNavOpen(false);
    },
    hasByok,
    onOpenSettings: () => {
      setAiSettingsOpen(true);
      setMobileNavOpen(false);
    },
    quizCount: notes.length,
  };

  return (
    <div className="site-shell min-h-screen bg-void text-ink">
      {/* 移动端顶部紧凑栏（< lg 显示） */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-edge bg-surface/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <button
          type="button"
          aria-label="打开导航与标签栏"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-edge bg-surface text-ink-2"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-3 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-black tracking-tight text-ink">SparkNote 拾光笔记</span>
        </div>

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
            {view === "stream" && (
              <div className="space-y-6">
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
                  ) : (
                    filteredNotes.map((note) => (
                      <SparkNoteCard
                        key={note.id}
                        note={note}
                        selected={note.id === activeNote?.id}
                        onSelect={(n) => setSelectedNoteId(n.id)}
                        onToggleStar={(id) =>
                          setNotes((prev) =>
                            prev.map((item) =>
                              item.id === id ? { ...item, starred: !item.starred } : item,
                            ),
                          )
                        }
                        onClickTag={(tag) => setSelectedTag((cur) => (cur === tag ? null : tag))}
                        onMakeFlashcard={startQuizSingleNote}
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
                onSelectNote={(n) => setSelectedNoteId(n.id)}
                onQuizCluster={startQuizCluster}
              />
            )}

            {view === "quiz" && (
              <SparkQuizView
                key={quizRunId}
                initialCards={quizCards}
                scopeLabel={quizScope}
                onBackToStream={() => setView("stream")}
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
