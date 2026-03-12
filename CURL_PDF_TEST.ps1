# Invoice PDF Test Script
# Calls the remote API, then downloads generated PDFs to ./pdf/downloaded/

$BASE_URL = "https://pizzaservice-pfullendorf.de/api/generate_invoice_pdf"
$PYTHON = ".\venv\Scripts\python.exe"
$LOCAL_DIR = ".\pdf\downloaded"
New-Item -ItemType Directory -Force -Path $LOCAL_DIR | Out-Null

function Invoke-InvoiceApi($Body) {
    $json = $Body | ConvertTo-Json -Depth 5 -Compress
    $response = Invoke-RestMethod -Uri $BASE_URL -Method Post -Body $json -ContentType "application/json"
    Write-Host "  success:  $($response.success)"
    Write-Host "  fileName: $($response.fileName)"
    Write-Host "  fileSize: $($response.fileSize) bytes"
    if ($response.fileName) {
        Write-Host "  Downloading..."
        & $PYTHON download_pdf.py $response.fileName $LOCAL_DIR
    }
    return $response
}

Write-Host ""
Write-Host "=== DE ===" -ForegroundColor Cyan
Invoke-InvoiceApi @{ itemIds = @(1, 30, 129); lang = "de" }

Write-Host ""
Write-Host "=== EN ===" -ForegroundColor Cyan
Invoke-InvoiceApi @{ itemIds = @(1, 30, 129); lang = "en" }

Write-Host ""
Write-Host "=== Custom client address (DE) ===" -ForegroundColor Cyan
Invoke-InvoiceApi @{
    itemIds = @(1, 30, 129)
    lang    = "de"
    client  = @{
        name    = "Max Mustermann"
        email   = "max@mein-beispiel.de"
        tel     = @("+49 7531 123456")
        address = @{
            client_address_line_1 = "Musterstrasse 1"
            client_address_line_2 = ""
            client_address_plz    = 78462
            client_address_city   = "Konstanz"
        }
    }
}

Write-Host ""
Write-Host "Done. Files saved to: $((Resolve-Path $LOCAL_DIR).Path)" -ForegroundColor Green
