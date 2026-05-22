@echo off
cd /d D:\Code\ArabAI\arabai-backend
set NEXT_TELEMETRY_DISABLED=1
npm.cmd run dev -- --hostname 0.0.0.0
pause
