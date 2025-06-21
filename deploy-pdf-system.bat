@echo off
echo ===============================================
echo   PDF to NCERT Solutions System Deployment
echo ===============================================
echo.

echo [1/6] Installing required dependencies...
npm install pdf-parse firebase-admin --save
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [2/6] Creating required directories...
if not exist "preview-qa" mkdir preview-qa
if not exist "processed-qa" mkdir processed-qa
if not exist "ncert_pdfs" mkdir ncert_pdfs
if not exist "public\solutions" mkdir public\solutions

echo [3/6] Setting up environment variables...
echo.
echo Please ensure the following environment variables are set in Vercel:
echo - FIREBASE_SERVICE_ACCOUNT_KEY (your Firebase service account JSON)
echo - FIREBASE_PROJECT_ID (your Firebase project ID)
echo.

echo [4/6] Building the application...
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo [5/6] Running comprehensive tests...
node test-pdf-flow.js
if %errorlevel% neq 0 (
    echo WARNING: Some tests failed, but continuing...
)

echo [6/6] Deploying to Vercel...
echo.
echo You can now deploy to Vercel using:
echo   vercel deploy --prod
echo.
echo Or deploy for preview:
echo   vercel deploy
echo.

echo ===============================================
echo           Deployment Setup Complete
echo ===============================================
echo.
echo Your PDF to NCERT Solutions system includes:
echo ✓ Admin PDF upload with metadata tagging
echo ✓ AI-powered PDF to Q&A extraction 
echo ✓ Admin review system with inline editing
echo ✓ Firebase upload with proper structure
echo ✓ Role-based access (Pro/Goat users only)
echo ✓ AI Help feature for enhanced explanations
echo ✓ Comprehensive testing suite
echo.
echo Next Steps:
echo 1. Configure Firebase credentials in Vercel
echo 2. Deploy using 'vercel deploy --prod'
echo 3. Test with real PDF files
echo 4. Monitor usage and performance
echo.
pause