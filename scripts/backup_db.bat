@echo off
set TIMESTAMP=%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=backups/db_dump_%TIMESTAMP%.sql

echo Backing up database 'localdb' to %BACKUP_FILE%...
mariadb-dump.exe -u dbuser -pqwert localdb > "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo Database backup successful.
) else (
    echo Database backup failed!
    exit /b %ERRORLEVEL%
)
