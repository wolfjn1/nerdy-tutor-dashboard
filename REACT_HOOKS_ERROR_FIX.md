# React Hooks Error Fix

## The Error

The app was showing "Something went wrong!" with a React hooks error (#310) indicating that hooks were being called conditionally or in different orders between renders.

## Root Cause

The `DashboardLayout` component had a structural issue:

1. It was using hooks (`useState`, `useEffect`, `useAuth`)
2. Then returning `<SimpleAuthProvider>` which wrapped `<DashboardContent>`
3. But `DashboardContent` was trying to use `useAuth()` which depends on the context from `SimpleAuthProvider`

This created a circular dependency and violated React's rules of hooks.

## The Fix

### Before (Broken):
```jsx
export default function DashboardLayout({ children }) {
  // ❌ These hooks were defined but never used
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { tutor, loading } = useAuth() // ❌ Can't use this here!
  const { setTutor } = useTutorStore()
  
  useEffect(() => {
    // Sync logic
  }, [tutor, setTutor])

  return (
    <SimpleAuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </SimpleAuthProvider>
  )
}
```

### After (Fixed):
```jsx
export default function DashboardLayout({ children }) {
  // ✅ Clean component with no hooks
  return (
    <SimpleAuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </SimpleAuthProvider>
  )
}

function DashboardContent({ children }) {
  // ✅ All hooks moved here where they're actually used
  const { user, tutor, loading } = useAuth()
  const { setTutor } = useTutorStore()
  
  useEffect(() => {
    // Sync logic now works correctly
  }, [tutor, setTutor])
  
  // Rest of component...
}
```

## Key Takeaways

1. **Hook Order Matters**: React requires hooks to be called in the same order every render
2. **Context Consumers**: Components using `useContext` must be inside the provider
3. **Clean Structure**: Parent components that only provide context should be simple wrappers
4. **No Unused Code**: Removed hooks that were defined but never used

## Prevention

To avoid this in the future:
- Keep provider components simple
- Don't use hooks in components that are primarily wrappers
- Ensure all hooks are actually used in the component
- Test auth flows thoroughly after structural changes 