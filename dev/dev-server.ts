// 本地联调服务器（仅开发用，不参与部署打包；置于 dev/ 以排除出 Function 包）。
// 用法：node dev/dev-server.ts  → http://127.0.0.1:8000
// 前端 dev 模式直连本服务（CORS），生产走同源 /functions/v1/app/*。
// Key 优先读环境变量 AI_API_KEY（启动时注入），其次仓库根 .env；不打印任何密钥。
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { handleRequest } from '../api/generate-deck.ts';

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !line.trim().startsWith('#')) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // .env 不存在时按未配置处理
  }
  return env;
}

const env = loadEnv();
function isAllowedOrigin(origin: string): boolean {
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin ?? '';
  if (origin && !isAllowedOrigin(origin)) {
    res.writeHead(403);
    res.end();
    return;
  }
  const cors: Record<string, string> = isAllowedOrigin(origin)
    ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      }
    : {};
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 6_100_000) {
      res.writeHead(413, { ...cors, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: { code: 'invalid_input', message: '请求内容过大', retryable: false } }));
      return;
    }
    chunks.push(chunk as Buffer);
  }
  const body = Buffer.concat(chunks);
  const webReq = new Request(`http://127.0.0.1:8000${req.url ?? '/'}`, {
    method: req.method,
    headers: { 'Content-Type': req.headers['content-type'] ?? 'application/json' },
    body: body.length > 0 ? body : undefined,
  });
  const webRes = await handleRequest(webReq, { AI_API_KEY: process.env.AI_API_KEY ?? env.AI_API_KEY });
  const text = await webRes.text();
  res.writeHead(webRes.status, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
  res.end(text);
});

server.listen(8000, '127.0.0.1', () => {
  console.log('[dev] AI 转发层已启动: http://127.0.0.1:8000/functions/v1/app/health');
  const configured = Boolean(process.env.AI_API_KEY ?? env.AI_API_KEY);
  console.log(`[dev] AI_API_KEY ${configured ? '已配置' : '未配置（环境变量与 .env 均为空，生成接口将返回 service_not_configured）'}`);
});