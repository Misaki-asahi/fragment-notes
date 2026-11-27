import type { StudyDeck } from "../../types/deck";

export interface SparkNote {
  id: string;
  content: string;
  aiTitle: string;
  tags: string[];
  cluster: string;
  clozeTerms: string[];
  question: string;
  plainExplanation: string;
  starred: boolean;
  createdAt: number;
  aiProcessing?: boolean;
  confusion?: StudyDeck["confusions"][number];
}

export interface SparkQuizCard {
  id: string;
  noteId: string;
  mode: "flip" | "cloze";
  cluster: string;
  frontQuestion: string;
  backAnswer: string;
  sourceExcerpt: string;
  clozeSentence: string;
  clozeTerms: string[];
  retryCount: number;
}

export interface RelatedMatch {
  note: SparkNote;
  score: number;
  reason: string;
  sharedTags: string[];
}

export interface HeatmapCell {
  dateKey: string;
  label: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const STORAGE_KEY = "sparknote:fragments:v1";
const DAY_MS = 86_400_000;

function daysAgo(days: number, hour = 14): number {
  const d = new Date();
  d.setHours(hour, 15, 0, 0);
  return d.getTime() - days * DAY_MS;
}

export const INITIAL_SPARK_NOTES: SparkNote[] = [
  {
    id: "sn-cn-handshake",
    content:
      "TCP 建立连接需要三次握手（SYN → SYN+ACK → ACK），核心目的不是走形式，而是让双方各自确认「自己发得出去、对方收得到，且自己也收得到」，同时防止已失效的旧连接请求突然复活造成服务端空等。",
    aiTitle: "三次握手本质是双向收发能力的最小确认闭环",
    tags: ["计算机网络", "TCP"],
    cluster: "计算机网络 · 传输层",
    clozeTerms: ["三次握手", "SYN+ACK", "旧连接请求"],
    question: "为什么 TCP 建立连接必须是三次握手，而不是两次？",
    plainExplanation:
      "就像两个人用对讲机试音：A 问「听得到吗？」、B 回「听得到，你呢？」、A 再回「我也听得到」。少第三句，B 永远不知道自己的麦克风是不是坏了。",
    starred: true,
    createdAt: daysAgo(0, 10),
  },
  {
    id: "sn-cn-tcp-udp",
    content:
      "传输层协议选型：TCP 面向连接、提供确认重传与字节流可靠交付（首部至少 20 字节），适合网页、邮件与文件；UDP 无连接、无拥塞控制且首部仅 8 字节，直播、语音通话和 DNS 查询都靠它换取极低延迟。",
    aiTitle: "TCP 像签收挂号信保稳，UDP 像发弹幕明信片拼快",
    tags: ["计算机网络", "TCP", "UDP"],
    cluster: "计算机网络 · 传输层",
    clozeTerms: ["20 字节", "8 字节", "极低延迟"],
    question: "实时视频直播和 DNS 查询为什么优先用 UDP 而不是 TCP？",
    plainExplanation:
      "看烟花时错过一朵就过去了，你不会让主办方把刚才那朵重放一遍——TCP 追求每帧必达反而会堵死后面的画面，UDP 丢一帧只闪一下却能一直流畅。",
    starred: false,
    createdAt: daysAgo(1, 16),
    confusion: {
      topic: "TCP vs UDP",
      itemAName: "TCP",
      itemAFeature: "面向连接、可靠交付（确认+重传）、滑动窗口控流、首部 20B 起，适合文件与网页。",
      itemBName: "UDP",
      itemBFeature: "无连接、尽最大努力交付、无拥塞控制、首部仅 8B，适合直播、语音与 DNS。",
      distinctionTip: "打电话先接通再说（TCP） vs 寄明信片扔出就走（UDP）。",
    },
  },
  {
    id: "sn-cn-flow-congestion",
    content:
      "滑动窗口里的流量控制（rwnd）管的是端到端——别把接收方缓冲区撑爆；拥塞控制（cwnd）管的是全局链路——别把整条网络马路堵死。实际发送窗口大小等于 min(rwnd, cwnd)，慢启动每个 RTT 指数翻倍直到 ssthresh。",
    aiTitle: "流量控制保护「收件人」，拥塞控制保护「整条路网」",
    tags: ["计算机网络", "拥塞控制"],
    cluster: "计算机网络 · 传输层",
    clozeTerms: ["流量控制", "拥塞控制", "min(rwnd, cwnd)"],
    question: "流量控制（rwnd）与拥塞控制（cwnd）在保护对象上有何本质区别？",
    plainExplanation:
      "你给朋友寄零食：朋友说「我家柜子只能再放 3 箱」叫流量控制；高速路上交警限流防大堵车叫拥塞控制。最终发几箱，得同时听这两者里更小的那个。",
    starred: true,
    createdAt: daysAgo(2, 20),
    confusion: {
      topic: "流量控制 vs 拥塞控制",
      itemAName: "流量控制 (rwnd)",
      itemAFeature: "端到端问题：接收方通告剩余缓存，防止发送方把接收方撑死。",
      itemBName: "拥塞控制 (cwnd)",
      itemBFeature: "全局问题：探测网络过载并限流，包含慢启动、拥塞避免、快重传、快恢复。",
      distinctionTip: "怕「收件人爆仓」看 rwnd，怕「高速公路瘫痪」看 cwnd。",
    },
  },
  {
    id: "sn-math-cont-diff",
    content:
      "高等数学高频陷阱：在一点处可导必然连续（光滑一定不断开），但连续不一定可导。最经典的反例是 y = |x| 在 x = 0 处：左右极限都等于 0 所以连续，但左导数为 -1、右导数为 +1，尖角处画不出唯一切线。",
    aiTitle: "可导必连续，连续未必可导（反例：|x| 在原点有尖角）",
    tags: ["高数", "微积分"],
    cluster: "高等数学 · 极限与导数",
    clozeTerms: ["可导", "连续", "y = |x|"],
    question: "为什么 y = |x| 在 x = 0 处连续却不可导？",
    plainExplanation:
      "「连续」是普通入场券，「可导」是光滑无尖角的 VIP 卡。|x| 的图像在原点是个 V 字急转弯，路没断（连续），但谷底方向瞬间反转，根本找不到唯一切线。",
    starred: true,
    createdAt: daysAgo(1, 11),
    confusion: {
      topic: "连续 vs 可导",
      itemAName: "连续",
      itemAFeature: "图像不断笔，条件弱：lim f(x) = f(x0)，允许出现尖角。",
      itemBName: "可导",
      itemBFeature: "必须光滑到有唯一切线，条件强：左右导数存在且相等。",
      distinctionTip: "VIP 会员（可导）一定能入场（连续），能入场未必有 VIP。",
    },
  },
  {
    id: "sn-math-limits",
    content:
      "计算未定式极限的两个核心抓手：遇到 0/0 型且含 sin(u)/u（u → 0）直接化为 1；遇到 1^∞ 型优先凑第二个重要极限 lim(1 + 小量)^(1/小量) = e。常用等价无穷小（如 1 - cos x ~ x²/2）仅能替换乘除因子。",
    aiTitle: "sin(u)/u 归 1、(1+u)^(1/u) 归 e，等价替换只换乘除项",
    tags: ["高数", "极限"],
    cluster: "高等数学 · 极限与导数",
    clozeTerms: ["x²/2", "1^∞", "乘除因子"],
    question: "使用等价无穷小替换极限式时最容易踩的坑是什么？",
    plainExplanation:
      "等价无穷小就像双胞胎替身，在乘法和除法里可以放心代班；但在加减法里两个几乎相等的数一相减会互相抵消，替身精度不够就会算错。",
    starred: false,
    createdAt: daysAgo(4, 15),
  },
  {
    id: "sn-psy-ebbinghaus",
    content:
      "艾宾浩斯遗忘曲线呈「先快后慢」的负加速形态：新学内容在最初 20 分钟到 1 天内遗忘最快，随后趋于平缓。因此当天复习加上间隔重复（1 天、3 天、7 天逐步拉长间隔），远胜过考前通宵突击。",
    aiTitle: "遗忘先快后慢：刚学完的一天是黄金抢救期",
    tags: ["心理学", "记忆方法"],
    cluster: "心理学 · 记忆与学习",
    clozeTerms: ["先快后慢", "间隔重复"],
    question: "艾宾浩斯遗忘曲线对复习时间安排有什么核心启示？",
    plainExplanation:
      "刚倒进沙漏的沙子最上层漏得最凶——学完当晚花 5 分钟扶一把（当天回顾 + 间隔拉长），比考前沙子漏光再从头铲划算得多。",
    starred: false,
    createdAt: daysAgo(3, 19),
  },
  {
    id: "sn-psy-reinforce",
    content:
      "斯金纳操作性条件作用最易混点：负强化 ≠ 惩罚。负强化是通过撤销厌恶刺激来「增加」目标行为（如考前十名免做家务）；惩罚是施加厌恶或撤走愉快刺激来「减少」行为。",
    aiTitle: "判断负强化 vs 惩罚：先看行为变多还是变少",
    tags: ["心理学", "条件作用"],
    cluster: "心理学 · 记忆与学习",
    clozeTerms: ["负强化", "撤销厌恶刺激", "增加"],
    question: "「写完作业就免除洗碗」属于负强化还是惩罚？如何两步秒判？",
    plainExplanation:
      "两步走：① 家长想让写作业变多还是变少？变多＝强化；② 给糖还是松绑？免除洗碗是松绑＝负。所以负强化是「松绑鼓励」，跟惩罚完全相反。",
    starred: true,
    createdAt: daysAgo(5, 14),
    confusion: {
      topic: "负强化 vs 惩罚",
      itemAName: "负强化",
      itemAFeature: "撤掉难受的事，让好行为出现概率「上升」（如系安全带停报警声）。",
      itemBName: "惩罚",
      itemBFeature: "给难受的事或没收奖励，让坏行为出现概率「下降」。",
      distinctionTip: "强化一定让行为变多，惩罚一定让行为变少；正=给，负=撤。",
    },
  },
  {
    id: "sn-psy-chunking",
    content:
      "短时记忆容量经典结论是 7±2 个组块（Miller, 1956），纯工作记忆核心仅约 4 个。通过组块化（Chunking），把散装数字或字母编成有意义整体（如 19491001 记成开国大典），能成倍放大单次记忆承载量。",
    aiTitle: "短时记忆只有约 7 个格子，靠组块化打包成倍扩容",
    tags: ["心理学", "工作记忆"],
    cluster: "心理学 · 记忆与学习",
    clozeTerms: ["7±2 个组块", "组块化"],
    question: "什么是短时记忆的「组块化（Chunking）」策略？",
    plainExplanation:
      "工作记忆像只有 7 个格子的收纳盒：散装字母一个占一格瞬间爆满；把 un-believ-able 打包成 3 个熟悉零件，只占 3 格还能装更多。",
    starred: false,
    createdAt: daysAgo(8, 12),
  },
  {
    id: "sn-chem-sn1-sn2",
    content:
      "有机化学亲核取代对照：SN2 是一步协同反应（亲核试剂从背面进攻），速率同时取决于底物与试剂浓度，立体化学发生构型翻转，位阻越小（伯卤代烷）越快；SN1 分两步先生成碳正离子中间体，发生外消旋化，叔卤代烷最稳定最快。",
    aiTitle: "SN2 一步背面进攻看位阻（构型翻转）；SN1 两步走碳正离子（外消旋）",
    tags: ["有机化学", "反应机理"],
    cluster: "有机化学 · 反应机理",
    clozeTerms: ["构型翻转", "碳正离子", "外消旋化"],
    question: "SN1 与 SN2 反应在反应步数、立体化学和底物活性顺序上有何区别？",
    plainExplanation:
      "SN2 像挤公交「你推我走」：新乘客从后门直接把原乘客顶出去，伞被风吹反（构型翻转），路越窄（位阻小）越好挤；SN1 像先等座位腾空（碳正离子平面），新乘客左右都能坐（外消旋）。",
    starred: false,
    createdAt: daysAgo(6, 17),
    confusion: {
      topic: "SN1 vs SN2 亲核取代",
      itemAName: "SN1（单分子）",
      itemAFeature: "两步反应、经平面碳正离子、构型外消旋化、活性：叔 > 仲 > 伯。",
      itemBName: "SN2（双分子）",
      itemBFeature: "一步协同、背面进攻、构型完全翻转（瓦尔登翻转）、活性：甲基 > 伯 > 仲。",
      distinctionTip: "看「2」记双分子同时碰撞：一步到位、背面翻转、怕拥挤（位阻）。",
    },
  },
  {
    id: "sn-en-tense",
    content:
      "英语时态核心辨析：一般过去时（Simple Past）只交代动作发生在过去某个明确时间点，与现在无关（I lost my key yesterday）；现在完成时（Present Perfect）强调过去动作对「现在」造成的结果或一直持续至今（I have lost my key，说明现在还进不了门）。",
    aiTitle: "一般过去时看「过去时间点」，现在完成时看「对现在的影响」",
    tags: ["英语语法", "时态辨析"],
    cluster: "英语语法 · 时态与从句",
    clozeTerms: ["Simple Past", "Present Perfect", "对「现在」造成的结果"],
    question: "「I lost my key yesterday」与「I have lost my key」在语境与核心焦点上有何区别？",
    plainExplanation:
      "一般过去时像「历史新闻」：只说昨天丢过钥匙这件事（说不定今天已经找回来了）；现在完成时像「当前告警灯」：钥匙丢了的结果一直延续到现在，此刻我正蹲在门外进不去屋。",
    starred: false,
    createdAt: daysAgo(9, 21),
    confusion: {
      topic: "一般过去时 vs 现在完成时",
      itemAName: "一般过去时 (did)",
      itemAFeature: "锚定过去某一具体时间点（yesterday / in 2020），动作与现在状态脱钩。",
      itemBName: "现在完成时 (have/has done)",
      itemBFeature: "不带具体过去时间点，重点强调动作对「此刻」留下的结果、经验或持续状态。",
      distinctionTip: "句尾出现 yesterday / last week 这类明确过去时间状语时，铁定选一般过去时。",
    },
  },
];

export const DEMO_SNIPPETS: string[] = [
  "操作系统面试必背：进程是资源分配的基本单位，拥有独立虚拟地址空间；线程是 CPU 调度的基本单位，共享同一进程的地址空间和打开文件，因此上下文切换开销远小于进程。 #计算机网络 #操作系统",
  "有机化学马氏规则（Markovnikov）：不对称烯烃与 HX 发生亲电加成时，氢原子加到含氢较多的双键碳上，本质是因为这样生成的中间体碳正离子取代基更多、超共轭效应更稳。 #有机化学 #反应机理",
  "英语定语从句高频易错点：非限制性定语从句（逗号隔开）与介词后只能用 which/whom 而不能用 that；先行词同时包含人和物、或被最高级/序数词/only 修饰时则优先用 that。 #英语语法 #定语从句",
  "高数洛必达法则使用前提：必须是 0/0 或 ∞/∞ 型未定式，且分子分母在去心邻域内均可导、求导后极限存在（或为无穷）。遇到能用等价无穷小先化简的乘除因子，先化简再洛必达更不容易算死。 #高数 #微积分",
  "心理学系列位置效应：回忆一长串材料时，开头（首因效应，已进入长时记忆）和结尾（近因效应，仍留在短时记忆）记得最牢，中间最容易忘。背书可以把硬骨头放在开头和收尾时段。 #心理学 #记忆方法",
];

const CLUSTER_RULES: { keywords: string[]; cluster: string; defaultTag: string }[] = [
  {
    keywords: ["tcp", "udp", "窗口", "握手", "拥塞", "进程", "线程", "网络", "http", "操作系统", "cpu"],
    cluster: "计算机网络 · 传输层",
    defaultTag: "计算机网络",
  },
  {
    keywords: ["极限", "导数", "连续", "可导", "洛必达", "微积分", "无穷小", "高数", "函数"],
    cluster: "高等数学 · 极限与导数",
    defaultTag: "高数",
  },
  {
    keywords: ["记忆", "遗忘", "强化", "惩罚", "条件作用", "效应", "组块", "心理"],
    cluster: "心理学 · 记忆与学习",
    defaultTag: "心理学",
  },
  {
    keywords: ["烯烃", "亲核", "亲电", "碳正离子", "sn1", "sn2", "化学", "构型", "马氏"],
    cluster: "有机化学 · 反应机理",
    defaultTag: "有机化学",
  },
  {
    keywords: ["英语", "时态", "定语从句", "虚拟语气", "从句", "语法", "which", "that", "perfect", "past", "tense"],
    cluster: "英语语法 · 时态与从句",
    defaultTag: "英语语法",
  },
];

export interface TagTreeNode {
  tag: string;
  count: number;
  children: { tag: string; count: number }[];
}

const PARENT_CHILD_TAGS: Record<string, string[]> = {
  高数: ["极限", "微积分", "导数"],
  计算机网络: ["TCP", "UDP", "拥塞控制", "操作系统"],
  心理学: ["记忆方法", "条件作用", "工作记忆"],
  有机化学: ["反应机理"],
  英语语法: ["时态辨析", "定语从句", "虚拟语气"],
};

function sanitizeNoteText(text: string): string {
  return text
    .replace(/sin□\/□/g, "sin(u)/u")
    .replace(/□→0/g, "u → 0")
    .replace(/□/g, "u")
    .replace(/x₀/g, "x0")
    .replace(/₀/g, "0")
    .replace(/₁/g, "1")
    .replace(/₂/g, "2");
}

function extractFullConclusion(cleanBody: string): string {
  const firstSentence = cleanBody
    .split(/[。！？\n]/)
    .map((s) => s.trim())
    .find((s) => s.length >= 6);
  return firstSentence || cleanBody;
}

function restoreTruncatedConclusion(aiTitle: string, content: string): string {
  const trimmedTitle = aiTitle.trim();
  const trimmedContent = content.trim();
  if (!trimmedTitle || !trimmedContent) return trimmedTitle;
  if (trimmedTitle.endsWith("…") || trimmedTitle.endsWith("...")) {
    const prefix = trimmedTitle.replace(/(?:…|\.{3})$/, "").trim();
    if (prefix.length >= 6 && trimmedContent.startsWith(prefix)) {
      return extractFullConclusion(trimmedContent);
    }
  }
  return trimmedTitle;
}

function sanitizeNote(note: SparkNote): SparkNote {
  const content = sanitizeNoteText(note.content);
  const rawTitle = sanitizeNoteText(note.aiTitle);
  const aiTitle = restoreTruncatedConclusion(rawTitle, content);
  let plainExplanation = sanitizeNoteText(note.plainExplanation);
  if (
    aiTitle !== rawTitle &&
    plainExplanation.includes("用自己的话把原句逻辑复述一遍：")
  ) {
    plainExplanation = plainExplanation.replace(
      /用自己的话把原句逻辑复述一遍：.*$/,
      `用自己的话把原句逻辑复述一遍：${aiTitle}。`,
    );
  }
  return {
    ...note,
    content,
    aiTitle,
    question: sanitizeNoteText(note.question),
    plainExplanation,
    clozeTerms: Array.isArray(note.clozeTerms) ? note.clozeTerms.map(sanitizeNoteText) : [],
    confusion: note.confusion
      ? {
          topic: sanitizeNoteText(note.confusion.topic),
          itemAName: sanitizeNoteText(note.confusion.itemAName),
          itemAFeature: sanitizeNoteText(note.confusion.itemAFeature),
          itemBName: sanitizeNoteText(note.confusion.itemBName),
          itemBFeature: sanitizeNoteText(note.confusion.itemBFeature),
          distinctionTip: sanitizeNoteText(note.confusion.distinctionTip),
        }
      : undefined,
  };
}

export function buildTagTree(notes: SparkNote[]): { tree: TagTreeNode[]; totalTagCount: number } {
  const noteIdsByTag = new Map<string, Set<string>>();
  for (const note of notes) {
    for (const tag of note.tags) {
      const set = noteIdsByTag.get(tag) ?? new Set<string>();
      set.add(note.id);
      noteIdsByTag.set(tag, set);
    }
  }

  const assignedChildren = new Set<string>();
  const nodes: TagTreeNode[] = [];

  for (const [parent, childDefs] of Object.entries(PARENT_CHILD_TAGS)) {
    const parentIds = new Set(noteIdsByTag.get(parent) ?? []);
    const children: { tag: string; count: number }[] = [];
    for (const child of childDefs) {
      const childIds = noteIdsByTag.get(child);
      if (childIds && childIds.size > 0) {
        assignedChildren.add(child);
        children.push({ tag: child, count: childIds.size });
        for (const id of childIds) parentIds.add(id);
      }
    }
    if (parentIds.size > 0) {
      children.sort((a, b) => b.count - a.count);
      nodes.push({ tag: parent, count: parentIds.size, children });
    }
  }

  for (const [tag, ids] of noteIdsByTag.entries()) {
    if (Object.hasOwn(PARENT_CHILD_TAGS, tag) || assignedChildren.has(tag)) continue;
    nodes.push({ tag, count: ids.size, children: [] });
  }

  nodes.sort((a, b) => b.count - a.count);
  return { tree: nodes, totalTagCount: noteIdsByTag.size };
}

export function noteMatchesTagFilter(
  note: SparkNote,
  selectedTag: string,
  tree: TagTreeNode[],
): boolean {
  if (note.tags.includes(selectedTag)) return true;
  const parentNode = tree.find((n) => n.tag === selectedTag);
  if (!parentNode || parentNode.children.length === 0) return false;
  return parentNode.children.some((c) => note.tags.includes(c.tag));
}

function isLegacyJapaneseNote(item: SparkNote): boolean {
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const cluster = typeof item.cluster === "string" ? item.cluster : "";
  const text = `${item.aiTitle} ${item.content} ${cluster}`;
  return (
    /[\u3040-\u30ff]/.test(text) ||
    text.includes("日语") ||
    tags.some((t) => t.includes("日语") || t.includes("助词") || t === "高频句型")
  );
}

export function loadSparkNotes(): SparkNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_SPARK_NOTES;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_SPARK_NOTES;
    const valid = parsed.filter(
      (item): item is SparkNote =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as SparkNote).id === "string" &&
        typeof (item as SparkNote).content === "string" &&
        typeof (item as SparkNote).aiTitle === "string",
    );
    if (valid.length === 0) return INITIAL_SPARK_NOTES;
    const enSeed = INITIAL_SPARK_NOTES.find((n) => n.id === "sn-en-tense");
    let hasEnSeed = valid.some((n) => n.id === "sn-en-tense");
    const enDemoBody = DEMO_SNIPPETS[2].replace(/#([A-Za-z0-9_\u4e00-\u9fa5·-]{1,20})/g, "").trim();
    let hasEnDemo = valid.some((n) => n.content === enDemoBody);
    let migrated = false;
    const result: SparkNote[] = [];

    for (const item of valid) {
      if (item.id === "sn-jp-wa-ga") {
        migrated = true;
        if (!hasEnSeed && enSeed) {
          result.push(sanitizeNote({ ...enSeed, starred: Boolean(item.starred) }));
          hasEnSeed = true;
        }
        continue;
      }
      if (isLegacyJapaneseNote(item)) {
        migrated = true;
        if (!hasEnDemo) {
          const migratedDemo = enrichDraftToNote(DEMO_SNIPPETS[2], item.id);
          result.push(
            sanitizeNote({
              ...migratedDemo,
              aiProcessing: false,
              createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
              starred: Boolean(item.starred),
            }),
          );
          hasEnDemo = true;
        }
        continue;
      }
      const cleaned = sanitizeNote(item);
      if (
        cleaned.content !== item.content ||
        cleaned.aiTitle !== item.aiTitle ||
        cleaned.plainExplanation !== item.plainExplanation
      ) {
        migrated = true;
      }
      result.push(cleaned);
    }

    if (result.length === 0) return INITIAL_SPARK_NOTES;
    if (migrated) saveSparkNotes(result);
    return result;
  } catch {
    return INITIAL_SPARK_NOTES;
  }
}

export function saveSparkNotes(notes: SparkNote[]): boolean {
  try {
    const clean = notes.map(({ aiProcessing: _omit, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    return true;
  } catch {
    return false;
  }
}

export function extractHashtags(text: string): string[] {
  const matches = text.match(/#([A-Za-z0-9_\u4e00-\u9fa5·-]{1,20})/g) ?? [];
  const unique = new Set(matches.map((m) => m.slice(1)));
  return Array.from(unique);
}

function pickClozeTerms(body: string): string[] {
  const candidates: string[] = [];
  // 1) 引号或书名号内关键短语
  const quoted = body.match(/[「『"]([^「『"」』]{2,12})[」』"]/g) ?? [];
  for (const q of quoted) {
    const inner = q.slice(1, -1).trim();
    if (inner.length >= 2 && body.includes(inner) && !candidates.includes(inner)) {
      candidates.push(inner);
    }
  }
  // 2) 英文/数字术语（如 TCP, SN2, CPU, 0/0）
  const terms = body.match(/\b[A-Za-z][A-Za-z0-9_/-]{1,12}\b/g) ?? [];
  for (const t of terms) {
    if (body.includes(t) && !candidates.includes(t)) {
      candidates.push(t);
    }
  }
  // 3) 常见中文高频概念词兜底
  const domainTerms = [
    "资源分配",
    "调度",
    "上下文切换",
    "碳正离子",
    "亲电加成",
    "超共轭效应",
    "未定式",
    "等价无穷小",
    "首因效应",
    "近因效应",
    "长时记忆",
    "短时记忆",
    "非限制性定语从句",
    "先行词",
    "虚拟语气",
    "三次握手",
    "流量控制",
    "拥塞控制",
    "构型翻转",
  ];
  for (const dt of domainTerms) {
    if (body.includes(dt) && !candidates.includes(dt)) {
      candidates.push(dt);
    }
  }
  // 4) 若仍不足，从逗号/句号前抽取 2~5 字关键词
  if (candidates.length === 0) {
    const zhTokens = body.match(/[\u4e00-\u9fa5]{3,6}/g) ?? [];
    for (const z of zhTokens) {
      if (!candidates.includes(z)) candidates.push(z);
      if (candidates.length >= 2) break;
    }
  }
  return candidates.slice(0, 3);
}

export function enrichDraftToNote(rawText: string, id = `sn-${Date.now()}`): SparkNote {
  const explicitTags = extractHashtags(rawText);
  const cleanBody = rawText.replace(/#([A-Za-z0-9_\u4e00-\u9fa5·-]{1,20})/g, "").trim() || rawText.trim();
  const lower = rawText.toLowerCase();

  let cluster = "综合理解 · 随手记";
  let fallbackTag = "知识碎片";
  for (const rule of CLUSTER_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      cluster = rule.cluster;
      fallbackTag = rule.defaultTag;
      break;
    }
  }

  const tags = explicitTags.length > 0 ? explicitTags : [fallbackTag];
  const clozeTerms = pickClozeTerms(cleanBody);

  // 生成完整的一句话结论，长句不截断
  const aiTitle = extractFullConclusion(cleanBody);

  const anchor = clozeTerms[0] ?? tags[0] ?? "这段笔记";
  const question = `请结合核心要点解释「${anchor}」在这条笔记中的关键作用或判别边界？`;
  const plainExplanation = `核心记忆锚点是「${clozeTerms.join(" / ") || anchor}」。用自己的话把原句逻辑复述一遍：${aiTitle}。`;

  return {
    id,
    content: cleanBody,
    aiTitle,
    tags,
    cluster,
    clozeTerms,
    question,
    plainExplanation,
    starred: false,
    createdAt: Date.now(),
    aiProcessing: true,
  };
}

export function deckToSparkNotes(deck: StudyDeck): SparkNote[] {
  const now = Date.now();
  const cluster = deck.title || deck.subjectTag || "AI 资料提炼";
  const notes: SparkNote[] = deck.concepts.slice(0, 4).map((c, idx) => {
    const matchedQuiz = deck.quizzes[idx];
    const matchedConf = deck.confusions[idx];
    return {
      id: `${deck.id}-sn-${idx}-${now}`,
      content: `${c.term}：${c.definition}（${c.keyPoint}）`,
      aiTitle: c.keyPoint ? `${c.term} · ${c.keyPoint}` : c.term,
      tags: [deck.subjectTag, c.term.slice(0, 10)],
      cluster,
      clozeTerms: [c.term].filter(Boolean),
      question: matchedQuiz ? matchedQuiz.question : `「${c.term}」的核心定义与考点是什么？`,
      plainExplanation: matchedQuiz ? matchedQuiz.plainExplanation : `${c.definition} —— 记住口诀：${c.keyPoint}`,
      starred: idx === 0,
      createdAt: now - idx * 1000,
      confusion: matchedConf,
    };
  });
  return notes.length > 0 ? notes : [enrichDraftToNote(deck.sourceSummary || deck.title)];
}

function extractMatchTokens(text: string): string[] {
  const tokens = new Set<string>();
  const lower = text.toLowerCase();
  for (const w of lower.match(/[a-z0-9_+-]{2,}/g) ?? []) {
    tokens.add(w);
  }
  const zhChunks = text.match(/[\u4e00-\u9fa5]{2,}/g) ?? [];
  for (const chunk of zhChunks) {
    for (let i = 0; i <= chunk.length - 2; i += 1) {
      tokens.add(chunk.slice(i, i + 2));
    }
  }
  return Array.from(tokens);
}

const DOMAIN_BRIDGES: string[][] = [
  ["进程", "线程", "tcp", "udp", "窗口", "握手", "拥塞", "网络", "缓冲", "切换", "调度"],
  ["极限", "导数", "连续", "可导", "洛必达", "微积分", "无穷", "切线", "未定"],
  ["记忆", "遗忘", "强化", "惩罚", "组块", "效应", "学习", "复述", "刺激"],
  ["化学", "碳正离子", "亲核", "亲电", "烯烃", "构型", "取代", "加成", "位阻"],
  ["英语", "时态", "定语从句", "虚拟语气", "先行词", "完成时", "过去时", "which", "that", "语法"],
];

export function findRelatedNotes(
  queryText: string,
  activeNote: SparkNote | null,
  allNotes: SparkNote[],
): RelatedMatch[] {
  const sourceText = queryText.trim()
    ? queryText
    : activeNote
      ? `${activeNote.aiTitle} ${activeNote.content} ${activeNote.tags.join(" ")}`
      : "";

  if (!sourceText) {
    return allNotes.slice(0, 3).map((note, idx) => ({
      note,
      score: 86 - idx * 7,
      reason: `高频专题「${note.cluster}」推荐串联`,
      sharedTags: note.tags.slice(0, 2),
    }));
  }

  const queryTags = extractHashtags(sourceText);
  const queryTokens = extractMatchTokens(sourceText);
  const queryLower = sourceText.toLowerCase();
  const activeCluster = activeNote?.cluster;

  const scored: RelatedMatch[] = [];

  for (const note of allNotes) {
    if (activeNote && note.id === activeNote.id && !queryText.trim()) continue;
    if (queryText.trim() && note.content === queryText.trim()) continue;

    const noteCombined = `${note.aiTitle} ${note.content} ${note.tags.join(" ")} ${note.cluster}`;
    const noteTokens = new Set(extractMatchTokens(noteCombined));
    const sharedTags = note.tags.filter(
      (t) =>
        queryTags.some((qt) => qt.toLowerCase() === t.toLowerCase()) ||
        (activeNote && activeNote.tags.includes(t)) ||
        queryLower.includes(t.toLowerCase()),
    );

    const overlapWords: string[] = [];
    for (const tk of queryTokens) {
      if (noteTokens.has(tk) && !overlapWords.includes(tk)) {
        overlapWords.push(tk);
      }
    }

    let domainBoost = 0;
    for (const group of DOMAIN_BRIDGES) {
      const qHits = group.filter((k) => queryLower.includes(k)).length;
      const nHits = group.filter((k) => noteCombined.toLowerCase().includes(k)).length;
      if (qHits > 0 && nHits > 0) domainBoost += Math.min(qHits, nHits) * 8;
    }

    const clusterMatch = activeCluster && note.cluster === activeCluster ? 18 : 0;
    const rawScore = sharedTags.length * 22 + overlapWords.length * 7 + domainBoost + clusterMatch;

    if (rawScore > 0) {
      const score = Math.min(97, Math.max(58, 52 + Math.round(rawScore * 0.72)));
      let reason = "";
      if (sharedTags.length > 0 && overlapWords.length > 0) {
        reason = `同属 #${sharedTags[0]} · 共现「${overlapWords.slice(0, 2).join(" / ")}」`;
      } else if (sharedTags.length > 0) {
        reason = `共现标签 #${sharedTags.join(" #")}`;
      } else if (overlapWords.length > 0) {
        reason = `语义锚点「${overlapWords.slice(0, 2).join(" / ")}」相近`;
      } else if (clusterMatch > 0) {
        reason = `同属「${note.cluster}」专题脉络`;
      } else {
        reason = `学科语义桥接（${note.cluster.split(" · ")[0]}）`;
      }
      scored.push({ note, score, reason, sharedTags });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return allNotes
      .filter((n) => !activeNote || n.id !== activeNote.id)
      .slice(0, 3)
      .map((note, idx) => ({
        note,
        score: 72 - idx * 6,
        reason: `跨学科记忆对比 · ${note.cluster}`,
        sharedTags: note.tags.slice(0, 1),
      }));
  }

  return scored.slice(0, 4);
}

export function buildHeatmapData(notes: SparkNote[]): HeatmapCell[] {
  const countByDay = new Map<string, number>();
  for (const n of notes) {
    const d = new Date(n.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  const cells: HeatmapCell[] = [];
  const totalDays = 84; // 12 周 × 7 天
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = totalDays - 1; i >= 0; i -= 1) {
    const dt = new Date(today.getTime() - i * DAY_MS);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const noteCount = countByDay.get(key) ?? 0;
    // 为前 11 周叠加稳定的伪随机历史活跃基底，让 12 周矩阵一眼饱满真实
    const seed = (dt.getDate() * 17 + (dt.getMonth() + 1) * 31 + i * 7) % 11;
    const baseline = i === 0 ? 0 : seed > 8 ? 2 : seed > 5 ? 1 : 0;
    const count = noteCount > 0 ? noteCount + baseline : baseline;
    const level: 0 | 1 | 2 | 3 | 4 =
      count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4;
    cells.push({
      dateKey: key,
      label: `${dt.getMonth() + 1}月${dt.getDate()}日`,
      count,
      level,
    });
  }
  return cells;
}

export function buildQuizQueue(notes: SparkNote[], filterCluster?: string | null): SparkQuizCard[] {
  const pool = filterCluster ? notes.filter((n) => n.cluster === filterCluster) : notes;
  const target = pool.length > 0 ? pool : notes;
  return target.map((note, idx) => {
    const hasCloze = note.clozeTerms.some((t) => note.content.includes(t));
    // 交替生成 3D 概念卡与高亮挖空卡，确保每次开测都能体验两种形式
    const mode: "flip" | "cloze" = idx % 2 === 1 && hasCloze ? "cloze" : "flip";
    return {
      id: `quiz-${note.id}-${mode}`,
      noteId: note.id,
      mode,
      cluster: note.cluster,
      frontQuestion: note.question,
      backAnswer: note.plainExplanation,
      sourceExcerpt: note.aiTitle,
      clozeSentence: note.content,
      clozeTerms: note.clozeTerms,
      retryCount: 0,
    };
  });
}

export function buildSingleNoteQuiz(note: SparkNote): SparkQuizCard[] {
  const cards: SparkQuizCard[] = [
    {
      id: `quiz-${note.id}-flip-${Date.now()}`,
      noteId: note.id,
      mode: "flip",
      cluster: note.cluster,
      frontQuestion: note.question,
      backAnswer: note.plainExplanation,
      sourceExcerpt: note.aiTitle,
      clozeSentence: note.content,
      clozeTerms: note.clozeTerms,
      retryCount: 0,
    },
  ];
  if (note.clozeTerms.some((t) => note.content.includes(t))) {
    cards.push({
      id: `quiz-${note.id}-cloze-${Date.now()}`,
      noteId: note.id,
      mode: "cloze",
      cluster: note.cluster,
      frontQuestion: note.question,
      backAnswer: note.plainExplanation,
      sourceExcerpt: note.aiTitle,
      clozeSentence: note.content,
      clozeTerms: note.clozeTerms,
      retryCount: 0,
    });
  }
  return cards;
}

export function getFallbackAnalogy(noteTitle: string, existingCount: number): string {
  const bank = [
    `换个角度理解「${noteTitle}」：就像收拾房间时先把高频用物贴标签放桌边，真正考验的不是堆多少，而是要用的那一秒能不能条件反射抽出来。`,
    `再换个生活画面：它好比厨房备菜——先理清「谁先下锅、谁怕火候过头」的边界，正式炒菜（做题）时自然不会手忙脚乱。`,
    `记这个锚点：把它当成地铁换乘站牌，只要记住关键换乘逻辑，中间每站细节自然就能推出来。`,
  ];
  return bank[existingCount % bank.length];
}

export interface TextSegment {
  text: string;
  isCloze: boolean;
  termIndex: number;
}

/** 按术语列表将文本拆分为普通片段与挖空片段，保持原句顺序 */
export function segmentByTerms(text: string, terms: string[]): TextSegment[] {
  const validTerms = Array.from(new Set(terms.filter((t) => t.trim().length > 0 && text.includes(t))))
    .sort((a, b) => b.length - a.length);
  if (validTerms.length === 0) {
    return [{ text, isCloze: false, termIndex: -1 }];
  }

  const escaped = validTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "g");
  const segments: TextSegment[] = [];
  let cursor = 0;
  let termIdx = 0;

  for (const match of text.matchAll(regex)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), isCloze: false, termIndex: -1 });
    }
    segments.push({ text: match[0], isCloze: true, termIndex: termIdx });
    termIdx += 1;
    cursor = start + match[0].length;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), isCloze: false, termIndex: -1 });
  }
  return segments;
}
