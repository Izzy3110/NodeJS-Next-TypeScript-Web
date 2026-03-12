@echo off
REM Test the generate_invoice_pdf API endpoint + auto-download result to pdf\downloaded\
setlocal EnableDelayedExpansion

set BASE_URL=https://pizzaservice-pfullendorf.de/api/generate_invoice_pdf
set DOWNLOAD_DIR=%~dp0pdf\downloaded
if not exist "%DOWNLOAD_DIR%" mkdir "%DOWNLOAD_DIR%"

echo Testing %BASE_URL% ...
echo.

echo --- DE ---
for /f "delims=" %%R in ('curl -s -X POST %BASE_URL% -H "Content-Type: application/json" -d "{\"itemIds\": [1, 30, 129], \"lang\": \"de\"}"') do set RESP=%%R
echo !RESP!
for /f "delims=" %%F in ('powershell -NoProfile -Command "('!RESP!' | ConvertFrom-Json).fileName"') do call :Download %%F

echo.
echo --- EN ---
for /f "delims=" %%R in ('curl -s -X POST %BASE_URL% -H "Content-Type: application/json" -d "{\"itemIds\": [1, 30, 129], \"lang\": \"en\"}"') do set RESP=%%R
echo !RESP!
for /f "delims=" %%F in ('powershell -NoProfile -Command "('!RESP!' | ConvertFrom-Json).fileName"') do call :Download %%F

echo.
echo --- Custom client address ---
for /f "delims=" %%R in ('curl -s -X POST %BASE_URL% -H "Content-Type: application/json" -d "{\"itemIds\": [1, 30, 129], \"lang\": \"de\", \"client\": {\"name\": \"Max Mustermann\", \"email\": \"max@beispiel.de\", \"tel\": [\"+49 7531 123456\"], \"address\": {\"client_address_line_1\": \"Musterstrasse 1\", \"client_address_plz\": 78462, \"client_address_city\": \"Konstanz\"}}}"') do set RESP=%%R
echo !RESP!
for /f "delims=" %%F in ('powershell -NoProfile -Command "('!RESP!' | ConvertFrom-Json).fileName"') do call :Download %%F

echo.
echo All done. Files saved to: %DOWNLOAD_DIR%
pause
goto :eof

:Download
set FNAME=%1
echo Downloading %FNAME% ...
.\venv\Scripts\python.exe -c "import asyncio,asyncssh,sys,os; asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy()); asyncio.run(__import__('asyncio').coroutine(lambda: None)()); conn = None; [asyncio.run(type('_',(),{'__call__': lambda self: asyncssh.connect('46.225.3.88',username='root',client_keys=['privkey'],known_hosts=None)})()()); ]" 2>nul
.\venv\Scripts\python.exe -W ignore -c "
import asyncio, asyncssh, sys, os
FNAME = '%FNAME%'
LOCAL = os.path.join(r'%DOWNLOAD_DIR%', FNAME)
REMOTE = '/home/node_user/pdf/generated/' + FNAME
async def dl():
    async with asyncssh.connect('46.225.3.88', username='root', client_keys=['privkey'], known_hosts=None) as conn:
        async with conn.start_sftp_client() as sftp:
            await sftp.get(REMOTE, LOCAL)
            print('  Saved:', LOCAL)
asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
asyncio.run(dl())
"
goto :eof
