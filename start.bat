@echo off
rem Switch the console to UTF-8, otherwise text in this file is garbled in a GBK terminal.
chcp 65001 >nul 2>&1
rem CYFIND watchdog launcher script (Windows)
rem
rem Usage:
rem   start.bat                  Run in the foreground (Ctrl-C to stop)
rem   start.bat -addr :9000      Extra arguments are passed through to cyfind as-is
rem
rem It does one thing only: run cyfind.exe, and after the process exits decide whether to relaunch based on the exit code.
rem
rem   0      user stopped normally   -> exit the loop
rem   75     program requested restart -> relaunch immediately (clicked "one-click update" or "rollback" in the UI)
rem   other  crash                   -> relaunch after backoff (1->2->4… up to 60 seconds)
rem
rem Download, SHA256 verification, and swapping in the new binary are not done here; cyfind handles them
rem itself at startup (the selfupdate package). The script stays dead simple; see the notes at the top of start.sh.

setlocal enabledelayedexpansion
cd /d "%~dp0"

set "BIN=cyfind.exe"
if not exist "%BIN%" (
	echo [cyfind] Executable %BIN% not found 1>&2
	exit /b 1
)

set "RESTART_CODE=75"
set "MAX_DELAY=60"
set /a delay=1

:loop
"%BIN%" %*
set "code=!ERRORLEVEL!"

if "!code!"=="0" (
	echo [cyfind] Exited normally
	exit /b 0
)

if "!code!"=="%RESTART_CODE%" (
	rem Update/rollback is ready: after relaunch cyfind completes the swap at startup.
	echo [cyfind] Restart requested (applying the new version)…
	set /a delay=1
	goto loop
)

echo [cyfind] Abnormal exit ^(code=!code!^), restarting in !delay!s 1>&2
rem timeout fails in a redirected console, so fall back to ping (a delay of N seconds needs N+1 pings).
set /a pings=!delay!+1
ping -n !pings! 127.0.0.1 >nul 2>&1
set /a delay=!delay!*2
if !delay! gtr %MAX_DELAY% set /a delay=%MAX_DELAY%
goto loop
