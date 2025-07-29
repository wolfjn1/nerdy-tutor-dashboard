// Debug script to check why data isn't displaying
// Run this in browser console on the achievements page

console.log('=== CHECKING COMPONENT DATA ===');

// Try to access Supabase client and manually fetch data
(async () => {
  try {
    // Get all text content from the page
    const pageText = document.body.innerText;
    
    console.log('\n=== Page Content Check ===');
    console.log('Contains "550"?', pageText.includes('550'));
    console.log('Contains "Gold"?', pageText.includes('Gold') || pageText.includes('gold'));
    console.log('Contains "Level"?', pageText.includes('Level') || pageText.includes('level'));
    
    // Check for specific component content
    console.log('\n=== Component Text Content ===');
    
    // Points card
    const pointsCard = document.querySelector('[class*="card"]');
    if (pointsCard) {
      console.log('First card text:', pointsCard.textContent?.substring(0, 200));
    }
    
    // All cards
    const allCards = document.querySelectorAll('[class*="card"], [class*="Card"]');
    console.log(`\nFound ${allCards.length} cards total`);
    allCards.forEach((card, index) => {
      const hasNumber = /\d+/.test(card.textContent || '');
      const hasLoading = card.querySelector('[class*="animate-pulse"], [class*="skeleton"]');
      console.log(`Card ${index + 1}: Has numbers: ${hasNumber}, Has loading: ${!!hasLoading}`);
    });
    
    // Check for "0" values that shouldn't be there
    console.log('\n=== Checking for Zero Values ===');
    const zeros = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent?.trim() === '0' || el.textContent?.trim() === '$0'
    );
    console.log(`Found ${zeros.length} elements with "0" or "$0"`);
    
    // Check React Fiber for component props
    console.log('\n=== React Component Check ===');
    const reactRoot = document.getElementById('__next') || document.querySelector('[data-reactroot]');
    if (reactRoot && reactRoot._reactRootContainer) {
      console.log('✓ React root found');
    } else {
      console.log('✗ React root not accessible');
    }
    
    // Network check
    console.log('\n=== Network Requests ===');
    console.log('Open Network tab and look for:');
    console.log('1. Requests to /gamification_points');
    console.log('2. Requests to /tutor_badges');
    console.log('3. Requests to /tutor_tiers');
    console.log('Are they returning data or errors?');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
})();

// Force refresh suggestion
console.log('\n=== Try These Steps ===');
console.log('1. Open DevTools → Application → Storage → Clear site data');
console.log('2. Then refresh the page');
console.log('3. Or in console: localStorage.clear(); location.reload();'); 