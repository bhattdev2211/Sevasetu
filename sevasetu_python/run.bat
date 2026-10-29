@echo off
set "PATH=C:\Users\bhatt\AppData\Local\Python\bin;C:\Users\bhatt\AppData\Local\Python\pythoncore-3.14-64;%PATH%"
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python app.py %*
) else (
    py app.py %*
)
