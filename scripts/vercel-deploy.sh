#!/bin/bash

echo "🚀 Vercel Deployment Helper"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "📋 Current Environment Variables in .env.local:"
grep "NEXT_PUBLIC_SUPABASE" .env.local || echo "No Supabase vars found in .env.local"
echo ""

echo "Choose deployment option:"
echo "1) Deploy to NEW Vercel project (recommended)"
echo "2) Redeploy to existing project"
echo "3) Deploy without GitHub integration"
echo "4) Just set environment variables"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "Creating new Vercel project..."
        vercel --yes --name nerdy-tutor-dashboard-new
        
        echo ""
        echo "Setting environment variables..."
        vercel env add NEXT_PUBLIC_SUPABASE_URL production < .env.local
        vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production < .env.local
        
        echo ""
        echo "Redeploying with env vars..."
        vercel --prod
        ;;
        
    2)
        echo "Redeploying to existing project..."
        vercel --prod --yes
        ;;
        
    3)
        echo "Deploying without GitHub..."
        vercel --no-github --yes
        ;;
        
    4)
        echo "Setting environment variables only..."
        echo "Paste your Supabase URL:"
        read SUPABASE_URL
        echo "Paste your Supabase Anon Key:"
        read SUPABASE_KEY
        
        echo $SUPABASE_URL | vercel env add NEXT_PUBLIC_SUPABASE_URL production
        echo $SUPABASE_KEY | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
        
        echo "Environment variables set. Run 'vercel --prod' to redeploy."
        ;;
        
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Done! Test these URLs after deployment:"
echo "   - /dashboard-static (no auth required)"
echo "   - /vercel-test (connectivity tests)"
echo "   - /api/env-check (environment check)" 