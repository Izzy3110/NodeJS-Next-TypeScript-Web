# test_submit_order-items.ps1
# Test the /api/submit_order endpoint with a specific set of items:
# - 3 x "Red Bull" (ID 148)
# - 1 x "Frühlingsrollen" (ID 13)
# - 1 x "Margherita" (ID 21, size M)

$BASE_URL = "https://pizzaservice-pfullendorf.de"
$API_KEY  = "sk_1ba100e50a266fd8ef3a64daa8cbc775c2ddd9da6bd2cdf6"

$headers = @{
    "Authorization" = "Bearer $API_KEY"
    "Content-Type"  = "application/json"
}

# Item structure for the API:
# items: Array of { itemId: number, quantity: number }
$body = @{
    itemIds = @(148, 148, 148, 13, 21)
    lang    = "de"
    client  = @{
        name    = "Max Mustermann"
        email   = "max@example.com"
        address = @{
            client_address_line_1 = "Musterstraße 42"
            client_address_plz    = "88630"
            client_address_city   = "Pfullendorf"
        }
    }
} | ConvertTo-Json -Depth 5

Write-Host "`n[1/2] Submitting specific order..." -ForegroundColor Cyan
Write-Host "Items: 3x Red Bull, 1x Frühlingsrollen, 1x Margherita" -ForegroundColor Gray

$orderResponse = Invoke-WebRequest `
    -Uri     "$BASE_URL/api/submit_order" `
    -Method  POST `
    -Headers $headers `
    -Body    $body `
    -UseBasicParsing

$order = $orderResponse.Content | ConvertFrom-Json
Write-Host "Response:" -ForegroundColor Green
$order | ConvertTo-Json -Depth 5

# ── 2. Poll print queue ──────────────────────────────────────────────
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
    Write-Host "  Content  : [base64, $($poll.job.content.Length) chars]"
} else {
    Write-Host "  No pending job found (check printer client)." -ForegroundColor DarkYellow
}
