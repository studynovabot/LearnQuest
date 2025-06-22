@echo off
echo 🚀 Deploying PDF Upload Fixes...
echo ================================

echo 📦 Installing dependencies...
npm install

echo 🔧 Building the project...
npm run build

echo 🌐 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo 🧪 Test the fixes at your Vercel URL

pause