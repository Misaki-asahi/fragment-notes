# 任务简报 · 角色 C：UI 体验组件（rookie 沙盒）

> 本文件供角色 C 及其 AI 编程助手（Qoder）直接阅读执行。仓库：https://github.com/Misaki-asahi/fragment-notes
> 配套简报：`docs/brief-b-core.md`（角色 B 的业务流任务）。数据契约：`src/types/deck.ts`；示例数据：`src/mock/sampleDecks.ts`。

## 1. 项目与当前进度

产品「碎片笔记」：碎片资料 → AI 四件套（概念/易混对比/闪卡/自测）→ 翻卡记忆 → 3 分钟小测 → 大白话错题本。参赛交付：Qoder Sites 公网体验 + 天池作品帖，截止 **2026-11-30 18:00**。你负责其中四个独立 UI 组件，用 Qoder 边做边学。

已完成（不要重做）：
- 阶段 1 框架：Vite + React 18 + TS(strict) + Tailwind v4 + lucide-react；`StudyDeck` 契约 + 3 套 Mock；`src/components/rookie/` 沙盒目录已建好。
- 设计地基：双主题（深空默认/浅色护眼）语义令牌、自托管字体、`.edge-glow / .kicker / .typewriter` 视觉类。见 `src/index.css` 与 `src/App.tsx`（活样板）。
- Git：`main` 保护 + `dev` 集成；你走 `feat/rookie-*` → PR → `dev`，由角色 A Review 并挂载进主工作台。

## 2. 围栏（最重要的一条）

**只创建/修改 `src/components/rookie/` 下的文件。** 不碰路由、`App.tsx`、`index.css` 令牌、队友目录。每条给 AI 的 Prompt 都带这句围栏。需要新语义色/新全局类 → 找角色 A，不自己加。

## 3. 设计语言速查（双主题硬要求）

- 背景/卡面：`bg-void` `bg-surface` `bg-surface-2`；卡片容器用 `.edge-glow`（直角+渐变发光描边，参考站风格）
- 描边：`border-edge` `border-edge-2`；文字三级：`text-ink` `text-ink-2` `text-ink-3`
- 强调：`text-accent`(紫) `text-accent-2`(青) `text-accent-3`(品红) `text-gold` `text-ok` `text-warn` `text-bad`
- 字体：`font-sans` 正文 / `font-display` 展示标题 / `font-mono` 标签编号；分区小标题用 `.kicker`
- **禁止写死颜色**（`bg-white`、`text-slate-*`、hex）——浅色主题下会瞎；禁止圆角滥用（卡片直角，胶囊标签可 `rounded-full`）
- 交互质感：按钮加 `transition` + 柔和 hover/active；长文本 `break-words`；375px 窄屏单列不溢出
- 动效尊重 `prefers-reduced-motion`（全局已降级，无需自理）

## 4. 闯关任务（按序，每关一个 PR）

### Level 0 · 跑起来 + 读懂契约
1. `git clone` → `npm install` → `npm run dev` 打开 http://localhost:5173 看到示例页。
2. **Ask 模式**问 AI：`@src/types/deck.ts` 的四个数组各对应界面哪块？什么是 Props？
3. 建 `rookie/RookiePreview.tsx` 本地预览台：导入 `sampleDecks[0]` 传给你的组件，回调先 `console.log`/`useState`，单独调试不碰队友页面。

### Level 1 · `FlashCardDeck.tsx` 3D 翻转闪卡
- Props：`cards: StudyDeck['flashcards']`、`onUpdateStatus: (cardId: string, status: 'review' | 'mastered') => void`
- 顶部进度条（已掌握 x / y）+ 当前卡难度标签（easy/medium/hard）
- 中央大卡点击触发 CSS 3D Y 轴翻转：正面 `front` + 「点击翻转查看答案」；背面 `back`，超长内部滚动不撑破
- 键盘：空格翻转、←/→ 切卡
- 底部按钮「😅 还要再记」(review) /「✅ 我已掌握」(mastered)，点完自动滑下一张

### Level 2 · `ConceptMatrix.tsx` 概念与易混对比
- Props：`summary: string`、`concepts: StudyDeck['concepts']`、`confusions: StudyDeck['confusions']`
- 顶部浅色强调卡展示 `summary`；概念区 2 列响应式网格：`term` 加粗 + `definition` + 底部高亮胶囊 `keyPoint`
- 易混区每组左右对照卡（`itemAName/itemAFeature` vs `itemBName/itemBFeature`），底部琥珀色提示条 `distinctionTip`
- 窄屏单列、长句不乱版

### Level 3 · `WrongBookView.tsx` 大白话错题本
- Props：`wrongItems`（`{ id, deckTitle, quiz, userChoiceIndex, customAnalogies?: string[] }`）、`onRemove: (id) => void`、`onAskMoreAnalogy: (id) => Promise<void> | void`
- 空状态引导：「暂时还没有错题，快去做一套 3 分钟小测验检验一下吧！」
- 错题卡：牌组标签、题干、错选红标（`text-bad`）、正确绿标（`text-ok`）
- 浅黄高亮块（`text-warn` 系）默认展示 `quiz.plainExplanation`，追加比喻列表；按钮「💬 还是有点绕？换个生活比喻」（加载中防连点）与「✅ 已搞懂，移出错题本」

### Level 4 · `FocusTimerBar.tsx` 专注伴学
- 紧凑胶囊条：15 / 25 分钟倒计时（暂停/重置），期间小状态提示「专注复习中 ✨」
- 结束或点「😌 休息一下」→ 柔和渐变「20 秒深呼吸弹窗」（呼吸动画圈 +「呼气… 吸气… 当下稳稳记住就好」），可随时关闭
- 放工作台顶部/角落，不遮挡主体操作

### Level 5 · 打磨与留档
- 375px 窄屏专项：内边距、按钮不换行错位、`break-words` 无横向滚动
- 每关截图留档（炫酷动效/解 Bug 瞬间），供天池帖使用；空状态与友好报错文案统一检查

## 5. 每关自检与提交

1. `npx tsc --noEmit && npm run build` 通过
2. `git status` 确认只改 `src/components/rookie/`、无 `.env`
3. 浏览器把按钮点一遍、F12 控制台无红字；**深空/浅色两主题各看一遍**；375px 窄屏看一遍
4. `git checkout dev && git pull origin dev` → `git checkout -b feat/rookie-<组件名>` → add/commit/push → PR 目标 `dev` @角色 A
5. 极端内容试一遍：超长 `back` 文本、空 `wrongItems`、空 `confusions`，布局不撑破、空状态不报错

## 6. 与 AI 协作的心法（沿蓝图思路）

- 先 Ask 问明白再 Agent 动手；Prompt 必带 `@src/types/deck.ts` `@src/mock/sampleDecks.ts` + 围栏句
- 不指望一次完美：先 60 分能跑 → 浏览器边点边提具体修改（「背面超 150 字加内部滚动」而非「改好看点」）→ 95 分细节
- 报错自救：复制完整红字 + 复现步骤给 AI，要求最小范围修复；解决不了带排查记录找角色 A
- Props 怎么传的、哪块是 AI 反复改出来的——Review 时能讲清楚，才是真的学会了