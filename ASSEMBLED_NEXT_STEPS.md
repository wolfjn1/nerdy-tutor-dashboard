# Assembled Integration - Next Steps

## Current Status

The Assembled chat integration is currently **DISABLED** due to security policy conflicts. The app is now stable and working without errors.

## What Happened

1. **Hooks Error**: Fixed by moving script loading before conditional returns ✅
2. **CSP/CORS Errors**: Netlify's security policies blocked the external script
3. **Solution**: Added feature flag to disable integration temporarily

## To Re-Enable Assembled Chat

### Option 1: Work with Assembled Support
1. Contact Assembled about CSP requirements
2. Ask if they have specific domains/policies needed
3. Request CORS-enabled endpoints if available

### Option 2: Self-Host the Widget
1. Download the Assembled script
2. Host it on your domain (`/public/assembled-chat.js`)
3. Update script source to local file
4. Removes CORS/CSP issues

### Option 3: Use Assembled's SDK/API
1. Check if Assembled offers an npm package
2. Install as dependency: `npm install @assembled/chat-widget`
3. Import and initialize in React component
4. More control over loading and initialization

### Option 4: Iframe Approach
```jsx
<iframe 
  src="https://cal.assembledhq.com/embed/chat/YOUR_ID"
  style={{ display: showChat ? 'block' : 'none' }}
/>
```

## To Enable Current Integration

1. Edit `app/(dashboard)/layout.tsx`
2. Change `ENABLE_ASSEMBLED_CHAT = true`
3. Deploy and test

## Security Headers Configured

Already added to `netlify.toml`:
- Allows scripts from Assembled domains
- Allows iframes from Assembled
- Permits connection to Assembled APIs
- Includes Google domains for OAuth

## Alternative Solutions

If Assembled continues to have issues:

### 1. Crisp Chat
```html
<script type="text/javascript">
  window.$crisp=[];
  window.CRISP_WEBSITE_ID="YOUR_ID";
</script>
```

### 2. Intercom
```jsx
import Intercom from '@intercom/messenger-js-sdk'
Intercom({ app_id: 'YOUR_APP_ID' })
```

### 3. Custom Solution
Build a simple modal with your own backend

## Recommendation

For now, keep the integration disabled until you can:
1. Test in a staging environment
2. Coordinate with Assembled support
3. Ensure it won't break production

The AI Assistant button will log a message when clicked but won't cause errors. 