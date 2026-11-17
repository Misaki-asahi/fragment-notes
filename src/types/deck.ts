export interface StudyDeck {
  id: string;
  title: string;                  // 牌组标题，如 "计算机网络 · 传输层核心考点"
  subjectTag: string;             // 学科标签，如 "计算机" | "高数" | "心理学"
  createdAt: number;
  sourceSummary: string;          // 一句话总结本份资料的核心脉络

  concepts: {
    term: string;                 // 核心概念名称
    definition: string;           // 精准定义
    keyPoint: string;             // 考试怎么考 / 一句话记忆口诀
  }[];

  confusions: {
    topic: string;                // 易混主题，如 "TCP vs UDP"
    itemAName: string;
    itemAFeature: string;
    itemBName: string;
    itemBFeature: string;
    distinctionTip: string;       // 一眼区分诀窍
  }[];

  flashcards: {
    id: string;
    front: string;                // 正面问题 / 概念
    back: string;                 // 背面答案 / 推导
    difficulty: "easy" | "medium" | "hard";
    status: "unseen" | "review" | "mastered"; // UI 组件更新此状态
  }[];

  quizzes: {
    id: string;
    question: string;
    options: string[];            // 固定 4 个选项
    answerIndex: number;          // 0-3
    standardExplanation: string;  // 标准解析
    plainExplanation: string;     // 大白话原理解释（核心特色！）
  }[];
}