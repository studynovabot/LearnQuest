@echo off
echo 🚀 Deploying NCERT Solutions System...

echo.
echo 📦 Installing API dependencies...
cd api
call npm install
cd ..

echo.
echo 📦 Installing client dependencies...
cd client
call npm install
cd ..

echo.
echo 🏗️ Building client...
cd client
call npm run build
cd ..

echo.
echo 🔧 Setting up solution system...
node setup-solutions.js

echo.
echo ✅ NCERT Solutions system is ready!
echo.
echo 🌐 To start development:
echo   1. Start the backend: npm run dev
echo   2. Start the client: cd client && npm run dev
echo   3. Go to /admin-solutions to upload solutions
echo   4. Students can access at /ncert-solutions
echo.
echo 🤖 AI Help is integrated and ready!
echo.
pause