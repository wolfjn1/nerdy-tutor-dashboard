# Cookie-less Authentication Guide

## Overview

This application gracefully handles scenarios where cookies are disabled or unavailable by implementing multiple fallback authentication methods.

## Storage Hierarchy

The system automatically detects and uses the best available storage method:

1. **Cookies** (Primary)
   - Most secure and reliable
   - Survives browser restarts
   - Works with SSR

2. **LocalStorage** (First fallback)
   - Persists across browser sessions
   - Works in most browsers
   - Warning: Visible on shared computers

3. **SessionStorage** (Second fallback)
   - Only lasts for browser session
   - More secure on shared computers
   - Lost when browser closes

4. **Memory Storage** (Last resort)
   - Only lasts while tab is open
   - No persistence whatsoever
   - Users see prominent warning

## Authentication Methods

### 1. Standard Cookie-based Auth
- Default method using Supabase session cookies
- Automatic token refresh
- Most seamless experience

### 2. Token-based Auth
When cookies fail, the system:
- Stores JWT tokens in available storage
- Manually manages token refresh
- Provides same functionality with limitations

### 3. Magic Link Authentication
For users who can't use cookies:
- Email-based authentication
- No password required
- Works with limited storage
- Each login requires email verification

### 4. URL Token Auth (Emergency)
For extreme cases:
- Token passed via URL parameter
- One-time use
- Automatically cleaned from URL
- Very limited persistence

## User Experience

### Storage Warnings
Users see appropriate warnings based on their storage situation:

- **Memory Storage**: "Authentication will be lost when you close this tab. Please enable cookies for a better experience."
- **SessionStorage**: "You will need to log in again when you close your browser."
- **LocalStorage**: "Authentication is stored locally. Be cautious on shared computers."

### Visual Indicators
- Yellow warning banner at top of dashboard
- Dismissible but reappears on next login
- Clear explanation of limitations

## Implementation Details

### Storage Adapter (`lib/auth/storage-adapter.ts`)
```typescript
// Automatically detects best storage method
const adapter = new AuthStorageAdapter()

// Falls back gracefully:
// cookies → localStorage → sessionStorage → memory
```

### Token Manager (`lib/auth/token-auth.ts`)
```typescript
// Manages tokens regardless of storage method
const tokenManager = new TokenAuthManager()

// Provides consistent API:
await tokenManager.storeTokens(tokens)
await tokenManager.getTokens()
await tokenManager.clearTokens()
```

### Auth Context Updates
The auth context now:
- Detects storage capabilities
- Manages tokens alongside cookies
- Provides storage warnings
- Handles URL tokens

## Common Scenarios

### Corporate Environments
Many corporate browsers disable cookies:
- System falls back to localStorage
- Users see appropriate warning
- Full functionality maintained

### Incognito/Private Mode
Storage heavily restricted:
- Falls back to sessionStorage
- Magic links recommended
- Session lost on close

### Embedded iframes
Third-party cookie restrictions:
- Token-based auth works
- May need URL token passing
- Consider same-origin hosting

### Strict Privacy Settings
All storage blocked:
- Memory storage only
- Prominent warnings shown
- Magic links still work

## Security Considerations

### Token Storage
- Tokens encrypted where possible
- Short expiration times
- Refresh tokens rotated
- Clear on logout

### URL Tokens
- One-time use only
- Short expiration (5 minutes)
- Immediately cleaned from URL
- Only for emergency access

### Storage Warnings
- Users informed of risks
- Shared computer warnings
- Logout reminders
- Clear persistence indicators

## Best Practices

### For Developers
1. Always check `storageWarning` from auth context
2. Show appropriate UI warnings
3. Encourage cookie enabling
4. Provide magic link option

### For Users
1. Enable cookies for best experience
2. Use magic links on restricted devices
3. Always logout on shared computers
4. Be aware of persistence limitations

## Testing

### Disable Cookies
1. Browser settings → Privacy → Block all cookies
2. Test fallback to localStorage
3. Verify warnings appear

### Simulate No Storage
```javascript
// In console:
Object.defineProperty(window, 'localStorage', { value: null });
Object.defineProperty(window, 'sessionStorage', { value: null });
```

### Test Magic Links
1. Click "Magic Link" on login
2. Check email
3. Verify login works
4. Check persistence

## Troubleshooting

### "Cannot store authentication"
- All storage methods blocked
- Try different browser
- Check privacy extensions
- Use magic link

### "Session lost on refresh"
- Using memory storage
- Enable cookies
- Try localStorage
- Use magic link for persistence

### "Cannot read tokens"
- Storage corrupted
- Clear browser data
- Try incognito mode
- Contact support

## Future Enhancements

1. **WebAuthn Support**
   - Hardware key authentication
   - No storage needed
   - Most secure option

2. **Service Worker Auth**
   - Background token refresh
   - Better offline support
   - Improved persistence

3. **Native App Wrappers**
   - Secure native storage
   - Biometric authentication
   - No browser restrictions 