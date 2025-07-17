# CSP and CORS Fix for Assembled Integration

## The Problem

After fixing the hooks error, the app loaded but showed multiple security errors:
1. **CSP Error**: Content Security Policy blocked the Assembled script
2. **CORS Error**: Cross-Origin Resource Sharing blocked requests to Assembled
3. **Permissions Policy**: Payment-related features were blocked

## Root Causes

### 1. Strict Security Headers
Netlify was enforcing strict security policies:
- `X-Frame-Options: DENY` - Prevented any iframe embedding
- No CSP header defined - Browser used restrictive defaults

### 2. External Script Loading
The Assembled script needs to:
- Load from `cal.assembledhq.com`
- Make requests to Google APIs
- Create iframes for the chat widget

## The Fix

### 1. Updated Netlify Headers
Added comprehensive CSP policy in `netlify.toml`:
```toml
Content-Security-Policy = "default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval' 
    https://cal.assembledhq.com 
    https://*.assembledhq.com 
    https://www.gstatic.com 
    https://accounts.google.com; 
  frame-src 'self' 
    https://cal.assembledhq.com 
    https://*.assembledhq.com 
    https://accounts.google.com;"
```

### 2. Relaxed Frame Options
Changed from `DENY` to `SAMEORIGIN`:
```toml
X-Frame-Options = "SAMEORIGIN"
```

### 3. Enhanced Script Loading
Added error handling and CORS attributes:
```javascript
script.crossOrigin = 'anonymous'
script.onerror = (error) => {
  console.error('[Assembled] Failed to load:', error)
}
```

## What This Allows

1. **Script Loading**: Assembled's JavaScript can load from their CDN
2. **API Calls**: The widget can communicate with Assembled's servers
3. **Google Integration**: Allows Google account features if needed
4. **Iframe Creation**: The chat widget can create its UI overlay

## Security Considerations

While we relaxed some policies, we maintained security by:
- Only allowing specific trusted domains
- Keeping XSS protection enabled
- Maintaining CSRF protections
- Limiting frame origins to known sources

## Testing

After deployment, verify:
1. No CSP errors in console
2. AI Assistant button opens the chat widget
3. Widget can load and function properly
4. No security warnings in browser 