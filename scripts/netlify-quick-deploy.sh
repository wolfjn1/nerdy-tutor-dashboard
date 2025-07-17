#!/bin/bash

echo "🚀 Quick Netlify Deployment"
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

echo "📋 Checking environment..."
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    exit 1
fi

echo "✅ Found .env.local with Supabase credentials"
echo ""

echo "🔐 Logging into Netlify..."
netlify login

echo ""
echo "🏗️  Initializing Netlify site..."
netlify init

echo ""
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🚀 Deploying to Netlify..."
    netlify deploy --prod
    
    echo ""
    echo "🔧 Setting environment variables..."
    
    # Extract values from .env.local
    SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
    SUPABASE_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)
    
    netlify env:set NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"
    netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "$SUPABASE_KEY"
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📍 Test these URLs on your Netlify site:"
    echo "   - /dashboard-static (should work immediately)"
    echo "   - /vercel-test (connectivity tests)"
    echo "   - /api/env-check (environment check)"
    echo "   - /login (full app with auth)"
else
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi 