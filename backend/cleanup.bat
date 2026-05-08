@echo off
REM Delete Node.js related files
del package.json 2>nul
del package-lock.json 2>nul
del vercel.json 2>nul
rmdir /s /q node_modules 2>nul
echo Node.js files cleaned
