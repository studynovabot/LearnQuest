@echo off
echo ================================
echo  OPTIMIZED VERCEL DEPLOYMENT
echo ================================
echo.
echo Serverless Functions Count: 9 (Under Vercel's 12 limit)
echo.
echo Current API Functions:
echo - admin-pdf-upload-fixed.js (PDF Upload System)
echo - ai-services.js (Chat & AI Services)
echo - auth.js (Authentication)
echo - health-check.js (Health Check)
echo - media-services.js (Image Analysis & Generation)
echo - ncert-management.js (NCERT Data Management)
echo - ncert-solutions.js (NCERT Solutions)
echo - tutors.js (Tutor Services)
echo - user-management.js (User Profile & Admin)
echo.
echo Deleted redundant files:
echo - admin-pdf-upload.js (redundant)
echo - admin-pdf-upload-backup.js (backup)
echo - admin-pdf-upload-v2-backup.js (backup)
echo - upload-pdf.js (redundant redirect)
echo - user-profile.js (redundant redirect)
echo.
echo Starting deployment...
echo.

echo Step 1: Building client...
cd client
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Client build failed!
    exit /b 1
)
cd ..

echo.
echo Step 2: Deploying to Vercel...
vercel --prod
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel deployment failed!
    exit /b 1
)

echo.
echo ✅ Deployment completed successfully!
echo ✅ All PDF upload functionality consolidated into single endpoint
echo ✅ Serverless function count optimized for Vercel Hobby plan
echo.
pause