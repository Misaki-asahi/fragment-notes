# 碎片笔记 · 一键变闪卡与自测题（flashbird-notes）

Qoder 高校创造力大赛（StudyHack）参赛作品：把碎片笔记 / 课堂照片 / 课件 PDF 一键变成
概念摘要、易混点对比、3D 记忆闪卡、3 分钟自测与大白话错题本。

团队：仇梓源（A · 架构基建与带教）/ 席泽琛（B · 核心业务流与 AI 解析）/ 贾钧淋（C · UI 体验组件）

## 快速开始

```bash
npm install
npm run dev        # 本地预览 http://localhost:5173
```

提交前自检：

```bash
npx tsc --noEmit && npm run build
```

## 技术栈

React 18 + TypeScript + Vite · Tailwind CSS v4 · lucide-react · localStorage 持久化（阶段 2 接入）

## 目录所有权（物理隔离，防合并冲突）

| 目录 | Owner | 内容 |
|------|-------|------|
| `src/types/deck.ts` | 仇梓源 | 全局唯一数据契约 `StudyDeck`，改动需全队同步 |
| `src/mock/sampleDecks.ts` | 仇梓源 | 计网 / 高数 / 心理学 3 套内置示例 |
| `src/api/` | 席泽琛 | AI 多模态解析、错题大白话接口 |
| `src/store/` | 席泽琛 | localStorage 持久化与状态管理 |
| `src/pages/` | 席泽琛 | 主工作台路由与测验引擎 |
| `src/components/core/` | 席泽琛 | 上传区、加载骨架屏、历史牌组抽屉 |
| `src/components/rookie/` | 贾钧淋 | 四大独立 UI 组件沙盒（FlashCardDeck / ConceptMatrix / WrongBookView / FocusTimerBar） |

协作规则：日常开发从 `dev` 切 `feat/*` 分支，自检通过后提 PR 合入 `dev`，稳定后由仇梓源合入 `main` 发布。
组件一律通过 Props 接收 `StudyDeck` 数据，不要把假数据写死在组件里。

## 环境变量

复制 `.env.example` 为 `.env` 并填入 `AI_API_KEY`（仅后端转发层使用，前端不暴露密钥）。
`.env` 已被 gitignore，严禁提交真实密钥。