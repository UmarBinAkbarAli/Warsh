$ErrorActionPreference = "Stop"

Start-Process -WindowStyle Hidden -FilePath "cmd.exe" -WorkingDirectory "D:\Code\ArabAI\arabai-backend" -ArgumentList @("/c", "npm.cmd run dev -- --hostname 0.0.0.0")
Start-Sleep -Seconds 2
Start-Process -WindowStyle Hidden -FilePath "cmd.exe" -WorkingDirectory "D:\Code\ArabAI\arabai-app" -ArgumentList @("/c", "npm.cmd start -- --host lan")
