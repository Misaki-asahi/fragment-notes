import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteBin = path.join(rootDir, "node_modules", "vite", "bin", "vite.js");
const apiEntry = path.join(rootDir, "dev", "dev-server.ts");
const openBrowser = process.argv.includes("--open");

if (!existsSync(viteBin)) {
  console.error("[启动失败] 未找到 Vite，请先在项目根目录运行 npm install");
  process.exit(1);
}

if (!existsSync(path.join(rootDir, ".env")) && !process.env.AI_API_KEY) {
  console.log("[提示] 未检测到 .env 或环境变量 AI_API_KEY：内置示例与「AI 设置（BYOK）」可直接使用；");
  console.log("       如需启用服务端默认密钥，请复制 .env.example 为 .env 并填入 AI_API_KEY。");
}

const viteArgs = [viteBin, ...(openBrowser ? ["--open"] : [])];
const apiProc = spawn(process.execPath, [apiEntry], {
  cwd: rootDir,
  stdio: "inherit",
});
const webProc = spawn(process.execPath, viteArgs, {
  cwd: rootDir,
  stdio: "inherit",
});

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of [webProc, apiProc]) {
    if (!child.killed && child.exitCode === null) {
      child.kill("SIGTERM");
    }
  }
  setTimeout(() => process.exit(exitCode), 150);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

apiProc.on("exit", (code) => {
  if (!shuttingDown && code !== 0) {
    console.error(`[dev-server] 异常退出（code=${code ?? "unknown"}），请检查 8000 端口是否被占用。`);
    shutdown(code ?? 1);
  }
});

webProc.on("exit", (code) => {
  if (!shuttingDown) {
    shutdown(code ?? 0);
  }
});
