// Debug script to check what's happening with the achievement components
// Run this in the browser console on the achievements page

console.log('=== DEBUGGING ACHIEVEMENT COMPONENTS ===');

// Check for React DevTools
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('✓ React DevTools detected');
} else {
  console.log('✗ React DevTools not found - install React Developer Tools extension for better debugging');
}

// Check localStorage for any cached data
console.log('\n=== LocalStorage Check ===');
const storageKeys = Object.keys(localStorage);
const supabaseKeys = storageKeys.filter(key => key.includes('supabase'));
console.log('Supabase keys in localStorage:', supabaseKeys.length);
supabaseKeys.forEach(key => {
  console.log(`- ${key}`);
});

// Check for error boundaries
console.log('\n=== Checking for Errors ===');
const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
console.log('Error elements found:', errorElements.length);
errorElements.forEach(el => {
  console.log('- Error element:', el.className, el.textContent?.substring(0, 100));
});

// Check loading states
console.log('\n=== Loading States ===');
const loadingElements = document.querySelectorAll('[class*="loading"], [class*="Loading"], [class*="skeleton"], [class*="Skeleton"], [class*="animate-pulse"]');
console.log('Loading elements found:', loadingElements.length);
loadingElements.forEach(el => {
  console.log('- Loading element:', el.className);
});

// Check for card containers
console.log('\n=== Card Containers ===');
const cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
console.log('Card elements found:', cards.length);

// Check specific component areas
console.log('\n=== Component Areas ===');
const componentChecks = [
  { name: 'Points Display', selectors: ['[class*="points"]', '[class*="Points"]'] },
  { name: 'Tier Progress', selectors: ['[class*="tier"]', '[class*="Tier"]'] },
  { name: 'Badge Showcase', selectors: ['[class*="badge"]', '[class*="Badge"]'] },
  { name: 'Achievements Feed', selectors: ['[class*="achievement"]', '[class*="Achievement"]'] },
  { name: 'Bonus Tracker', selectors: ['[class*="bonus"]', '[class*="Bonus"]'] }
];

componentChecks.forEach(check => {
  const elements = check.selectors.flatMap(sel => Array.from(document.querySelectorAll(sel)));
  console.log(`\n${check.name}: ${elements.length} elements found`);
  if (elements.length > 0) {
    elements.slice(0, 3).forEach(el => {
      console.log(`  - ${el.className}`);
    });
  }
});

// Try to force a re-render by clearing cache
console.log('\n=== Attempting Cache Clear ===');
console.log('To force refresh:');
console.log('1. Clear site data: DevTools → Application → Storage → Clear site data');
console.log('2. Hard refresh: Cmd/Ctrl + Shift + R');
console.log('3. Or run: localStorage.clear() and reload');

// Check network requests
console.log('\n=== Recent Network Activity ===');
console.log('Check Network tab for failed requests to:');
console.log('- /api/gamification/*');
console.log('- supabase.co/rest/v1/*');
console.log('Look for any 400/401/403/404/500 errors'); 