# Supabase Authentication URLs Configuration

## For Netlify Deployment

When your app is deployed on Netlify, you need to configure the following URLs in your Supabase project:

### 1. Site URL
This is where users are redirected after email confirmation.
```
https://nerdy-tutor-dashboard.netlify.app
```

### 2. Redirect URLs (Allow List)
Add all URLs where authentication callbacks should be allowed:
```
https://nerdy-tutor-dashboard.netlify.app/**
https://nerdy-tutor-dashboard.netlify.app
https://nerdy-tutor-dashboard.netlify.app/login
https://nerdy-tutor-dashboard.netlify.app/register
https://nerdy-tutor-dashboard.netlify.app/dashboard
```

### 3. For Local Development
Also add your local development URL:
```
http://localhost:3000/**
http://localhost:3000
```

## How to Configure in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Set the **Site URL** to your Netlify URL
4. Add all the redirect URLs to the **Redirect URLs** allow list
5. Click **Save**

## Environment Variables for Netlify

Make sure these are set in Netlify:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (if needed)

## Important Notes

1. **Include the wildcard**: The `/**` at the end allows all subpaths
2. **HTTPS for production**: Netlify uses HTTPS, make sure your URLs reflect this
3. **No trailing slashes**: Supabase is sensitive to trailing slashes
4. **Email templates**: Update email templates in Supabase to use your Netlify URL

## Testing Authentication Flow

After configuration:
1. Test registration flow
2. Test login flow
3. Test password reset (if implemented)
4. Test email confirmation (if enabled)

## Common Issues

- **Redirect mismatch**: Ensure the redirect URL in your code matches exactly what's in Supabase
- **Missing wildcard**: Without `/**`, deep links won't work
- **HTTP vs HTTPS**: Production must use HTTPS 