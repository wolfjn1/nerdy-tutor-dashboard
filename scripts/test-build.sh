#!/bin/bash

echo "🔍 Testing build for Vercel deployment..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ ERROR: .env.local file not found!"
    echo "   Create .env.local with your Supabase credentials"
    exit 1
fi

# Check for required environment variables
echo "📋 Checking environment variables..."
if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo "✅ NEXT_PUBLIC_SUPABASE_URL found"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_URL missing"
    exit 1
fi

if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY found"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY missing"
    exit 1
fi

echo ""
echo "🔨 Running build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📝 Next steps for Vercel deployment:"
    echo "1. Make sure these environment variables are set in Vercel:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
    echo "2. Push your changes to Git"
    echo "3. Vercel will automatically deploy"
    echo ""
    echo "🔗 After deployment, test at:"
    echo "   - your-app.vercel.app/api/env-check"
    echo "   - your-app.vercel.app/test-auth"
else
    echo ""
    echo "❌ Build failed! Fix the errors above before deploying."
    exit 1
fi 