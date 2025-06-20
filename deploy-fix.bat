@echo off
echo Deploying NCERT Solutions with REAL PDF DATA to Vercel...

REM Add all changes
git add .

REM Commit changes
git commit -m "feat: Replace mock data with real NCERT PDF processing - Class 10 Science Ch1"

REM Push to main branch (triggers Vercel deployment)
git push origin main

echo.
echo Deploy completed! Changes should be live in a few minutes.
echo.
echo Real endpoints with PDF data:
echo https://studynovaai.vercel.app/api/ncert-solutions
echo https://studynovaai.vercel.app/api/ncert-solutions/stats
echo.
echo ✅ Now using REAL data from: Class 10 Science Chapter 1 Chemical Reactions And Equations
echo ❌ Mock data has been REMOVED
echo.
echo Check deployment status at: https://vercel.com/dashboard
pause