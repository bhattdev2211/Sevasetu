@echo off
title Upload SevaSetu to GitHub
echo =======================================================
echo          SevaSetu -- Upload Project to GitHub
echo =======================================================
echo.

set "GIT_CMD=C:\Users\bhatt\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"
if not exist "%GIT_CMD%" set "GIT_CMD=git"

echo Target Repository: https://github.com/bhattdev2211/Sevasetu.git
echo Current Branch: main
echo.
echo Pushing committed code to GitHub...
echo (If prompted, click 'Sign in with your browser' or enter your GitHub credentials)
echo.

"%GIT_CMD%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =======================================================
    echo [SUCCESS] Your full project has been uploaded to GitHub!
    echo Visit: https://github.com/bhattdev2211/Sevasetu
    echo =======================================================
) else (
    echo.
    echo =======================================================
    echo [NOTICE] Push required authentication.
    echo If browser sign-in did not complete, you can also push
    echo using a GitHub Personal Access Token:
    echo   git push https://^<YOUR_TOKEN^>@github.com/bhattdev2211/Sevasetu.git main
    echo =======================================================
)

echo.
pause
