@echo off
echo Deploying NCERT Solutions API fixes to Vercel...

REM Add all changes
git add .

REM Commit changes
git commit -m "Fix: Route NCERT endpoints to test API with mock data and fix manifest"

REM Push to main branch (triggers Vercel deployment)
git push origin main

echo.
echo Deploy completed! Changes should be live in a few minutes.
echo.
echo Test endpoints after deployment:
echo https://studynovaai.vercel.app/api/ncert-solutions
echo https://studynovaai.vercel.app/api/ncert-solutions/stats
echo.
echo Check deployment status at: https://vercel.com/dashboard
pause