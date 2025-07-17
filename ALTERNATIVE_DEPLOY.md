# Alternative Deployment Options

If Netlify continues to have issues, here are tested alternatives:

## 1. Render (Recommended)
**Why**: Excellent Next.js support, simple setup, reliable builds

```bash
# Deploy with Render
# 1. Go to https://render.com
# 2. Connect GitHub
# 3. Select repository
# 4. It will auto-detect render.yaml
# 5. Add environment variables in dashboard
```

## 2. Railway
**Why**: One-click deploys, great developer experience

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway up

# Add environment variables
railway variables set NEXT_PUBLIC_SUPABASE_URL="your-url"
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"
```

## 3. Fly.io
**Why**: Global edge deployment, fast

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly secrets set NEXT_PUBLIC_SUPABASE_URL="your-url"
fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"
fly deploy
```

## 4. DigitalOcean App Platform
**Why**: Simple, reliable, good pricing

1. Go to https://cloud.digitalocean.com/apps
2. Create new app
3. Connect GitHub
4. Auto-detects Next.js
5. Add env vars in settings

## 5. Direct VPS Deployment (Ultimate Control)

```bash
# On a Ubuntu VPS
sudo apt update
sudo apt install nodejs npm nginx

# Clone and build
git clone https://github.com/wolfjn1/nerdy-tutor-dashboard
cd nerdy-tutor-dashboard
npm install
npm run build
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start npm --name "tutor-dashboard" -- start
```

## Quick Test URLs
After deployment on any platform:
- `/dashboard-static` - Test basic functionality
- `/api/env-check` - Verify environment variables
- `/vercel-test` - Check connectivity 