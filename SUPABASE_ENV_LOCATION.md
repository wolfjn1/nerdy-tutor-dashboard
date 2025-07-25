# Finding Your Supabase Environment Variables

## In Supabase Dashboard:

1. **Project URL** (for NEXT_PUBLIC_SUPABASE_URL):
   - Look for: "Project URL"
   - Format: `https://[your-project-id].supabase.co`
   - Example: `https://xyzabc123.supabase.co`

2. **anon public key** (for NEXT_PUBLIC_SUPABASE_ANON_KEY):
   - Look for: "anon public" key (NOT the "service_role" key!)
   - Format: Long string starting with `eyJ...`
   - This is safe to use in frontend code

## Your .env.local should look like:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...rest-of-your-key
```

## Important Notes:
- Use the "anon public" key, NOT the "service_role" key
- No quotes around the values in .env.local
- Make sure there are no trailing spaces 