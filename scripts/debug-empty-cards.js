// Debug script to find out why cards are rendering empty
console.log('=== DEBUGGING EMPTY CARDS ===');

// Check what's in the empty cards
const cards = document.querySelectorAll('.p-6');
console.log(`Found ${cards.length} cards with p-6 class`);

cards.forEach((card, index) => {
  const text = card.textContent?.trim();
  const hasContent = text && text.length > 0;
  console.log(`\nCard ${index + 1}:`);
  console.log('- Has content:', hasContent);
  console.log('- Text preview:', text ? text.substring(0, 100) + '...' : '(empty)');
  console.log('- Child elements:', card.children.length);
  console.log('- Inner HTML length:', card.innerHTML.length);
});

// Check for specific text that should be there
console.log('\n=== Expected Content Check ===');
const bodyText = document.body.textContent || '';
console.log('Page contains "Your Points"?', bodyText.includes('Your Points'));
console.log('Page contains "550"?', bodyText.includes('550'));
console.log('Page contains "Gold"?', bodyText.includes('Gold'));
console.log('Page contains "Recent Activity"?', bodyText.includes('Recent Activity'));
console.log('Page contains "Badge"?', bodyText.includes('Badge'));

// Check for React errors in console
console.log('\n=== Checking for React Errors ===');
const consoleErrors = [];
const originalError = console.error;
console.error = function(...args) {
  consoleErrors.push(args);
  originalError.apply(console, args);
};

// Trigger a re-render by scrolling
window.scrollTo(0, 100);
window.scrollTo(0, 0);

setTimeout(() => {
  console.log('Console errors detected:', consoleErrors.length);
  consoleErrors.forEach((err, i) => {
    console.log(`Error ${i + 1}:`, err);
  });
}, 1000);

// Check if components are actually mounting
console.log('\n=== Component Mount Check ===');
// Look for loading skeletons that might be stuck
const skeletons = document.querySelectorAll('.animate-pulse');
console.log('Loading skeletons found:', skeletons.length);

// Check data attributes or props
console.log('\n=== Data Attributes ===');
const elementsWithData = document.querySelectorAll('[data-testid], [data-tutor-id]');
console.log('Elements with data attributes:', elementsWithData.length);
elementsWithData.forEach(el => {
  console.log('- Element:', el.tagName, Array.from(el.attributes).map(a => `${a.name}="${a.value}"`).join(' '));
}); 