# 🚀 Deployment Checklist

## Step 1: Database Setup (Neon)
- [ ] Go to [neon.tech](https://neon.tech)
- [ ] Create account
- [ ] Create new project
- [ ] Copy database connection string
- [ ] Save it for Step 3

## Step 2: Push Code to GitHub
- [ ] Create GitHub repository
- [ ] Push your code to GitHub
- [ ] Make sure all files are committed

## Step 3: Deploy to Railway
- [ ] Go to [railway.app](https://railway.app)
- [ ] Create account
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Connect GitHub account
- [ ] Select your repository
- [ ] Wait for initial build

## Step 4: Configure Environment Variables
- [ ] In Railway dashboard, go to "Variables" tab
- [ ] Add `DATABASE_URL` = your Neon database URL
- [ ] Add `NODE_ENV` = production
- [ ] Save variables

## Step 5: Set Up Database
- [ ] After deployment, go to Railway dashboard
- [ ] Click on your service
- [ ] Go to "Deployments" tab
- [ ] Click "Deploy" to trigger a new deployment
- [ ] Wait for deployment to complete

## Step 6: Initialize Database (Optional)
- [ ] In Railway dashboard, go to "Settings" tab
- [ ] Find "Custom Domains" section
- [ ] Copy your app URL (e.g., https://your-app.railway.app)
- [ ] Your app should now be live!

## Step 7: Test Your App
- [ ] Visit your app URL
- [ ] Test customer registration
- [ ] Test product browsing
- [ ] Test order placement

## Troubleshooting
- If you see database errors, make sure `DATABASE_URL` is correct
- If build fails, check Railway logs for errors
- If app doesn't load, check if port 5000 is being used correctly

## Your App URLs
- **Frontend + Backend**: https://your-app.railway.app
- **Database**: Neon dashboard
- **Railway Dashboard**: railway.app/dashboard

## Next Steps
- [ ] Add custom domain (optional)
- [ ] Set up monitoring
- [ ] Add SSL certificate (automatic with Railway)
- [ ] Configure backups

🎉 **Congratulations! Your restaurant order system is now live!** 