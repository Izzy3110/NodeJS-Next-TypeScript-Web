# test_submit_order.ps1
# Manually test the /api/submit_order endpoint and then poll the print queue

$BASE_URL = "https://pizzaservice-pfullendorf.de"
$API_KEY  = "sk_1ba100e50a266fd8ef3a64daa8cbc775c2ddd9da6bd2cdf6"

$headers = @{
    "Authorization" = "Bearer $API_KEY"
    "Content-Type"  = "application/json"
}

# ── 1. Submit order (empty body → mock order) ──────────────────────────────
Write-Host "`n[1/2] Submitting mock order..." -ForegroundColor Cyan

$orderResponse = Invoke-WebRequest `
    -Uri     "$BASE_URL/api/submit_order" `
    -Method  POST `
    -Headers $headers `
    -Body    "{}" `
    -UseBasicParsing

$order = $orderResponse.Content | ConvertFrom-Json
Write-Host "Response:" -ForegroundColor Green
$order | ConvertTo-Json -Depth 5

# ── 2. Poll print queue immediately ────────────────────────────────────────
Write-Host "`n[2/2] Polling print queue..." -ForegroundColor Cyan

$pollResponse = Invoke-WebRequest `
    -Uri     "$BASE_URL/api/poll-print-jobs" `
    -Method  GET `
    -Headers @{ "Authorization" = "Bearer $API_KEY" } `
    -UseBasicParsing

$poll = $pollResponse.Content | ConvertFrom-Json
Write-Host "Response:" -ForegroundColor Green

if ($poll.job) {
    Write-Host "  Job ID   : $($poll.job.id)"      -ForegroundColor Yellow
    Write-Host "  Filename : $($poll.job.filename)" -ForegroundColor Yellow
    Write-Host "  Created  : $($poll.job.created_at)"
    Write-Host "  Content  : [base64, $($poll.job.content.Length) chars]"
} else {
    Write-Host "  No pending job found (already consumed by the auto-printer)." -ForegroundColor DarkYellow
}
