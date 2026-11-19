// Function 逻辑名 app；只打包本文件与 generate-deck.ts，勿包含 Node 本地服务器。
import { handleRequest } from './generate-deck.ts';

Deno.serve((req: Request) => handleRequest(req, { AI_API_KEY: Deno.env.get('AI_API_KEY') }));