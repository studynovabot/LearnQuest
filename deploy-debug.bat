@echo off
echo Deploying fixes for admin PDF upload...

echo Installing dependencies...
cd api
npm install
cd ..

echo Deploying to Vercel...
vercel --prod

echo Deployment complete!
pause