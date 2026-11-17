# 任务简报 · 角色 B：核心业务流 & AI 解析引擎

> 本文件供角色 B 及其 AI 编程助手直接阅读执行。仓库：https://github.com/Misaki-asahi/fragment-notes
> 配套简报：`docs/brief-c-ui.md`（角色 C 的 UI 组件任务）。全局数据契约：`src/types/deck.ts`。

## 1. 项目与当前进度

产品「碎片笔记」：粘贴提纲 / 上传笔记照片 / 课件 PDF → AI 一次产出概念摘要、易混点对比、闪卡、自测题 → 3D 翻卡记忆 → 3 分钟小测 → 大白话错题本闭环。参赛交付：Qoder Sites 公网可体验 + 天池作品帖，截止 **2026-11-30 18:00**。

已完成（不要重做）：
- 阶段 1 框架：Vite + React 18 + TS(strict) + Tailwind v4 + lucide-react；`StudyDeck` 契约与计网/高数/心理学 3 套 Mock（`src/mock/sampleDecks.ts`）；目录隔离占位。
- 设计地基：双主题语义令牌（深空默认 / 浅色护眼）、自托管变量字体、`.edge-glow / .kicker / .typewriter` 视觉类、`ThemeToggle`。见 `src/index.css`。
- Git：`main`（保护：PR+1 批准、禁强推/删分支）+ `dev`（日常集成）。你的提交走 `feat/*` → PR → `dev`。

## 2. 你的所有权目录（围栏）

只改：`src/api/`、`src/store/`、`src/pages/`、`src/components/core/`、`src/utils/`、根目录 `api/`（Serverless）。
不改：`src/types/deck.ts`、`src/mock/`（契约改动找角色 A 全队同步）、`src/components/rookie/`（C 的沙盒）、`src/index.css` 令牌（加类可以，改令牌找 A）。

## 3. 设计语言约束（双主题硬要求）

组件一律用语义类名：`bg-void / bg-surface / bg-surface-2`、`border-edge / border-edge-2`、`text-ink / text-ink-2 / text-ink-3`、`text-accent / accent-2 / accent-3 / gold / ok / warn / bad`、`font-sans / font-display / font-mono`；卡片用 `.edge-glow`（直角+渐变描边），分区标题用 `.kicker`。
**禁止**写死颜色（`bg-white`、`text-slate-500`、hex 值）——否则浅色主题下会瞎。动效加 `transition`，并尊重 `prefers-reduced-motion`（全局已降级）。

## 4. 任务清单（按序推进，Mock 先行）

### B1 `src/store/useDeckStore.ts` — 持久化与状态
- 状态：`decks: StudyDeck[]`、`currentDeckId`、`wrongItems`（每项 `{ id, deckTitle, quiz: StudyDeck['quizzes'][number], userChoiceIndex, customAnalogies?: string[] }`）。
- localStorage 自动存取（刷新不丢）；键名自定但集中常量管理。
- actions：`addDeck`、`selectDeck`、`updateCardStatus(cardId, status)`、`addWrong`、`removeWrong`、`appendAnalogy(id, text)`。
- 初始数据用 `sampleDecks` 兜底；验收：刷新后牌组/掌握度/错题均在。

### B2 `src/utils/fileParser.ts` + `src/components/core/` — 输入与骨架
- `fileParser`：`pdfjs-dist` 提取 PDF 前 15 页文本、上限 12000 字（超出给友好截断提示）；图片 Canvas 压缩转 Base64（长边 ≤1600px）。
- `core/UploadZone.tsx`：粘贴大段文本、拖拽/选择 JPG/PNG/PDF、「一键填入示例」按钮（直接取 Mock）。
- `core/LoadingSkeleton.tsx`、`core/HistoryDrawer.tsx`（历史牌组列表+切换+删除）。
- 验收：三种输入都能产出统一 payload `{ kind: 'text'|'image'|'pdf', text?, imageBase64? }`。

### B3 `src/pages/WorkspacePage.tsx` — 主工作台
- 上传区 + 生成中加载态 + 错误重试提示（断网/解析失败不白屏）。
- Tab 挂载 C 的四个组件（`ConceptMatrix / FlashCardDeck / WrongBookView / FocusTimerBar`），**只通过 Props 传 `StudyDeck` 切片与回调**；C 组件未就绪时先用占位块，不写死假数据进组件。
- 完成后由 A 把 `App.tsx` 入口切到工作台（集成权在 A）。

### B4 `src/pages/QuizEngine.tsx` — 3 分钟小测闭环
- 180s 倒计时、4 选 1、自动判卷与得分统计；超时自动交卷。
- 答错自动 `addWrong`；错题重做入口；与错题本「换个生活比喻」联动（调 B5 接口）。
- 验收：做完一套能判分，错题顺畅流入错题本并可重做。

### B5 `src/api/generateDeck.ts` + 根 `api/generate-deck.ts` — AI 多模态解析
- 前端统一接口：text / imageBase64 / pdfText → POST Serverless 转发层 → 多模态大模型；**API Key 只从环境变量 `AI_API_KEY` 读，前端绝不暴露**。
- System Prompt 要求严格输出合法 `StudyDeck` JSON：控制闪卡 6~10 张、题 4~6 道、`plainExplanation` 必须生活类比大白话。
- 容错：清洗 ```json 外壳、缺失字段安全默认值、超时重试 1 次、失败返回可重试错误。
- 部署形态：Qoder Sites Function（上线阶段由 A 配置环境变量）。
- 验收：真实提纲/照片/多页 PDF 都能稳出四件套；异常给重试 UI。

### B6 联调收尾
- 去掉 Mock 依赖跑真实资料；补超长文本截断提示、导出牌组 JSON 入口；配合全队无痕回归。

## 5. 工作流与自检

1. `git checkout dev && git pull origin dev` → `git checkout -b feat/core-<任务名>`。
2. 先 Ask 模式问清字段与位置，再 Agent 动手；Prompt 带 `@src/types/deck.ts` 与围栏句「只改 <目录>，不碰其他文件」。
3. 提交前：`npx tsc --noEmit && npm run build`；`git status` 确认改动在围栏内、无 `.env`。
4. 浏览器点一遍交互 + F12 控制台无红字 + 375px 窄屏 + **深空/浅色两主题各看一遍**。
5. push → PR 目标 `dev`，@角色 A Review。卡点先带排查记录找 A，不闷头耗。

## 6. 沿蓝图思路的原则

契约先行（一切以 `StudyDeck` 为准）→ Mock 先行（接口没好先用示例跑通 UI 流）→ 渐进集成（每完成一块即提 PR）→ 报错喂完整日志给 AI 做最小修复，不整文件重写。