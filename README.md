# 碎片笔记 · 一键变闪卡与自测题

把散落的课堂笔记、复习提纲、课件 PDF，一键变成能翻、能测、能复盘的学习材料。

粘贴一段提纲、拍一张笔记照片、或丢进一份课件 PDF，AI 会一次性产出「概念摘要 + 易混点对比 + 记忆闪卡 + 随堂自测」四件套，帮你把碎片资料整理成真正能记住的知识。

## 核心体验

- **多源投喂**：粘贴文本、上传笔记照片（JPG/PNG）、课件 PDF，或一键填入内置示例零门槛体验
- **知识梳理**：自动提炼高频考点，左右对照表讲清「概念 A vs 概念 B」的判别边界
- **3D 记忆闪卡**：丝滑翻卡 + 键盘快捷键 + 掌握度标记，配轻量专注倒计时伴学
- **3 分钟随堂小测**：限时测验自动判分，答错自动归入错题本
- **大白话错题本**：每道错题附生活类比式原理解释，还能追问「换个比喻再讲一遍」

## 快速开始

```bash
npm install
npm run dev        # 打开 http://localhost:5173
```

> 注意：不要双击 `index.html` 直接打开（`file://` 协议下会白屏）。本项目需经开发服务器访问；预览打包产物用 `npm run build && npm run preview`。

内置计算机网络、高等数学、心理学三套完整示例牌组，无需配置任何密钥即可离线浏览。

> 当前进度：基础框架与数据契约已就绪（示例离线展示）；AI 多模态解析、测验引擎与交互 UI 正在开发中。

## 技术栈

React 18 + TypeScript + Vite · Tailwind CSS v4 · lucide-react · 浏览器 localStorage 持久化 · Serverless 转发层调用多模态大模型（API Key 不暴露在前端）

## 项目结构

| 目录 | 内容 |
|------|------|
| `src/types/deck.ts` | 全局数据契约 `StudyDeck`：概念、易混对比、闪卡、自测题的统一结构 |
| `src/mock/sampleDecks.ts` | 三套内置学科示例数据 |
| `src/api/` | AI 多模态解析与错题大白话接口 |
| `src/store/` | localStorage 持久化与状态管理 |
| `src/pages/` | 主工作台与测验引擎 |
| `src/components/core/` | 上传区、加载骨架屏、历史牌组抽屉 |
| `src/components/rookie/` | 独立 UI 组件：3D 闪卡、概念对比矩阵、错题本、专注计时 |

## 参与开发

1. 从 `dev` 切出功能分支：`git checkout -b feat/your-feature`
2. 组件一律通过 Props 接收 `StudyDeck` 数据，不要写死假数据；改契约需全队同步
3. 提交前自检：`npx tsc --noEmit && npm run build`，并确认改动范围在自己的目录内
4. 提 PR 合入 `dev`，联调稳定后由维护者发布到 `main`

## 环境变量

复制 `.env.example` 为 `.env` 并填入 `AI_API_KEY`（仅供服务端转发层使用）。`.env` 已被 gitignore，请勿提交真实密钥。