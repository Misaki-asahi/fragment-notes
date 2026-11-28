import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteBin = path.join(rootDir, "node_modules", "vite", "bin", "vite.js");
const apiEntry = path.join(rootDir, "dev", "dev-server.ts");
const openBrowser = process.argv.includes("--open");

function isPortFree(port, host) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.unref();
    srv.once("error", (err) => {
      if (err.code === "EADDRNOTAVAIL" || err.code === "EAFNOSUPPORT") {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    srv.once("listening", () => {
      srv.close(() => resolve(true));
    });
    srv.listen(port, host);
  });
}

async function findAvailablePort(startPort = 5173, maxTries = 20) {
  for (let i = 0; i < maxTries; i += 1) {
    const port = startPort + i;
    const [ipv4Free, ipv6Free] = await Promise.all([
      isPortFree(port, "127.0.0.1"),
      isPortFree(port, "::1"),
    ]);
    if (ipv4Free && ipv6Free) {
      return port;
    }
  }
  return null;
}

if (!existsSync(viteBin)) {
  console.error("[启动失败] 未找到 Vite，请先在项目根目录运行 npm install");
  process.exit(1);
}

const port = await findAvailablePort(5173, 20);
if (port === null) {
  console.error("[启动失败] 端口 5173-5192 均已被占用，请关闭部分本地服务后重试。");
  process.exit(1);
}

if (port !== 5173) {
  console.log(`[提示] 端口 5173 已被其他程序占用，已自动切换至 http://127.0.0.1:${port}`);
}

if (!existsSync(path.join(rootDir, ".env")) && !process.env.AI_API_KEY) {
  console.log("[提示] 未检测到 .env 或环境变量 AI_API_KEY：内置示例与「AI 设置（BYOK）」可直接使用；");
  console.log("       如需启用服务端默认密钥，请复制 .env.example 为 .env 并填入 AI_API_KEY。");
}

const viteArgs = [
  viteBin,
  "--host",
  "127.0.0.1",
  "--port",
  String(port),
  "--strictPort",
  ...(openBrowser ? ["--open"] : []),
];
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
