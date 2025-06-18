# 🚀 Split Deployment Guide: Vercel + Railway + Neon

## 📋 Overview
This guide will help you deploy your Restaurant Order System using:
- **Frontend (React)**: Vercel (free)
- **Backend (Express)**: Railway (free)
- **Database (PostgreSQL)**: Neon (free)

## 🗄️ Step 1: Set Up Neon Database

### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Click "Sign Up" and create a free account
3. No credit card required

### 1.2 Create Database Project
1. Click "Create New Project"
2. Project name: `restaurant-order-system`
3. Choose region close to you
4. Click "Create Project"

### 1.3 Get Database URL
1. After creation, you'll see a connection string like:
   ```
   postgresql://username:password@host/database?sslmode=require
   ```
2. **Copy and save this URL** - you'll need it for Step 3

---

## 🔧 Step 2: Deploy Backend to Railway

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign up with GitHub

### 2.2 Deploy Backend
1. Click "Deploy from GitHub repo"
2. Select your repository
3. **Important**: Set the root directory to `server`
4. Railway will automatically detect it's a Node.js project

### 2.3 Configure Environment Variables
1. In Railway dashboard, go to "Variables" tab
2. Add these variables:
   ```
   DATABASE_URL = your-neon-database-url-from-step-1
   NODE_ENV = production
   ```
3. Click "Save"

### 2.4 Get Backend URL
1. After deployment, Railway will give you a URL like:
   ```
   https://your-backend-name.railway.app
   ```
2. **Copy and save this URL** - you'll need it for Step 3

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 3.2 Deploy Frontend
1. Click "New Project"
2. Import your GitHub repository
3. **Important**: Set the root directory to `client`
4. Framework: Select "Vite"
5. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3.3 Configure Environment Variables
1. In Vercel dashboard, go to "Settings" → "Environment Variables"
2. Add this variable:
   ```
   VITE_API_URL = your-railway-backend-url-from-step-2
   ```
3. Click "Save"

### 3.4 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your frontend will be live at: `https://your-app.vercel.app`

---

## 🔗 Step 4: Connect Frontend to Backend

### 4.1 Update Frontend API Calls
Your frontend needs to know where your backend is. In your React components, use:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Example API call
fetch(`${API_BASE}/api/customer/current`)
  .then(res => res.json())
  .then(data => console.log(data));
```

### 4.2 Add CORS to Backend
In your `server/index.ts`, add CORS support:

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-app.vercel.app',
  credentials: true
}));
```

---

## 🗄️ Step 5: Set Up Database Tables

### 5.1 Run Database Setup
After both deployments are complete:

1. **Option A**: Use Railway console
   - Go to Railway dashboard
   - Click on your backend service
   - Go to "Deployments" tab
   - Click "Deploy" to trigger a new deployment

2. **Option B**: Run locally with production database
   ```bash
   cd server
   npm install
   DATABASE_URL=your-neon-url npm run db:push
   ```

---

## 🧪 Step 6: Test Your Deployment

### 6.1 Test Frontend
- Visit your Vercel URL
- Test customer registration
- Test product browsing

### 6.2 Test Backend
- Visit `https://your-backend.railway.app/api/health`
- Should return: `{"status":"ok","timestamp":"..."}`

### 6.3 Test Database
- Go to Neon dashboard
- Check if tables are created
- Verify sample data is loaded

---

## 🔧 Troubleshooting

### Frontend Issues
- **Build fails**: Check Vercel logs for errors
- **API calls fail**: Verify `VITE_API_URL` is correct
- **CORS errors**: Check backend CORS configuration

### Backend Issues
- **Deployment fails**: Check Railway logs
- **Database errors**: Verify `DATABASE_URL` is correct
- **Port issues**: Railway automatically handles ports

### Database Issues
- **Connection fails**: Check Neon connection string
- **Tables missing**: Run database setup script
- **Data not loading**: Check initialization script

---

## 📊 Your Final URLs

| Component | URL | Service |
|-----------|-----|---------|
| **Frontend** | `https://your-app.vercel.app` | Vercel |
| **Backend** | `https://your-backend.railway.app` | Railway |
| **Database** | Neon Dashboard | Neon |

---

## 💰 Cost Breakdown

| Service | Free Tier | Your Usage |
|---------|-----------|------------|
| **Vercel** | Unlimited | ✅ Free |
| **Railway** | $5/month credit | ✅ ~$1-2/month |
| **Neon** | 3GB storage | ✅ Free |
| **Total** | **$0** | ✅ Completely free |

---

## 🎉 Congratulations!

Your Restaurant Order System is now live with:
- ✅ Professional hosting
- ✅ Your own database
- ✅ Automatic deployments
- ✅ SSL certificates
- ✅ Global CDN
- ✅ Zero cost

**Share your Vercel URL with the world!** 🌍 