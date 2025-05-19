@echo off
echo Installing Vercel CLI...
npm install -g vercel

echo Deploying to Vercel...
vercel --prod

echo Deployment complete!
