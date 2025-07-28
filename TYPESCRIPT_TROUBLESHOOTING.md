# TypeScript Troubleshooting Guide

## Common TypeScript Build Errors & Solutions

### 1. Element implicitly has an 'any' type

**Error:**
```
Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Record<SomeType, {...}>'
```

**Solution:**
Add explicit type assertions when indexing objects:
```typescript
// Before
const config = bonusTypeConfig[bonus.bonus_type];

// After
const config = bonusTypeConfig[bonus.bonus_type as BonusType];
```

### 2. Property does not exist on type 'IntrinsicAttributes'

**Error:**
```
Type '{ tutorId: string; }' is not assignable to type 'IntrinsicAttributes'.
Property 'tutorId' does not exist on type 'IntrinsicAttributes'.
```

**Solution:**
Remove props that components don't expect:
```typescript
// Before
<BonusTracker tutorId={tutorId} />

// After
<BonusTracker />
```

### 3. Parameter implicitly has an 'any' type

**Error:**
```
Parameter 'b' implicitly has an 'any' type.
```

**Solution:**
Add explicit type annotations to function parameters:
```typescript
// Before
bonuses.filter(b => b.status === 'pending')

// After
bonuses.filter((b: BonusData) => b.status === 'pending')
```

### 4. Cannot find module or type declarations

**Error:**
```
Cannot find module '@/lib/hooks/useBonusManagement' or its corresponding type declarations.
```

**Solution:**
Import from index files and ensure types are exported:
```typescript
// Before
import { useBonusManagement, BonusData } from '@/lib/hooks/useBonusManagement';

// After
import { useBonusManagement, BonusData } from '@/lib/hooks';

// In lib/hooks/index.ts
export { useBonusManagement } from './useBonusManagement';
export type { BonusData } from './useBonusManagement';
```

## Best Practices

### 1. Type Your Data Structures
Always define interfaces for your data:
```typescript
interface BonusData {
  id: string;
  bonus_type: BonusType; // Use enums/unions, not string
  status: BonusStatus;   // Use enums/unions, not string
  // ... other fields
}
```

### 2. Export Types from Index Files
Make types available through barrel exports:
```typescript
// lib/hooks/index.ts
export { useMyHook } from './useMyHook';
export type { MyDataType } from './useMyHook';
```

### 3. Use Type Assertions Carefully
Only use type assertions when you're certain about the type:
```typescript
// Good - we know the API returns these specific values
const tier = data.tier as TutorTier;

// Bad - could hide runtime errors
const anything = someValue as any;
```

### 4. Check Component Props
Ensure components define and use the props they expect:
```typescript
// Define props interface
interface MyComponentProps {
  requiredProp: string;
  optionalProp?: number;
}

// Use in component
export function MyComponent({ requiredProp, optionalProp }: MyComponentProps) {
  // ...
}
```

## Build Process Tips

### Local Testing
Always test the build locally before pushing:
```bash
npm run build
```

### Check for Type Errors
Run TypeScript compiler directly:
```bash
npx tsc --noEmit
```

### Clean Build
If experiencing strange errors, try a clean build:
```bash
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

## Common Patterns

### Config Objects with Type Keys
When using objects as maps with typed keys:
```typescript
const config: Record<BonusType, ConfigItem> = {
  student_retention: { /* ... */ },
  session_milestone: { /* ... */ },
  // ... all enum values must be present
};

// Usage with type assertion
const item = config[value as BonusType];
```

### Hook Return Types
Always type your custom hook returns:
```typescript
interface UseMyHookReturn {
  data: MyData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useMyHook = (): UseMyHookReturn => {
  // ...
};
```

This guide should help prevent and quickly resolve TypeScript issues in the future! 