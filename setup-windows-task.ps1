# setup-windows-task.ps1
# Creates a Windows Task Scheduler task that runs the Apify job fetch daily at 8 AM.
# Run this once from PowerShell (no Administrator needed for current-user tasks).
#
# Usage:
#   .\setup-windows-task.ps1
#
# To remove the task later:
#   Unregister-ScheduledTask -TaskName "CareerOps-DailyJobFetch" -Confirm:$false

$taskName   = "CareerOps-DailyJobFetch"
$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$scriptPath = Join-Path $scriptDir "run-daily.mjs"
$nodePath   = (Get-Command node -ErrorAction SilentlyContinue).Source

if (-not $nodePath) {
    Write-Error "Node.js not found. Install it from https://nodejs.org and re-run this script."
    exit 1
}

$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Task '$taskName' already exists. Delete it first to re-register:" -ForegroundColor Yellow
    Write-Host "  Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
    exit 0
}

$action   = New-ScheduledTaskAction -Execute $nodePath -Argument "`"$scriptPath`"" -WorkingDirectory $scriptDir
$trigger  = New-ScheduledTaskTrigger -Daily -At "08:00AM"
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable

Register-ScheduledTask `
    -TaskName    $taskName `
    -Action      $action `
    -Trigger     $trigger `
    -Settings    $settings `
    -Description "career-ops: fetch new job listings via Apify daily at 8 AM" `
    -RunLevel    Limited | Out-Null

Write-Host "✓ Task '$taskName' created — runs daily at 8:00 AM." -ForegroundColor Green
Write-Host "  To run immediately: Start-ScheduledTask -TaskName '$taskName'"
