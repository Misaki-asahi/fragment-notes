import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function loadExports(file) {
  const src = fs.readFileSync(file, "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(js, { module, exports: module.exports, console });
  return module.exports;
}

const { sampleDecks } = loadExports("src/mock/sampleDecks.ts");
const content = loadExports("src/content.ts");

let html = fs.readFileSync("index.html", "utf8");
const blocks = [
  ["DECKS", sampleDecks, /var DECKS = \[[\s\S]*?\];/],
  ["FEATURES", content.FEATURES, /var FEATURES = \[[\s\S]*?\];/],
  ["FAQ", content.FAQ, /var FAQ = \[[\s\S]*?\];/],
  ["NAV", content.NAV, /var NAV = \[[\s\S]*?\];/],
  ["HERO", content.HERO, /var HERO = \{[\s\S]*?\};/],
];
for (const [name, value, re] of blocks) {
  if (!re.test(html)) throw new Error(`index.html 缺少内嵌块 var ${name}，无法同步`);
  html = html.replace(re, `var ${name} = ${JSON.stringify(value)};`);
}
fs.writeFileSync("index.html", html);
console.log(`已同步离线展示页：${sampleDecks.length} 套牌组、${content.FEATURES.length} 项体验、${content.FAQ.length} 条 FAQ`);