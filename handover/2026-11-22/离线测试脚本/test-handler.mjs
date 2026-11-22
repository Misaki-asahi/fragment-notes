// B5 转发层离线容错测试：stub fetch 模拟上游各种响应，验证校验/清洗/兜底/重试。
// 运行：node "C:/Users/20824/Desktop/AI临时文件/qoder临时文件汇总/笔记/test-handler.mjs"
import { handleRequest } from 'file:///C:/Users/20824/Desktop/AI临时文件/qoder临时文件汇总/笔记2.0/fragment-notes-regression/api/generate-deck.ts';

const env = { AI_API_KEY: 'test-key-not-real' };
const realFetch = globalThis.fetch;
const realTimeout = globalThis.setTimeout;
globalThis.setTimeout = (fn, ms, ...args) => realTimeout(fn, ms === 2500 ? 1 : ms, ...args);
let passed = 0, failed = 0;

function check(name, cond, extra = '') {
  if (cond) { passed++; console.log(`  PASS ${name}`); }
  else { failed++; console.log(`  FAIL ${name} ${extra}`); }
}

function stubFetch(impl) { globalThis.fetch = impl; }
function glmResponse(content, status = 200) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status, headers: { 'Content-Type': 'application/json' } });
}
let ipSeq = 0;
function post(body, route = 'generate-deck') {
  return handleRequest(new Request(`http://x/functions/v1/app/${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `test-ip-${ipSeq++}` },
    body: JSON.stringify(body),
  }), env);
}

const validDeck = {
  id: 'd1', title: '物理 · 牛顿第三定律', subjectTag: '物理', createdAt: 1, sourceSummary: '作用力与反作用力',
  concepts: [{ term: '作用力', definition: '物体间相互作用的力', keyPoint: '成对出现' }],
  confusions: [],
  flashcards: [{ id: 'fc1', front: '牛顿第三定律内容？', back: '作用力与反作用力等大反向共线', difficulty: 'easy', status: 'review' }],
  quizzes: [{ id: 'q1', question: '马拉车加速前进，马拉车的力与车拉马的力大小关系？', options: ['相等', '马拉车更大', '车拉马更大', '无法比较'], answerIndex: 0, standardExplanation: '牛顿第三定律与运动状态无关', plainExplanation: '' }],
};

console.log('— 输入校验 —');
let r = await post({ kind: 'video' });
check('非法 kind → 400', r.status === 400 && (await r.json()).error.code === 'invalid_input');
r = await post({ kind: 'text', text: '   ' });
check('空文本 → 400', r.status === 400);
r = await post({ kind: 'text', text: 'x'.repeat(16001) });
check('超长文本 → 400', r.status === 400);
r = await post({ kind: 'image' });
check('图片缺 base64 → 400', r.status === 400);

console.log('— JSON 清洗与契约兜底 —');
stubFetch(async () => glmResponse('```json\n' + JSON.stringify(validDeck) + '\n```'));
r = await post({ kind: 'text', text: '牛顿第三定律提纲' });
let j = await r.json();
check('markdown 外壳清洗 → ok', r.status === 200 && j.ok === true, JSON.stringify(j).slice(0, 120));
check('status 强制 unseen', j.deck?.flashcards[0].status === 'unseen');
check('plainExplanation 缺失回退 standardExplanation', j.deck?.quizzes[0].plainExplanation === '牛顿第三定律与运动状态无关');

const partial = { flashcards: [{ front: 'Q', back: 'A' }], quizzes: [{ question: 'q', options: ['a', 'b', 'c', 'd'], answerIndex: 3 }] };
stubFetch(async () => glmResponse(JSON.stringify(partial)));
r = await post({ kind: 'text', text: '内容' });
j = await r.json();
check('缺失元数据安全默认且保留有效答案', j.ok && j.deck.flashcards[0].id !== '' && j.deck.flashcards[0].difficulty === 'medium' && j.deck.quizzes[0].options[j.deck.quizzes[0].answerIndex] === 'd', JSON.stringify(j).slice(0, 160));

const positions = new Set();
let answerKept = true;
stubFetch(async () => glmResponse(JSON.stringify(validDeck)));
for (let k = 0; k < 40; k++) {
  j = await (await post({ kind: 'text', text: '内容' })).json();
  const q = j.deck.quizzes[0];
  positions.add(q.answerIndex);
  answerKept &&= q.options[q.answerIndex] === '相等' && new Set(q.options).size === 4;
}
check('选项重排后正确答案文本不变', answerKept);
check('正确答案位置不再固定', positions.size >= 3, `positions=${[...positions]}`);
const allAbove = { ...validDeck, quizzes: [{ ...validDeck.quizzes[0], options: ['甲', '乙', '丙', '以上都是'], answerIndex: 3 }] };
stubFetch(async () => glmResponse(JSON.stringify(allAbove)));
j = await (await post({ kind: 'text', text: '内容' })).json();
check('含"以上都是"的题保持原顺序', j.deck.quizzes[0].options.join() === '甲,乙,丙,以上都是' && j.deck.quizzes[0].answerIndex === 3);

const brokenLine = JSON.stringify(validDeck).replace('牛顿第三定律与运动状态无关', '牛顿第三定律\n与运动\t状态无关');
stubFetch(async () => glmResponse(brokenLine));
j = await (await post({ kind: 'text', text: '内容' })).json();
check('字符串内原始换行/制表符被修复后解析', j.ok === true && j.deck.quizzes[0].standardExplanation === '牛顿第三定律\n与运动\t状态无关');
const leaked = '{\n  "title": "草稿", "quizzes": [{"question": "未写完\n现在重新梳理quizzes部分，确保答案唯一。\n第一道题：' + JSON.stringify(validDeck);
stubFetch(async () => glmResponse(leaked));
j = await (await post({ kind: 'text', text: '内容' })).json();
check('推理草稿漏进正文时取末尾完整最终 JSON', j.ok === true && j.deck.title === validDeck.title);
const jsTime = JSON.stringify(validDeck).replace('"createdAt":1', '"createdAt":new Date().getTime()');
stubFetch(async () => glmResponse(jsTime));
j = await (await post({ kind: 'text', text: '内容' })).json();
check('JSON 内 JS 时间表达式被替换后解析', j.ok === true && Number.isFinite(j.deck.createdAt));
const selfDoubt = { ...validDeck, quizzes: [validDeck.quizzes[0], { ...validDeck.quizzes[0], question: '另一题', standardExplanation: '结合其他条件可得0.3（注：此处需根据完整公式修正）' }] };
stubFetch(async () => glmResponse(JSON.stringify(selfDoubt)));
j = await (await post({ kind: 'text', text: '内容' })).json();
check('解析自认待修正的题被丢弃', j.ok === true && j.deck.quizzes.length === 1 && j.deck.quizzes[0].question === validDeck.quizzes[0].question);
const numericQ = (question, options, answerIndex, standardExplanation) => ({ question, options, answerIndex, standardExplanation, plainExplanation: '比喻' });
const numericDeck = { ...validDeck, quizzes: [
  numericQ('求P(AB)', ['0.5', '0.2', '0.1', '0.3'], 1, '代入得 0.7 = 0.3 + 0.5 - P(AB)，解得 P(AB) = 0.1。'),
  numericQ('求P(ĀB)', ['0.4', '0.3', '0.2', '0.5'], 2, 'P(AB) = 0.4 + 0.6 - 0.8 = 0.2，所以 P(ĀB) = 0.6 - 0.2 = 0.4。'),
  numericQ('求P(ĀB̄)', ['0.5', '0.3', '0.4', '0.2'], 3, 'P(ĀB̄) = 1 - 0.8 = 0.2。'),
  numericQ('无对应', ['1', '2', '3', '4'], 0, '计算得 7。'),
  numericQ('分数', ['1/2', '1/3', '1/4', '2/3'], 0, '故结果为 1/4'),
] };
stubFetch(async () => glmResponse(JSON.stringify(numericDeck)));
j = await (await post({ kind: 'text', text: '内容' })).json();
const answerOf = (title) => { const q = j.deck.quizzes.find((x) => x.question === title); return q && q.options[q.answerIndex]; };
check('数值题按解析结果纠正标错的答案（第60页实测两例）', answerOf('求P(AB)') === '0.1' && answerOf('求P(ĀB)') === '0.4', JSON.stringify(j.deck.quizzes.map((q) => [q.question, q.options[q.answerIndex]])));
check('解析结果与标注一致时保持不变', answerOf('求P(ĀB̄)') === '0.2');
check('解析结果不对应任何选项的数值题被丢弃', answerOf('无对应') === undefined);
check('分数选项也能对齐', answerOf('分数') === '1/4');
check('非数值选项题不受影响', (await (async () => { stubFetch(async () => glmResponse(JSON.stringify(validDeck))); const k = await (await post({ kind: 'text', text: '内容' })).json(); const q = k.deck.quizzes[0]; return q.options[q.answerIndex] === '相等'; })()));
const symbolicDeck = { ...validDeck, quizzes: [
  numericQ('求P(ĀB̄)', ['r-p-q', 'r-q', 'p+q-r', 'r-p'], 1, 'P(ĀB̄)=1-q-(r-q)=1-r'),
  numericQ('求P(AB)', ['p+q-r', 'p+q', 'p+q+r', 'r-p'], 0, '故P(AB)=p+q-r'),
  numericQ('对立条件', ['A∩B=∅', 'A∪B=Ω', 'A∪B=Ω 且 A∩B=∅', 'A=B'], 0, '对立要求并集为全集，即A∪B=Ω'),
] };
stubFetch(async () => glmResponse(JSON.stringify(symbolicDeck)));
j = await (await post({ kind: 'text', text: '内容' })).json();
const sym = (t) => { const q = j.deck.quizzes.find((x) => x.question === t); return q && q.options[q.answerIndex]; };
check('符号题解析结果不在选项中被丢弃（云端实测例）', sym('求P(ĀB̄)') === undefined);
check('符号题解析与选项一致时保留', sym('求P(AB)') === 'p+q-r');
check('解析结果为选项后缀时不误杀', sym('对立条件') === 'A∪B=Ω');
const contrastDeck = { ...validDeck, quizzes: [
  numericQ('下列哪个不是线性变换的充要条件', ['T(kα) = kT(α)', 'T(α + β) = T(α) + T(β)', 'T(0) = 0', 'T(aα + bβ) = aT(α) + bT(β)'], 2, 'T(0)=0 是必要条件而非充要条件，充要条件是对任意 a,b 及 α,β 有 T(aα + bβ)=aT(α)+bT(β)。'),
  numericQ('充要条件是哪个', ['T(0)=0', 'T(α+β)=T(α)+T(β)', 'T(kα)=kT(α)', 'T(aα+bβ)=aT(α)+bT(β)'], 0, '充要条件是对任意 a,b 及 α,β 有 T(aα+bβ)=aT(α)+bT(β)。'),
  numericQ('表达式误标仍纠正', ['p+q', 'p+q-r', 'r-p', 'p+q+r'], 0, '故P(AB)=p+q-r'),
] };
stubFetch(async () => glmResponse(JSON.stringify(contrastDeck)));
j = await (await post({ kind: 'text', text: '内容' })).json();
check('解析末尾为对比公式时不覆盖模型正确标注（高数5.1实测例）', sym('下列哪个不是线性变换的充要条件') === 'T(0) = 0', JSON.stringify(j.deck.quizzes.map((q) => [q.question, q.options[q.answerIndex]])));
check('等式选项误标且解析未讨论该选项时仍纠正', sym('充要条件是哪个') === 'T(aα+bβ)=aT(α)+bT(β)');
check('表达式选项误标纠正不受新护栏影响', sym('表达式误标仍纠正') === 'p+q-r');

console.log('— BYOK 自带 key 与模型 —');
let capturedInit = null;
stubFetch(async (_url, init) => { capturedInit = init; return glmResponse(JSON.stringify(validDeck)); });
r = await post({ kind: 'text', text: '内容', userKey: 'user-key-123' });
check('自带 key 覆盖站点 key 上游', r.status === 200 && capturedInit.headers.Authorization === 'Bearer user-key-123');
r = await handleRequest(new Request('http://x/functions/v1/app/generate-deck', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `byok-${ipSeq++}` }, body: JSON.stringify({ kind: 'text', text: '内容', userKey: 'user-key-123' }) }), {});
check('站点无 key 时自带 key 仍可用', r.status === 200);
r = await post({ kind: 'text', text: '内容', userKey: 'bad key with space' });
check('自带 key 含空格被拒', r.status === 400);
r = await post({ kind: 'text', text: '内容', model: 'glm-9-not-exist' });
check('模型白名单外被拒', r.status === 400);
capturedInit = null;
r = await post({ kind: 'text', text: '内容', model: 'glm-4.5v' });
const pinnedBody = JSON.parse(capturedInit.body);
check('指定模型直达不走的降级链', r.status === 200 && pinnedBody.model === 'glm-4.5v' && pinnedBody.thinking?.type === 'disabled');
let byokCalls = 0;
stubFetch(async (_url, init) => { byokCalls++; capturedInit = init; return new Response(JSON.stringify({ error: { code: '1305' } }), { status: 429 }); });
r = await post({ kind: 'text', text: '内容', model: 'glm-4.5v' });
j = await r.json();
check('指定模型繁忙不降级只重试', byokCalls === 2 && JSON.parse(capturedInit.body).model === 'glm-4.5v' && j.error?.code === 'upstream_busy');
stubFetch(async (_url, init) => { capturedInit = init; return glmResponse(JSON.stringify(validDeck)); });
r = await post({ kind: 'text', text: '内容', model: 'glm-4v-plus' });
check('老视觉模型不带 thinking 参数', r.status === 200 && JSON.parse(capturedInit.body).thinking === undefined);

console.log('— BYOK 自定义端点 —');
let capturedUrl = null;
stubFetch(async (url, init) => { capturedUrl = String(url); capturedInit = init; return glmResponse(JSON.stringify(validDeck)); });
r = await post({ kind: 'text', text: '内容', userKey: 'proxy-key', model: '[test]model-x', endpoint: 'https://proxy.example.com/v1' });
check('自定义端点自动补全 chat/completions 且自由模型名可用', r.status === 200 && capturedUrl === 'https://proxy.example.com/v1/chat/completions' && JSON.parse(capturedInit.body).model === '[test]model-x' && JSON.parse(capturedInit.body).thinking === undefined);
r = await post({ kind: 'text', text: '内容', userKey: 'proxy-key', model: 'm', endpoint: 'https://proxy.example.com/v1/chat/completions' });
check('端点已带后缀不重复补全', r.status === 200 && capturedUrl === 'https://proxy.example.com/v1/chat/completions');
for (const [label, ep] of [
  ['http 端点被拒', 'http://proxy.example.com/v1'],
  ['localhost 被拒', 'https://localhost/v1'],
  ['loopback IP 被拒', 'https://127.0.0.1/v1'],
  ['云元数据被拒', 'https://169.254.169.254/latest'],
  ['内网 10 段被拒', 'https://10.0.0.1/v1'],
  ['内网 192.168 被拒', 'https://192.168.1.1/v1'],
  ['内网 172.16 被拒', 'https://172.16.0.1/v1'],
  ['IPv6 loopback 被拒', 'https://[::1]/v1'],
  ['非标端口被拒', 'https://proxy.example.com:8080/v1'],
  ['.internal 被拒', 'https://metadata.google.internal/v1'],
]) {
  r = await post({ kind: 'text', text: '内容', userKey: 'proxy-key', model: 'm', endpoint: ep });
  check(label, r.status === 400);
}
r = await post({ kind: 'text', text: '内容', userKey: 'proxy-key', endpoint: 'https://proxy.example.com/v1' });
check('自定义端点缺模型名被拒', r.status === 400);
r = await post({ kind: 'text', text: '内容', userKey: 'proxy-key', model: 'auto', endpoint: 'https://proxy.example.com/v1' });
check('自定义端点不允许 auto', r.status === 400);
r = await post({ kind: 'text', text: '内容', userKey: 'proxy-key', model: 'not-in-whitelist' });
check('官方端点仍走白名单', r.status === 400);

console.log('— list-models 模型检索 —');
stubFetch(async (url, init) => { capturedUrl = String(url); capturedInit = init; return new Response(JSON.stringify({ data: [{ id: 'm-a' }, { id: 'm-b' }, { id: 3 }, 'm-c'] }), { status: 200 }); });
r = await post({ userKey: 'proxy-key', endpoint: 'https://proxy.example/v1' }, 'list-models');
j = await r.json();
check('list-models 请求 /models 带用户 key 且过滤非法项', r.status === 200 && capturedUrl === 'https://proxy.example/v1/models' && capturedInit.headers.Authorization === 'Bearer proxy-key' && JSON.stringify(j.models) === JSON.stringify(['m-a', 'm-b', 'm-c']));
r = await post({ userKey: 'proxy-key', endpoint: 'https://proxy.example/v1/chat/completions' }, 'list-models');
check('list-models 剥离 chat/completions 后缀', r.status === 200 && capturedUrl === 'https://proxy.example/v1/models');
r = await post({}, 'list-models');
j = await r.json();
check('官方端点返回内置白名单', r.status === 200 && j.models.includes('glm-4.6v-flash'));
r = await post({ endpoint: 'https://proxy.example/v1' }, 'list-models');
check('自定义端点缺 key 被拒', r.status === 400);
stubFetch(async () => new Response('nope', { status: 404 }));
r = await post({ userKey: 'k', endpoint: 'https://proxy.example/v1' }, 'list-models');
j = await r.json();
check('端点无 /models 友好报错', r.status === 502 && j.error?.code === 'models_unavailable');
stubFetch(async () => new Response(JSON.stringify({ error: 'x' }), { status: 401 }));
r = await post({ userKey: 'k', endpoint: 'https://proxy.example/v1' }, 'list-models');
j = await r.json();
check('list-models 401 映射 auth_error', j.error?.code === 'auth_error');
stubFetch(async (url, init) => { capturedInit = init; return glmResponse(JSON.stringify(validDeck)); });
r = await post({ kind: 'text', text: '内容' });
check('文本料 user content 为纯字符串（第三方端点兼容）', r.status === 200 && typeof JSON.parse(capturedInit.body).messages[1].content === 'string');
r = await post({ kind: 'image', imageBase64: 'A'.repeat(100) });
check('图片料 user content 仍为数组 parts', r.status === 200 && Array.isArray(JSON.parse(capturedInit.body).messages[1].content));
r = await post({ kind: 'image', imageBase64: 'A'.repeat(100) });
check('图片 url 带标准 data URL 前缀（实测：严格端点拒裸 base64）', r.status === 200 && JSON.parse(capturedInit.body).messages[1].content[0].image_url.url.startsWith('data:image/jpeg;base64,'));
stubFetch(async () => new Response(JSON.stringify({ error: { message: 'Model Not Exist' } }), { status: 400 }));
r = await post({ kind: 'text', text: '内容' });
j = await r.json();
check('上游 400 映射 upstream_error 不可重试', r.status === 502 && j.error?.code === 'upstream_error' && j.error?.retryable === false);

const badOptions = { ...validDeck, quizzes: [{ ...validDeck.quizzes[0], options: ['a', 'b'] }] };
stubFetch(async () => glmResponse(JSON.stringify(badOptions)));
r = await post({ kind: 'text', text: '内容' });
j = await r.json();
check('选项≠4 的题被丢弃 → 无有效题 → bad_output 可重试', r.status === 502 && j.error.code === 'bad_output' && j.error.retryable === true);

console.log('— 重试与上游错误 —');
let calls = 0;
stubFetch(async () => { calls++; return glmResponse('不是 JSON'); });
r = await post({ kind: 'text', text: '内容' });
j = await r.json();
check('坏输出重试 1 次后报错', calls === 2 && j.error.code === 'bad_output' && j.error.retryable === true, `calls=${calls}`);

calls = 0;
stubFetch(async () => { calls++; throw new Error('network down'); });
r = await post({ kind: 'text', text: '内容' });
j = await r.json();
check('网络失败重试 1 次 → timeout 可重试', calls === 2 && j.error.code === 'timeout' && j.error.retryable === true, `calls=${calls}`);

calls = 0;
stubFetch(async () => { calls++; return new Response('{}', { status: 401 }); });
r = await post({ kind: 'text', text: '内容' });
j = await r.json();
check('401 不重试 → auth_error 不可重试', calls === 1 && j.error.code === 'auth_error' && j.error.retryable === false, `calls=${calls}`);

calls = 0;
stubFetch(async () => { calls++; return calls === 1 ? new Response('{}', { status: 503 }) : glmResponse(JSON.stringify(validDeck)); });
r = await post({ kind: 'text', text: '内容' });
j = await r.json();
check('5xx 重试后成功', calls === 2 && j.ok === true, `calls=${calls}`);

console.log('— 图片与 analogy 路由 —');
let sawImage = false;
stubFetch(async (_url, init) => {
  const body = JSON.parse(init.body);
  sawImage = body.messages[1].content.some((p) => p.type === 'image_url' && p.image_url.url === 'data:image/jpeg;base64,QUJDRA==');
  return glmResponse(JSON.stringify(validDeck));
});
r = await post({ kind: 'image', imageBase64: 'data:image/png;base64,QUJDRA==' });
j = await r.json();
check('入站前缀剥离、出站补标准 JPEG data URL（压缩产物恒 JPEG）', j.ok === true && sawImage);

stubFetch(async () => glmResponse('{"analogy":"就像你推墙，墙也在推你……"}'));
r = await post({ question: '作用力与反作用力', options: ['相等', '不等'], answerIndex: 0, userChoiceIndex: 1, plainExplanation: '旧比喻' }, 'analogy');
j = await r.json();
check('analogy 路由 ok', r.status === 200 && j.ok === true && typeof j.analogy === 'string');

stubFetch(async () => glmResponse('{"analogy":""}'));
r = await post({ question: 'q' }, 'analogy');
j = await r.json();
check('空 analogy → bad_output', j.error.code === 'bad_output');
r = await post({}, 'analogy');
check('analogy 缺 question → 400', r.status === 400);

console.log('— 输出安全边界 —');
for (const [label, change] of [
  ['越界答案', { answerIndex: 9 }],
  ['缺失答案', { answerIndex: undefined }],
  ['小数答案', { answerIndex: 1.5 }],
  ['重复选项', { options: ['a', ' a ', 'c', 'd'] }],
  ['五个选项', { options: ['a', 'b', 'c', 'd', 'e'] }],
  ['空白选项', { options: ['a', '', 'c', 'd'] }],
]) {
  calls = 0;
  stubFetch(async () => { calls++; return glmResponse(JSON.stringify({ ...validDeck, quizzes: [{ ...validDeck.quizzes[0], ...change }] })); });
  r = await post({ kind: 'text', text: '内容' }); j = await r.json();
  check(`${label}不编造答案，重试预算2次`, calls === 2 && j.error?.code === 'bad_output');
}
stubFetch(async () => glmResponse(JSON.stringify({ ...validDeck, flashcards: [validDeck.flashcards[0], validDeck.flashcards[0]], quizzes: [validDeck.quizzes[0], validDeck.quizzes[0]] })));
r = await post({ kind: 'text', text: '内容' }); j = await r.json();
check('重复ID归一化、时间由服务端生成', new Set(j.deck.flashcards.map(c => c.id)).size === 2 && new Set(j.deck.quizzes.map(q => q.id)).size === 2 && j.deck.createdAt > 1);
calls = 0;
stubFetch(async () => { calls++; return new Response('{}', { status: 429 }); });
r = await post({ kind: 'text', text: '内容' }); j = await r.json();
check('两款免费模型都繁忙：独立错误码，2轮×2模型共4次', calls === 4 && j.error?.code === 'upstream_busy' && j.error.retryable, `calls=${calls}`);
let models = [];
stubFetch(async (_url, init) => {
  const body = JSON.parse(init.body);
  models.push({ model: body.model, thinking: body.thinking, maxTokens: body.max_tokens });
  return body.model === 'glm-4.6v-flash'
    ? new Response('{}', { status: 429 })
    : glmResponse('<think>先识别{笔记}内容，再组织 JSON {草稿}</think><|begin_of_box|>' + JSON.stringify(validDeck) + '<|end_of_box|>');
});
r = await post({ kind: 'text', text: '内容' }); j = await r.json();
check('主模型繁忙立即换免费备用模型并成功', j.ok === true && models.map(m => m.model).join() === 'glm-4.6v-flash,glm-4.1v-thinking-flash', JSON.stringify(models));
check('备用思考模型不发 thinking 参数且追加思考额度', models[1]?.thinking === undefined && models[1]?.maxTokens === models[0]?.maxTokens + 4000 && models[0]?.thinking?.type === 'disabled');
check('剥离思考过程与答案框标记后解析', j.deck?.title === validDeck.title && j.model === 'glm-4.1v-thinking-flash');
models = [];
stubFetch(async (_url, init) => { models.push(JSON.parse(init.body).model); return new Response('{}', { status: 401 }); });
r = await post({ kind: 'text', text: '内容' }); j = await r.json();
check('鉴权失败不换模型不重试', models.length === 1 && j.error?.code === 'auth_error');
models = [];
stubFetch(async (_url, init) => { models.push(JSON.parse(init.body).model); return glmResponse('<think>只有思考没有答案'); });
r = await post({ kind: 'text', text: '内容' }); j = await r.json();
check('只有未闭合思考内容视为坏输出', j.error?.code === 'bad_output' && models.every(m => m === 'glm-4.6v-flash'), JSON.stringify(models));
calls = 0;
stubFetch(async () => { calls++; return new Response('invalid JSON'); });
r = await post({ kind: 'text', text: '内容' }); j = await r.json();
check('HTTP响应坏JSON也在重试预算中', calls === 2 && j.error?.code === 'bad_output');

console.log('— 请求边界 —');
for (const input of ['https://example.invalid/image.png', 'data:image/png;base64,', 'AA=A', 'A']) {
  r = await post({ kind: 'image', imageBase64: input });
  check(`拒绝非法图片 ${input.slice(0, 20)}`, r.status === 400);
}
r = await post({ question: 'q', plainExplanation: 'a'.repeat(4001) }, 'analogy');
check('比喻历史限制', r.status === 400);
r = await post({ question: 'q', options: Array(5).fill('a') }, 'analogy');
check('比喻选项限制', r.status === 400);
r = await handleRequest(new Request('http://x/unknown'), env);
check('未知路由404', r.status === 404);
r = await handleRequest(new Request('http://x/generate-deck'), env);
check('方法错误405', r.status === 405);
r = await handleRequest(new Request('http://x/health'), {});
check('健康检查不需要密钥', r.status === 200 && !(await r.json()).configured);
r = await handleRequest(new Request('http://x/generate-deck', {method:'POST'}), {});
check('未配置密钥503', r.status === 503);
for (const [label, headers, body] of [
  ['非JSON请求', { 'Content-Type':'text/plain' }, '{}'],
  ['坏JSON请求', { 'Content-Type':'application/json' }, '{bad'],
  ['流式字节上限', { 'Content-Type':'application/json' }, ' '.repeat(6100001)],
  ['声明字节上限', { 'Content-Type':'application/json', 'Content-Length':'6100001' }, '{}'],
]) {
  r = await handleRequest(new Request('http://x/generate-deck', {method:'POST',headers:{...headers,'x-forwarded-for':`edge-${ipSeq++}`},body}),env);
  check(label, r.status === 400);
}
calls = 0;
stubFetch(async () => { calls++; return glmResponse(JSON.stringify(validDeck)); });
r = await post({ kind: 'image', imageBase64: 'A'.repeat(5999996) });
check('大图片合法base64校验不会栈溢出', r.status === 200 && calls === 1);

console.log('— 超时覆盖响应体 —');
globalThis.setTimeout = (fn, ms, ...args) => realTimeout(fn, ms === 90000 ? 10 : ms === 2500 ? 1 : ms, ...args);
calls = 0;
stubFetch(async (_url, init) => {
  calls++;
  return new Response(new ReadableStream({start(controller) {
    init.signal.addEventListener('abort', () => controller.error(new DOMException('aborted', 'AbortError')), { once: true });
  }}));
});
r = await post({kind:'text',text:'内容'}); j = await r.json();
check('响应头已收到但响应体卡住时超时并限次重试', calls === 2 && j.error?.code === 'timeout');
globalThis.setTimeout = realTimeout;
globalThis.fetch = realFetch;
console.log(`\n结果: ${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;