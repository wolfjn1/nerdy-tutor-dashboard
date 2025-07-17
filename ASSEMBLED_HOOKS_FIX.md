# Assembled Integration Hooks Fix

## The Problem

After adding the Assembled AI chat integration, the app got stuck showing "Loading..." and wouldn't progress to the dashboard.

## Root Cause

When we added the Assembled script loading, we placed the `useEffect` hook AFTER several conditional returns:

```jsx
// ❌ WRONG - Hooks after conditional returns
function DashboardContent({ children }) {
  const { user, tutor, loading } = useAuth()
  
  // Early returns
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <div>Redirecting...</div>
  }
  
  // ❌ Hook called after conditional returns!
  useEffect(() => {
    // Load Assembled script
  }, [])
}
```

This violates React's #1 rule: **Hooks must be called in the same order every render**.

## The Fix

Moved the Assembled script loading `useEffect` to BEFORE all conditional returns:

```jsx
// ✅ CORRECT - All hooks before any returns
function DashboardContent({ children }) {
  const { user, tutor, loading } = useAuth()
  
  // ✅ Hook called before any returns
  useEffect(() => {
    // Load Assembled script
  }, [])
  
  // Now safe to have conditional returns
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <div>Redirecting...</div>
  }
}
```

## Key Lessons

1. **Always place ALL hooks before ANY conditional returns**
2. **The order matters**: useState, useEffect, custom hooks - all must come first
3. **Even `useEffect` with empty deps `[]` must follow this rule**

## Why This Caused "Loading..." to Stick

React detected the hooks violation and threw error #310, which prevented the component from rendering properly. The auth was actually working (we could see "SIGNED_IN" in console), but React couldn't proceed past the error.

## Prevention

When adding new features that use hooks:
1. Add them at the top of the component
2. Never add hooks inside conditions, loops, or after returns
3. Use ESLint rules for hooks to catch these errors early 