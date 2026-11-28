// B1 验收测试：useDeckStore 持久化与 actions（Node 直跑，localStorage 用内存桩）。
// 用 registerHooks 补 .ts 扩展名解析；用 ?refresh=N 重导入模拟浏览器刷新。
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
      const base = new URL(specifier, context.parentURL);
      for (const suffix of ['.ts', '.tsx']) {
        const candidate = new URL(base.href + suffix);
        if (existsSync(fileURLToPath(candidate))) return nextResolve(candidate.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});

const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};

const STORE_URL = new URL('../../../src/store/useDeckStore.ts', import.meta.url).href;
let pass = 0, fail = 0;
function check(name, ok) {
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}`);
  ok ? pass++ : fail++;
}

const mod = await import(STORE_URL);
const { STORAGE_KEY } = mod;

console.log('— 初始兜底 —');
let s = mod.useDeckStore; // hook 本体在 Node 无渲染环境不调用，直接测 action + 快照
check('键名常量集中管理', typeof STORAGE_KEY === 'string' && STORAGE_KEY.includes('fragment-notes'));
// 通过 actions 间接读状态：先 selectDeck 不存在的 id 应无副作用；用 addDeck 前后对比
const seedState = JSON.parse(mem.get(STORAGE_KEY) ?? 'null');
check('首次加载未写盘前无存储（懒写入）', seedState === null);

console.log('— addDeck / selectDeck / updateCardStatus —');
const customDeck = {
  id: 'deck-test-phys', title: '物理 · 测试牌组', subjectTag: '物理', createdAt: Date.now(),
  sourceSummary: '测试', concepts: [], confusions: [],
  flashcards: [{ id: 'fc1', front: 'Q', back: 'A', difficulty: 'easy', status: 'unseen' }],
  quizzes: [{ id: 'q1', question: '1+1?', options: ['1', '2', '3', '4'], answerIndex: 1, standardExplanation: '算术', plainExplanation: '一个苹果加一个苹果' }],
};
mod.addDeck(customDeck);
mod.updateCardStatus('fc1', 'mastered');
let stored = JSON.parse(mem.get(STORAGE_KEY));
check('addDeck 后当前牌组切换且落盘', stored.currentDeckId === 'deck-test-phys' && stored.decks.length === 4);
check('updateCardStatus 掌握度落盘', stored.decks.find((d) => d.id === 'deck-test-phys').flashcards[0].status === 'mastered');
mod.selectDeck('deck-cn-transport');
mod.updateCardStatus('fc1', 'review'); // 当前牌组是计网，其 fc1 与物理 fc1 同名但互不影响
stored = JSON.parse(mem.get(STORAGE_KEY));
check('同名卡 id 跨牌组隔离', stored.decks.find((d) => d.id === 'deck-test-phys').flashcards[0].status === 'mastered');
check('selectDeck 切换生效', stored.currentDeckId === 'deck-cn-transport');

console.log('— addWrong / appendAnalogy / removeWrong —');
const quiz = customDeck.quizzes[0];
const wid1 = mod.addWrong({ deckId: customDeck.id, deckTitle: customDeck.title, quiz, userChoiceIndex: 0 });
const wid2 = mod.addWrong({ deckId: customDeck.id, deckTitle: customDeck.title, quiz, userChoiceIndex: 3 });
stored = JSON.parse(mem.get(STORAGE_KEY));
check('同题重复答错去重', wid1 === wid2 && stored.wrongItems.length === 1);
check('错选更新为最新', stored.wrongItems[0].userChoiceIndex === 3);
mod.appendAnalogy(wid1, '  比喻A  ');
mod.appendAnalogy(wid1, '   ');
stored = JSON.parse(mem.get(STORAGE_KEY));
check('appendAnalogy 追加且 trim、空文本忽略', JSON.stringify(stored.wrongItems[0].customAnalogies) === '["比喻A"]');

console.log('— 刷新模拟（重导入模块读盘）—');
const refreshed = await import(STORE_URL + '?refresh=1');
refreshed.selectDeck('deck-test-phys'); // 触发一次读快照后的写盘以暴露状态
stored = JSON.parse(mem.get(STORAGE_KEY));
check('刷新后牌组仍在（4 套）', stored.decks.length === 4);
check('刷新后掌握度仍在', stored.decks.find((d) => d.id === 'deck-test-phys').flashcards[0].status === 'mastered');
check('刷新后错题与比喻仍在', stored.wrongItems.length === 1 && stored.wrongItems[0].customAnalogies[0] === '比喻A');

console.log('— removeWrong / deleteDeck —');
refreshed.removeWrong(wid1);
stored = JSON.parse(mem.get(STORAGE_KEY));
check('removeWrong 生效', stored.wrongItems.length === 0);
refreshed.addWrong({ deckId: customDeck.id, deckTitle: customDeck.title, quiz, userChoiceIndex: 2 });
refreshed.deleteDeck('deck-test-phys');
stored = JSON.parse(mem.get(STORAGE_KEY));
check('deleteDeck 移除牌组并联动清理其错题', stored.decks.length === 3 && stored.wrongItems.length === 0);
check('删除当前牌组后回退到首个', stored.currentDeckId === stored.decks[0].id);

console.log('— 异常存储兜底 —');
mem.set(STORAGE_KEY, '{corrupted!!');
const recovered = await import(STORE_URL + '?refresh=2');
recovered.addDeck(customDeck);
stored = JSON.parse(mem.get(STORAGE_KEY));
check('损坏存储落回 sampleDecks 兜底', stored.decks.length === 4);
// 清空全部牌组后刷新不应重新塞 Mock
for (const d of [...stored.decks]) recovered.deleteDeck(d.id);
const emptied = await import(STORE_URL + '?refresh=3');
emptied.selectDeck('nonexistent'); // 无副作用动作，仅验证不崩
stored = JSON.parse(mem.get(STORAGE_KEY));
check('用户删空的牌组列表刷新后保持为空（不重塞 Mock）', stored.decks.length === 0 && stored.currentDeckId === null);

console.log('— 同标题牌组隔离与边界数据 —');
const twin = { ...customDeck, id: 'deck-twin' };
emptied.addDeck(customDeck);
emptied.addDeck(twin);
const firstWrong = emptied.addWrong({ deckId: customDeck.id, deckTitle: customDeck.title, quiz, userChoiceIndex: 0 });
const secondWrong = emptied.addWrong({ deckId: twin.id, deckTitle: twin.title, quiz, userChoiceIndex: 2 });
check('同标题同题号不同牌组不会合并', firstWrong !== secondWrong && JSON.parse(mem.get(STORAGE_KEY)).wrongItems.length === 2);
emptied.deleteDeck(customDeck.id);
stored = JSON.parse(mem.get(STORAGE_KEY));
check('删除只清理指定牌组错题', stored.wrongItems.length === 1 && stored.wrongItems[0].deckId === twin.id);
mem.set(STORAGE_KEY, JSON.stringify({ decks: [{ id: 'broken', title: 'bad', flashcards: [null], quizzes: [] }] }));
const invalid = await import(STORE_URL + '?refresh=4');
invalid.addDeck(customDeck);
check('嵌套损坏牌组被拒绝并回到完整示例', JSON.parse(mem.get(STORAGE_KEY)).decks.length === 4);
const setItem = localStorage.setItem;
localStorage.setItem = () => { throw new Error('quota'); };
let quotaSafe = true;
try { invalid.selectDeck('deck-cn-transport'); } catch { quotaSafe = false; }
check('存储写入失败不打断操作', quotaSafe);
localStorage.setItem = setItem;

console.log('— 读取失败（隐私模式）—');
const getItem = localStorage.getItem;
localStorage.getItem = () => { throw new DOMException('SecurityError', 'SecurityError'); };
let readCrash = false;
let readFallback = false;
try {
  const blocked = await import(STORE_URL + '?refresh=5');
  blocked.addDeck(customDeck);
  const after = JSON.parse(mem.get(STORAGE_KEY));
  // 读取失败应回退到内置示例（3 个）并可继续写入，不白屏不报错
  readFallback = after.decks.length === 4 && after.decks.some((d) => d.id === customDeck.id);
} catch {
  readCrash = true;
}
check('存储读取失败不崩溃', !readCrash);
check('读取失败回退示例且仍可写入', readFallback);
localStorage.getItem = getItem;

console.log(`\n结果: ${pass} passed, ${fail} failed`);
process.exitCode = fail === 0 ? 0 : 1;