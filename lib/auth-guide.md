# Authentication & Multi-Tutor Access Guide

## Overview

This application uses **Supabase Authentication** to provide secure, personalized access for multiple tutors. Each tutor logs in with their email and password to see only their own data - students, sessions, earnings, etc.

## How It Works

### 1. Authentication Flow
- Tutors log in at `/login` with email and password
- Successful login redirects to `/dashboard`
- Session is maintained via secure cookies
- Unauthenticated users are redirected to login

### 2. Data Isolation
- **Row Level Security (RLS)** ensures tutors only see their own data
- No tutor IDs in URLs - everything is based on the authenticated user
- Clean URLs: `/dashboard`, `/students`, `/sessions` etc.

### 3. Personalized Experience
Each tutor sees:
- Their own profile and avatar
- Their assigned students only
- Their sessions and earnings
- Their messages and notifications
- Personalized achievements and progress

## Setting Up Test Accounts

### 1. Seed the Database
```bash
npm run seed
```
This creates 10 test tutors with realistic data.

### 2. Add Authentication
```bash
npm run seed:auth
```
This creates login credentials for all seeded tutors.

### 3. Default Test Accounts
All test tutors use password: `demo123`

Example accounts:
- `sarah.chen@example.com` - Math specialist
- `michael.rodriguez@example.com` - Physics tutor
- `emily.thompson@example.com` - English tutor
- `james.liu@example.com` - Computer Science tutor
- `maria.garcia@example.com` - Language tutor

## Security Features

### 1. Middleware Protection
- All dashboard routes require authentication
- Automatic redirect to login for unauthenticated users
- Prevents authenticated users from accessing login page

### 2. Row Level Security (RLS)
Database policies ensure:
- Tutors can only view their own profile
- Tutors can only see their assigned students
- Tutors can only access their sessions and data
- No cross-tutor data leakage

### 3. Session Management
- Secure cookie-based sessions
- Automatic token refresh
- Logout clears all session data

## Implementation Details

### Auth Context (`lib/auth/auth-context.tsx`)
Provides:
- `user` - Supabase auth user
- `tutor` - Tutor profile from database
- `signIn()` - Login function
- `signUp()` - Registration function
- `signOut()` - Logout function
- `updateProfile()` - Update tutor profile

### Middleware (`middleware.ts`)
- Protects all dashboard routes
- Handles redirects for auth/unauth users
- Maintains clean URL structure

### Usage in Components
```typescript
import { useAuth } from '@/lib/auth/auth-context'

function MyComponent() {
  const { tutor, signOut } = useAuth()
  
  return (
    <div>
      Welcome, {tutor?.first_name}!
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

## Benefits of This Approach

### 1. Security
- No tutor IDs exposed in URLs
- Can't guess or access other tutors' data
- Proper session management

### 2. User Experience
- Clean, simple URLs
- Personalized dashboard
- Seamless navigation

### 3. Scalability
- Easy to add new tutors
- RLS policies scale automatically
- No URL management needed

## Testing Different Tutors

1. Log out (sidebar logout button)
2. Log in with a different tutor email
3. See completely different:
   - Student lists
   - Session schedules
   - Earnings data
   - Messages
   - Everything!

## Troubleshooting

### "Invalid login credentials"
- Check email is correct
- Default password is `demo123`
- Run `npm run seed:auth` if needed

### Can't see any data
- Check RLS policies are applied
- Ensure tutor has `auth_user_id` set
- Verify authentication is working

### Session expired
- Sessions auto-refresh
- If issues persist, logout and login again

## Next Steps

For production:
1. Implement password reset flow
2. Add email verification
3. Enable 2FA options
4. Add OAuth providers (Google, etc)
5. Implement proper password requirements 