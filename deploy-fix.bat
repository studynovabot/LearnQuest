@echo off
echo Deploying API fixes to Vercel...

REM Add all changes
git add .

REM Commit changes
git commit -m "Fix: API endpoints - Use Firebase Admin SDK and add fallback test API"

REM Push to main branch (triggers Vercel deployment)
git push origin main

echo.
echo Deploy completed! Changes should be live in a few minutes.
echo Check deployment status at: https://vercel.com/dashboard
pause