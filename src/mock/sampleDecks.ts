import type { StudyDeck } from "../types/deck";

const createdAt = Date.parse("2026-11-17T08:00:00+08:00");

export const sampleDecks: StudyDeck[] = [
  {
    id: "deck-cn-transport",
    title: "计算机网络 · 传输层核心考点",
    subjectTag: "计算机",
    createdAt,
    sourceSummary:
      "传输层两大协议 TCP 与 UDP 的取舍，围绕「可靠传输怎么做」展开：握手建连、滑动窗口控流量、拥塞控制保网络。",

    concepts: [
      {
        term: "TCP 三次握手",
        definition:
          "建立 TCP 连接时，客户端先发 SYN，服务端回 SYN+ACK，客户端再回 ACK，共三次报文交换后连接建立。",
        keyPoint: "口诀：「你听得到吗？听得到，你呢？我也听得到」——三次才能双向确认收发能力。",
      },
      {
        term: "UDP 用户数据报协议",
        definition:
          "无连接、不保证可靠交付、没有拥塞控制的传输层协议，首部仅 8 字节，支持一对多广播与组播。",
        keyPoint: "考点：直播、DNS、语音通话为什么选 UDP——要快不要稳，丢了就丢了。",
      },
      {
        term: "滑动窗口",
        definition:
          "接收方通过通告窗口（rwnd）告诉发送方自己还能接收多少数据，发送方据此限制未确认数据量，实现流量控制。",
        keyPoint: "流量控制 = 别把「接收方」撑死；窗口为 0 时发送方停发并定期探测。",
      },
      {
        term: "拥塞控制",
        definition:
          "防止过多数据注入网络导致路由器过载的全局性控制，包含慢启动、拥塞避免、快重传、快恢复四个算法。",
        keyPoint: "拥塞控制 = 别把「网络马路」堵死；慢启动是指数涨，拥塞避免是线性涨。",
      },
    ],

    confusions: [
      {
        topic: "TCP vs UDP",
        itemAName: "TCP",
        itemAFeature:
          "面向连接、可靠交付（确认+重传）、有流量/拥塞控制、字节流、首部 20 字节起，适合文件传输、网页、邮件。",
        itemBName: "UDP",
        itemBFeature:
          "无连接、尽最大努力交付、无拥塞控制、保留报文边界、首部 8 字节，适合直播、视频通话、DNS 查询。",
        distinctionTip:
          "一句话：TCP 是打电话（先接通再说话，说一句确认一句），UDP 是寄明信片（扔出去就不管，快但可能丢）。",
      },
      {
        topic: "流量控制 vs 拥塞控制",
        itemAName: "流量控制",
        itemAFeature:
          "端到端问题：接收方处理能力有限，用接收窗口 rwnd 限制发送方速度，保护的是「对方」。",
        itemBName: "拥塞控制",
        itemBFeature:
          "全局问题：网络链路和路由器过载，用拥塞窗口 cwnd 限制注入网络的数据量，保护的是「整条马路」。",
        distinctionTip:
          "看保护对象：怕「收件人」拆不过来 → 流量控制；怕「快递路网」瘫痪 → 拥塞控制。实际发送窗口 = min(rwnd, cwnd)。",
      },
    ],

    flashcards: [
      {
        id: "fc-cn-1",
        front: "TCP 为什么是三次握手，而不是两次？",
        back: "两次握手无法让服务端确认「客户端的接收能力」，也无法防止已失效的旧连接请求突然到达服务端造成资源浪费。第三次 ACK 让双方都确认了对方的收、发能力正常，并同步了初始序列号。",
        difficulty: "medium",
        status: "unseen",
      },
      {
        id: "fc-cn-2",
        front: "UDP 的首部有哪几个字段？共多少字节？",
        back: "源端口、目的端口、长度、校验和，各 2 字节，共 8 字节。没有序列号、确认号、窗口等字段，所以它做不到可靠传输。",
        difficulty: "easy",
        status: "unseen",
      },
      {
        id: "fc-cn-3",
        front: "慢启动阶段拥塞窗口 cwnd 如何增长？什么时候结束？",
        back: "每收到一个确认 cwnd 加 1 个 MSS，效果是每经过一个 RTT 翻倍（指数增长）。达到慢启动阈值 ssthresh 后转入拥塞避免（每个 RTT 只加 1，线性增长）。",
        difficulty: "hard",
        status: "unseen",
      },
      {
        id: "fc-cn-4",
        front: "接收方通告窗口 rwnd = 0 时会发生什么？",
        back: "发送方停止发送数据，并启动坚持定时器（persistence timer），定期发送 1 字节的窗口探测报文，防止双方因窗口更新报文丢失而永久互相等待（死锁）。",
        difficulty: "hard",
        status: "unseen",
      },
      {
        id: "fc-cn-5",
        front: "TCP 四次挥手中 TIME_WAIT 状态为什么要等 2MSL？",
        back: "两个原因：① 保证最后一个 ACK 能到达对方——若 ACK 丢失，对方会重发 FIN，还能再确认一次；② 让本连接产生的所有旧报文在网络中自然消逝，避免污染下一个相同四元组的新连接。",
        difficulty: "hard",
        status: "unseen",
      },
      {
        id: "fc-cn-6",
        front: "快重传的触发条件是什么？",
        back: "发送方连续收到 3 个重复确认（共 4 个相同 ACK）就立即重传丢失报文，不必等重传计时器超时。随后执行快恢复：ssthresh 减半、cwnd 设为新 ssthresh，直接进入拥塞避免而不是从慢启动重来。",
        difficulty: "medium",
        status: "unseen",
      },
    ],

    quizzes: [
      {
        id: "qz-cn-1",
        question: "TCP 建立连接至少需要几次报文交换？",
        options: ["1 次", "2 次", "3 次", "4 次"],
        answerIndex: 2,
        standardExplanation:
          "TCP 使用三次握手：SYN → SYN+ACK → ACK。四次挥手用于释放连接，注意区分「建连三次、释放四次」。",
        plainExplanation:
          "就像两个人对讲机试音：A 说「听得到我吗」，B 说「听得到，你呢」，A 再说「我也听得到」。三句话之后双方才都确定「我说话对方能听见、对方说话我也能听见」，少一句就有一方心里没底。",
      },
      {
        id: "qz-cn-2",
        question: "实时视频直播最可能选用哪种传输层协议？",
        options: ["TCP，因为可靠", "UDP，因为低延迟", "HTTP，因为通用", "FTP，因为传文件快"],
        answerIndex: 1,
        standardExplanation:
          "直播对实时性要求高于可靠性：UDP 无连接、无重传、无拥塞控制带来的延迟抖动，偶尔丢帧只造成短暂花屏，而 TCP 重传会造成明显卡顿。",
        plainExplanation:
          "看直播就像看烟花：错过一朵就错过了，你不会要求主办方「把刚才那朵重新放一遍」——等它重放，后面的烟花全堵住了。UDP 就是「只管往前放」，TCP 是「每一朵都必须让你看到」，看烟花当然选前者。",
      },
      {
        id: "qz-cn-3",
        question: "滑动窗口机制中的流量控制，主要解决的问题是？",
        options: [
          "网络中路由器过载",
          "发送方发送速率超过接收方处理能力",
          "数据在传输中被窃听",
          "报文到达顺序错乱",
        ],
        answerIndex: 1,
        standardExplanation:
          "流量控制是端到端的：接收方用通告窗口 rwnd 告知自己的剩余缓冲，发送方据此限速。路由器过载属于拥塞控制的范畴。",
        plainExplanation:
          "你给朋友寄零食，朋友说「我家柜子只能再放 3 箱」，你就只寄 3 箱——这是怕「朋友家」爆仓（流量控制）。至于快递路上会不会大堵车，那是拥塞控制操心的事，两码事。",
      },
      {
        id: "qz-cn-4",
        question: "慢启动阶段，cwnd 从 1 MSS 增长到 8 MSS（无丢包）需要几个 RTT？",
        options: ["2 个", "3 个", "4 个", "8 个"],
        answerIndex: 1,
        standardExplanation:
          "慢启动每个 RTT 翻倍：1 → 2 → 4 → 8，共 3 个 RTT。「慢」指的是起点低（从 1 开始），不是增长慢，增长其实是指数级的。",
        plainExplanation:
          "像细胞分裂：1 变 2、2 变 4、4 变 8，分裂三轮就到 8。名字叫「慢启动」只是因为它从 1 个小不点起步，别被名字骗了以为它爬得慢——它其实是坐火箭起步的。",
      },
    ],
  },

  {
    id: "deck-math-limit",
    title: "高等数学 · 极限与导数速记",
    subjectTag: "高数",
    createdAt,
    sourceSummary:
      "极限是微积分的地基：先搞懂「无限趋近」的语言，再用极限定义导数，最后理清连续、可导、可微三者的强弱关系。",

    concepts: [
      {
        term: "函数极限",
        definition:
          "当 x 无限趋近 x₀（但不等于 x₀）时，f(x) 无限趋近常数 A，则称 A 为 f(x) 在 x→x₀ 时的极限，记 lim f(x) = A。",
        keyPoint: "极限看的是「趋势」不是「到达」：函数在 x₀ 可以没定义，极限照样存在。",
      },
      {
        term: "导数",
        definition:
          "f'(x₀) = lim(Δx→0) [f(x₀+Δx) − f(x₀)] / Δx，即函数增量与自变量增量之比的极限，几何意义是切线斜率。",
        keyPoint: "口诀：导数 = 瞬时变化率 = 切线斜率；位移求导得速度，速度求导得加速度。",
      },
      {
        term: "两个重要极限",
        definition:
          "① lim(x→0) sin x / x = 1；② lim(x→∞) (1 + 1/x)^x = e（等价形式 lim(x→0) (1+x)^(1/x) = e）。",
        keyPoint: "看到 sin□/□（□→0）直接想 1；看到 (1+小量)^(1/小量) 直接想 e。",
      },
      {
        term: "连续",
        definition:
          "f 在 x₀ 连续 ⇔ lim(x→x₀) f(x) = f(x₀)，即极限存在、函数有定义、两者相等三个条件同时成立。",
        keyPoint: "连续 = 画图不断笔；可导必连续，连续不一定可导（反例 |x| 在 0 点）。",
      },
    ],

    confusions: [
      {
        topic: "连续 vs 可导",
        itemAName: "连续",
        itemAFeature:
          "曲线不断开即可，允许有「尖角」。条件弱：极限值 = 函数值。例：y = |x| 在 x=0 连续。",
        itemBName: "可导",
        itemBFeature:
          "不仅不断开，还要光滑到能画出唯一切线。条件强：左右导数存在且相等。y = |x| 在 x=0 左导数 −1、右导数 +1，不可导。",
        distinctionTip:
          "可导 ⇒ 连续，反过来不成立。记「光滑一定不断，不断未必光滑」——尖角处不断开但没有切线。",
      },
      {
        topic: "极限存在 vs 函数有定义",
        itemAName: "极限存在",
        itemAFeature:
          "只关心 x 趋近 x₀ 过程中 f(x) 的趋势，与 f 在 x₀ 处是否有定义、定义成多少完全无关。例：sin x / x 在 0 处无定义但极限为 1。",
        itemBName: "函数有定义",
        itemBFeature:
          "只说明 f(x₀) 算得出一个值，不保证附近趋势良好。例：分段函数在 0 处定义为 5，但左右极限分别是 1 和 2，极限不存在。",
        distinctionTip:
          "极限是「邻居们往哪走」，函数值是「这一家自己住几楼」——邻居的趋势和这家人住哪互不干涉，两者相等才叫连续。",
      },
    ],

    flashcards: [
      {
        id: "fc-math-1",
        front: "lim(x→0) sin x / x = ?",
        back: "1。这是第一个重要极限，可用夹逼定理证明。注意前提 x→0；若 x→∞ 则 sin x / x → 0（有界量乘无穷小）。",
        difficulty: "easy",
        status: "unseen",
      },
      {
        id: "fc-math-2",
        front: "写出导数的极限定义式",
        back: "f'(x₀) = lim(Δx→0) [f(x₀+Δx) − f(x₀)] / Δx。等价形式：lim(x→x₀) [f(x) − f(x₀)] / (x − x₀)。本质是平均变化率的极限 → 瞬时变化率。",
        difficulty: "medium",
        status: "unseen",
      },
      {
        id: "fc-math-3",
        front: "可导、连续、极限存在三者的强弱关系？",
        back: "可导 ⇒ 连续 ⇒ 极限存在（且等于函数值），反向均不成立。反例：|x| 在 0 连续但不可导；去掉定义点的 sin x / x 极限存在但不连续（无定义）。",
        difficulty: "medium",
        status: "unseen",
      },
      {
        id: "fc-math-4",
        front: "lim(x→∞) (1 + 1/x)^x = ?",
        back: "e ≈ 2.71828。第二个重要极限。识别特征：底数是「1 + 无穷小」，指数是「该无穷小的倒数」，1^∞ 型未定式的标准归宿。",
        difficulty: "medium",
        status: "unseen",
      },
      {
        id: "fc-math-5",
        front: "x→0 时常用的等价无穷小有哪些？",
        back: "sin x ~ x，tan x ~ x，1 − cos x ~ x²/2，ln(1+x) ~ x，e^x − 1 ~ x，(1+x)^a − 1 ~ ax。注意：等价替换一般只能用于乘除因子，加减项中直接替换容易出错。",
        difficulty: "hard",
        status: "unseen",
      },
      {
        id: "fc-math-6",
        front: "导数的几何意义与物理意义分别是什么？",
        back: "几何意义：曲线 y=f(x) 在该点切线的斜率，切线方程 y − f(x₀) = f'(x₀)(x − x₀)。物理意义：瞬时变化率，如位移对时间求导是瞬时速度，速度求导是加速度。",
        difficulty: "easy",
        status: "unseen",
      },
    ],

    quizzes: [
      {
        id: "qz-math-1",
        question: "函数 f(x) 在 x₀ 处可导，是 f(x) 在 x₀ 处连续的什么条件？",
        options: ["充分不必要条件", "必要不充分条件", "充要条件", "既不充分也不必要"],
        answerIndex: 0,
        standardExplanation:
          "可导必连续（充分），但连续不一定可导，如 y=|x| 在 x=0（不必要）。故为充分不必要条件。",
        plainExplanation:
          "「可导」是 VIP 会员，「连续」是普通入场券。有 VIP 卡肯定能入场（可导⇒连续），但能入场的人不一定有 VIP 卡（|x| 这种带尖角的曲线入了场却当不了 VIP）。",
      },
      {
        id: "qz-math-2",
        question: "lim(x→0) (1 − cos x) / x² 的值是？",
        options: ["0", "1/2", "1", "2"],
        answerIndex: 1,
        standardExplanation:
          "x→0 时 1 − cos x ~ x²/2，故原式 = lim (x²/2)/x² = 1/2。也可用洛必达法则：lim sin x / (2x) = 1/2。",
        plainExplanation:
          "1 − cos x 在 0 附近是个不断收窄的小坡，它缩小的速度恰好是 x² 的一半——就像两个气球一起放气，一个的体积永远是另一个的一半，比值自然锁定在 1/2。记住这对搭档：1−cos x 和 x²/2 是等价双胞胎。",
      },
      {
        id: "qz-math-3",
        question: "f(x) = |x| 在 x = 0 处的情况是？",
        options: ["不连续也不可达", "连续但不可导", "可导但不连续", "既连续又可导"],
        answerIndex: 1,
        standardExplanation:
          "lim(x→0)|x| = 0 = f(0)，故连续；但左导数为 −1、右导数为 +1，不相等，故不可导。这是「连续不一定可导」的经典反例。",
        plainExplanation:
          "把 |x| 的图像想成一个 V 字山谷：路是连着的（连续），但谷底是个尖角——你骑车冲下去的瞬间，方向从「向左下」猛变成「向右上」，那一刻根本没有唯一的「前进方向」（切线），所以不可导。",
      },
      {
        id: "qz-math-4",
        question: "lim(x→0) sin 3x / x 的值是？",
        options: ["1", "3", "1/3", "0"],
        answerIndex: 1,
        standardExplanation:
          "sin 3x / x = 3 · (sin 3x / 3x)，令 t = 3x → 0，由重要极限 lim sin t / t = 1，得原式 = 3 × 1 = 3。",
        plainExplanation:
          "重要极限 sin□/□ = 1 要求分子分母是「同一个□」。现在分子里是 3x、分母只有 x，差个 3 倍——那就人为补一个 3 再除回来：3 × (sin 3x / 3x) = 3 × 1 = 3。就像配方：缺什么补什么，补完再还回去。",
      },
    ],
  },

  {
    id: "deck-psy-memory",
    title: "心理学 · 记忆与学习原理",
    subjectTag: "心理学",
    createdAt,
    sourceSummary:
      "从「信息怎么存」（三级记忆模型）到「为什么会忘」（遗忘曲线），再到「行为怎么学」（两种条件作用），串起学习与复习的科学依据。",

    concepts: [
      {
        term: "三级记忆模型",
        definition:
          "Atkinson-Shiffrin 模型：感觉记忆（容量大、保持约 0.25~2 秒）→ 注意筛选 → 短时记忆（约 7±2 个组块、保持约 20 秒）→ 复述编码 → 长时记忆（容量近乎无限）。",
        keyPoint: "考点：信息进入短时记忆靠「注意」，进入长时记忆靠「复述与加工」；组块化能扩容。",
      },
      {
        term: "艾宾浩斯遗忘曲线",
        definition:
          "遗忘进程不均衡：识记后最初遗忘速度最快、遗忘量最多，之后逐渐放缓，呈「先快后慢」的负加速曲线。",
        keyPoint: "应用：当天学的当天复习，间隔重复（spaced repetition）比考前突击有效得多。",
      },
      {
        term: "经典性条件作用",
        definition:
          "巴甫洛夫提出：中性刺激（铃声）与无条件刺激（食物）反复配对后，中性刺激单独出现也能引发条件反应（分泌唾液）。",
        keyPoint: "关键词：刺激在前、反应被动、「学会联想」；泛化、分化、消退是高频考点。",
      },
      {
        term: "操作性条件作用",
        definition:
          "斯金纳提出：行为的结果（强化或惩罚）决定该行为未来出现的概率。正强化给愉快刺激、负强化撤厌恶刺激，两者都增加行为。",
        keyPoint: "易错点：负强化 ≠ 惩罚！负强化是「撤掉难受的」来鼓励行为，惩罚是「给难受的」来压制行为。",
      },
    ],

    confusions: [
      {
        topic: "经典性条件作用 vs 操作性条件作用",
        itemAName: "经典性条件作用（巴甫洛夫）",
        itemAFeature:
          "刺激 → 反应：先给刺激配对，反应是被诱发的、不随意的（狗听铃流口水）。学习者被动建立「信号联想」。",
        itemBName: "操作性条件作用（斯金纳）",
        itemBFeature:
          "反应 → 刺激：先自发做出行为，再根据结果奖惩（老鼠压杆得食物）。学习者主动「试错」，行为被结果塑造。",
        distinctionTip:
          "看顺序：先摇铃后给饭 = 经典（刺激在前）；先压杆后掉粮 = 操作（行为在前）。记「巴甫洛夫的狗被动流口水，斯金纳的老鼠主动压杠杆」。",
      },
      {
        topic: "负强化 vs 惩罚",
        itemAName: "负强化",
        itemAFeature:
          "撤销一个厌恶刺激，使行为概率增加。例：系上安全带后烦人的提示音停止 → 以后更愿意系安全带。",
        itemBName: "惩罚",
        itemBFeature:
          "呈现厌恶刺激或撤销愉快刺激，使行为概率减少。例：上课讲话被批评 → 讲话行为减少。",
        distinctionTip:
          "两步判断：① 行为变多还是变少？变多=强化，变少=惩罚。② 给了还是撤了？给=正，撤=负。负强化是「松绑鼓励」，惩罚是「吃苦头警告」。",
      },
    ],

    flashcards: [
      {
        id: "fc-psy-1",
        front: "艾宾浩斯遗忘曲线的规律是什么？对复习有什么启示？",
        back: "遗忘先快后慢：刚记完的几小时到一天内忘得最多，之后趋于平缓。启示：及时复习（当天回顾）+ 间隔重复（1 天、3 天、1 周逐步拉长间隔），比集中突击更省时间且保持更久。",
        difficulty: "easy",
        status: "unseen",
      },
      {
        id: "fc-psy-2",
        front: "短时记忆的容量是多少？如何「扩容」？",
        back: "经典结论为 7±2 个组块（Miller, 1956），后续研究认为纯工作记忆核心约 4±1 个组块。扩容靠组块化（chunking）：把零散信息组织成有意义的整体，如 19491001 记成「开国大典日期」一个组块。",
        difficulty: "medium",
        status: "unseen",
      },
      {
        id: "fc-psy-3",
        front: "巴甫洛夫实验中，铃声属于什么刺激？唾液分泌（听到铃声后）属于什么反应？",
        back: "训练前铃声是中性刺激；与食物反复配对后成为条件刺激（CS）。食物是无条件刺激（US），食物引起的唾液分泌是无条件反应（UR），铃声单独引起的唾液分泌是条件反应（CR）。",
        difficulty: "medium",
        status: "unseen",
      },
      {
        id: "fc-psy-4",
        front: "「只要写完作业就不用洗碗」属于哪种强化？",
        back: "负强化：撤销厌恶刺激（洗碗）来增加目标行为（写作业）的概率。注意不是惩罚——惩罚让行为减少，而这里写作业的行为被鼓励了。",
        difficulty: "hard",
        status: "unseen",
      },
      {
        id: "fc-psy-5",
        front: "什么是条件反射的「泛化」与「分化」？",
        back: "泛化：对相似刺激做出相同条件反应（被大狗咬过，见小狗也怕）。分化：学会只对特定刺激反应、对相似刺激不反应（只对自己老师的脚步声起立，别人的不起立）。两者互补，分化是精确学习的基础。",
        difficulty: "medium",
        status: "unseen",
      },
      {
        id: "fc-psy-6",
        front: "系列位置效应是什么？",
        back: "回忆一系列材料时，开头（首因效应）和结尾（近因效应）记得好，中间最差。首因靠长时记忆复述充分，近因靠短时记忆尚未消退。启示：把最重要的内容放在学习时段的开头和结尾。",
        difficulty: "medium",
        status: "unseen",
      },
    ],

    quizzes: [
      {
        id: "qz-psy-1",
        question: "根据遗忘曲线，遗忘速度最快的时段是？",
        options: ["识记后最初一段时间", "识记一周后", "识记一个月后", "各时段速度均匀"],
        answerIndex: 0,
        standardExplanation:
          "艾宾浩斯曲线呈负加速形态：识记后 20 分钟保持量已降至约 58%，1 天后约 33%，之后下降趋缓，即先快后慢。",
        plainExplanation:
          "新学的知识像刚倒进沙漏的沙子，最上面那层漏得最凶——刚学完的一两天是「大出血期」，之后只剩零星渗漏。所以复习要赶在沙漏刚倒转时赶紧扶一把，而不是等沙子快漏光了才补救。",
      },
      {
        id: "qz-psy-2",
        question: "小白鼠按压杠杆后获得食物，随后压杆频率增加。这属于？",
        options: ["经典性条件作用", "操作性条件作用", "无条件反射", "观察学习"],
        answerIndex: 1,
        standardExplanation:
          "斯金纳箱范式：动物先自发做出操作行为（压杆），行为结果（食物强化）反过来增加行为频率，符合操作性条件作用「行为在前、结果塑造」的特征。",
        plainExplanation:
          "老鼠不是「听到信号才流口水」的被动选手，而是自己摸索出「按这个按钮就掉外卖」的主动玩家——它是在用行动试探世界，再根据奖励决定下次还按不按。先动手、后领奖，就是操作性条件作用。",
      },
      {
        id: "qz-psy-3",
        question: "妈妈规定「考进前十名就取消每天的额外家务」，这运用了？",
        options: ["正惩罚", "负惩罚", "正强化", "负强化"],
        answerIndex: 3,
        standardExplanation:
          "目标行为（努力学习）概率要增加 → 强化；手段是撤销厌恶刺激（额外家务）→ 负。故为负强化。",
        plainExplanation:
          "两步走：先问「妈妈想让孩子更努力还是更躺平？」——更努力，所以是强化不是惩罚；再问「给糖还是松绑？」——取消家务是松绑，所以是负强化。负强化的本质是「你表现好，我就把烦人的事拿走」，跟惩罚完全相反。",
      },
      {
        id: "qz-psy-4",
        question: "背单词时把长串字母拆成熟悉的前缀、词根来记，利用的是？",
        options: ["感觉记忆扩容", "组块化（chunking）", "条件反射泛化", "近因效应"],
        answerIndex: 1,
        standardExplanation:
          "短时记忆以组块为单位计数（7±2）。把零散字母重组为有意义的词根词缀，减少组块数量、增大每块信息量，即组块化策略。",
        plainExplanation:
          "短时记忆像只有 7 个格子的收纳盒：散装字母一个占一格，瞬间爆满；把 un-believ-able 打包成 3 个「熟悉零件」，只占 3 格还能装更多。打包收纳，就是组块化。",
      },
    ],
  },
];