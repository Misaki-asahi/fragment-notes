@echo off
chcp 65001 > nul
cd /d "%~dp0"
title 碎片笔记 · 本地开发启动器

where node > nul 2>&1
if errorlevel 1 (
  echo [错误] 未检测到 Node.js，请先安装 Node.js 22+（推荐 LTS）。
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [首次启动] 未检测到 node_modules，正在执行 npm install ...
  call npm install
  if errorlevel 1 (
    echo [错误] npm install 失败，请检查网络或 Node 环境。
    pause
    exit /b 1
  )
)

echo [启动] 正在启动前端开发服务器与本地 AI 转发层（默认 :5173，冲突自动顺延 / :8000）...
echo [提示] 按 Ctrl+C 或关闭本窗口即可停止服务。
node scripts/dev-all.mjs --open
if errorlevel 1 pause
