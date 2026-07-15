$log = "D:\Projets\StageLink\backend\tunnel-url.txt"
Remove-Item $log -Force -ErrorAction SilentlyContinue
$ps = Start-Process -NoNewWindow -FilePath "npx.cmd" -ArgumentList "localtunnel --port 8000" -RedirectStandardOutput $log -PassThru
Start-Sleep -Seconds 8
$url = Get-Content $log -First 1
$url | Out-File "D:\Projets\StageLink\backend\tunnel-url.txt" -Force
Write-Output "URL: $url"
Write-Output "PID: $($ps.Id)"
