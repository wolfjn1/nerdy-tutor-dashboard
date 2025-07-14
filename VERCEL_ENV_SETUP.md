# Vercel Environment Variables Setup

## Required Environment Variables

Make sure these are set in your Vercel project settings:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://xxxxxxxxxxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous key
   - Found in Supabase Dashboard > Settings > API

3. **SUPABASE_SERVICE_ROLE_KEY** (optional, for server-side operations)
   - Your Supabase service role key
   - Found in Supabase Dashboard > Settings > API

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Navigate to "Environment Variables"
4. Add each variable with the same values from your `.env.local`
5. Make sure they're available for all environments (Production, Preview, Development)

## Trigger a Fresh Deploy

After adding/updating environment variables:
1. Go to "Deployments" tab
2. Click on the three dots next to the latest deployment
3. Select "Redeploy"
4. Choose "Use existing Build Cache: No" for a clean build 