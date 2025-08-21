# 🚀 Vercel Deployment Guide

## Quick Setup (5 minutes)

### 1. Connect to Vercel
Go to: https://vercel.com/new

1. **Import from GitHub**: Click "Import Git Repository"
2. **Select**: `ukogan/emerald-hills-weather`
3. **Import Project**: Click "Import"

### 2. Configure Environment Variables
In the deployment settings, add:

```
OPENWEATHER_API_KEY=4fbec2f0bcd64a22cee817d71c8f5908
NODE_ENV=production
PORT=3001
```

### 3. Deploy
Click **"Deploy"** - Vercel will:
- Build your Node.js API
- Deploy to a live URL like `https://emerald-hills-weather-xxx.vercel.app`
- Automatically deploy on every GitHub push

## Alternative: CLI Deployment

If you prefer command line:

```bash
# Login (choose GitHub)
vercel login

# Deploy
vercel --prod

# Add environment variable
vercel env add OPENWEATHER_API_KEY production
# Enter: 4fbec2f0bcd64a22cee817d71c8f5908
```

## What You'll Get

✅ **Live API**: `https://your-app.vercel.app/api/health`  
✅ **Auto-deploy**: Updates on every GitHub push  
✅ **HTTPS**: Secure SSL certificate  
✅ **Global CDN**: Fast worldwide access  
✅ **Monitoring**: Built-in analytics  

## Test Your Live API

Once deployed, test these endpoints:
- `https://your-app.vercel.app/api/health`
- `https://your-app.vercel.app/api/weather/test`
- `https://your-app.vercel.app/api/weather/current`

Your weather dashboard will be live on the internet! 🌐