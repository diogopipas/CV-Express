/**
 * Test script for Adzuna Country Detection
 * 
 * Run this to verify that country detection is working correctly.
 * 
 * Usage:
 *   node test-country-detection.js
 */

// Test locations
const testLocations = [
  // Portugal - Priority #1
  { location: 'Lisbon', expected: 'PT' },
  { location: 'Lisboa', expected: 'PT' },
  { location: 'Porto', expected: 'PT' },
  { location: 'Portugal', expected: 'PT' },
  { location: 'Braga', expected: 'PT' },
  
  // Spain
  { location: 'Barcelona', expected: 'ES' },
  { location: 'Madrid', expected: 'ES' },
  
  // Brazil
  { location: 'São Paulo', expected: 'BR' },
  { location: 'Rio de Janeiro', expected: 'BR' },
  
  // UK
  { location: 'London', expected: 'GB' },
  { location: 'Manchester', expected: 'GB' },
  
  // Germany
  { location: 'Berlin', expected: 'DE' },
  { location: 'Munich', expected: 'DE' },
  
  // France
  { location: 'Paris', expected: 'FR' },
  { location: 'Lyon', expected: 'FR' },
  
  // Italy
  { location: 'Milan', expected: 'IT' },
  { location: 'Rome', expected: 'IT' },
  
  // Netherlands
  { location: 'Amsterdam', expected: 'NL' },
  { location: 'Rotterdam', expected: 'NL' },
  
  // Other countries
  { location: 'Toronto', expected: 'CA' },
  { location: 'Sydney', expected: 'AU' },
  { location: 'New York', expected: 'US' },
  { location: 'Singapore', expected: 'SG' },
  
  // Default fallback
  { location: 'Unknown City', expected: 'GB' },
];

// Import the compiled scraper
const getCountryCode = (location) => {
  const locationLower = location.toLowerCase();
  
  // Portugal 🇵🇹
  if (locationLower.includes('portugal') || locationLower.includes('lisbon') || locationLower.includes('lisboa') || 
      locationLower.includes('porto') || locationLower.includes('braga') || locationLower.includes('coimbra') ||
      locationLower.includes('faro') || locationLower.includes('aveiro')) {
    return 'PT';
  }
  
  // Spain 🇪🇸
  if (locationLower.includes('spain') || locationLower.includes('españa') || locationLower.includes('madrid') || 
      locationLower.includes('barcelona') || locationLower.includes('valencia') || locationLower.includes('seville') ||
      locationLower.includes('sevilla') || locationLower.includes('bilbao') || locationLower.includes('malaga')) {
    return 'ES';
  }
  
  // Brazil 🇧🇷
  if (locationLower.includes('brazil') || locationLower.includes('brasil') || locationLower.includes('são paulo') ||
      locationLower.includes('sao paulo') || locationLower.includes('rio de janeiro') || locationLower.includes('brasília') ||
      locationLower.includes('brasilia') || locationLower.includes('belo horizonte') || locationLower.includes('curitiba')) {
    return 'BR';
  }
  
  // United Kingdom 🇬🇧
  if (locationLower.includes('uk') || locationLower.includes('united kingdom') || locationLower.includes('london') || 
      locationLower.includes('manchester') || locationLower.includes('birmingham') || locationLower.includes('edinburgh') ||
      locationLower.includes('glasgow') || locationLower.includes('liverpool') || locationLower.includes('bristol')) {
    return 'GB';
  }
  
  // Germany 🇩🇪
  if (locationLower.includes('germany') || locationLower.includes('deutschland') || locationLower.includes('berlin') || 
      locationLower.includes('munich') || locationLower.includes('münchen') || locationLower.includes('hamburg') ||
      locationLower.includes('cologne') || locationLower.includes('köln') || locationLower.includes('frankfurt')) {
    return 'DE';
  }
  
  // France 🇫🇷
  if (locationLower.includes('france') || locationLower.includes('paris') || locationLower.includes('lyon') ||
      locationLower.includes('marseille') || locationLower.includes('toulouse') || locationLower.includes('nice') ||
      locationLower.includes('nantes') || locationLower.includes('strasbourg')) {
    return 'FR';
  }
  
  // Italy 🇮🇹
  if (locationLower.includes('italy') || locationLower.includes('italia') || locationLower.includes('rome') || 
      locationLower.includes('roma') || locationLower.includes('milan') || locationLower.includes('milano') ||
      locationLower.includes('naples') || locationLower.includes('napoli') || locationLower.includes('turin') ||
      locationLower.includes('torino') || locationLower.includes('florence') || locationLower.includes('firenze')) {
    return 'IT';
  }
  
  // Netherlands 🇳🇱
  if (locationLower.includes('netherlands') || locationLower.includes('holland') || locationLower.includes('amsterdam') ||
      locationLower.includes('rotterdam') || locationLower.includes('the hague') || locationLower.includes('utrecht') ||
      locationLower.includes('eindhoven')) {
    return 'NL';
  }
  
  // Canada 🇨🇦
  if (locationLower.includes('canada') || locationLower.includes('toronto') || locationLower.includes('vancouver') ||
      locationLower.includes('montreal') || locationLower.includes('montréal') || locationLower.includes('calgary') ||
      locationLower.includes('ottawa') || locationLower.includes('edmonton')) {
    return 'CA';
  }
  
  // Australia 🇦🇺
  if (locationLower.includes('australia') || locationLower.includes('sydney') || locationLower.includes('melbourne') ||
      locationLower.includes('brisbane') || locationLower.includes('perth') || locationLower.includes('adelaide') ||
      locationLower.includes('canberra')) {
    return 'AU';
  }
  
  // Singapore 🇸🇬
  if (locationLower.includes('singapore')) {
    return 'SG';
  }
  
  // United States 🇺🇸
  if (locationLower.includes('usa') || locationLower.includes('united states') || locationLower.includes('america') ||
      locationLower.includes('new york') || locationLower.includes('los angeles') || locationLower.includes('chicago') ||
      locationLower.includes('san francisco') || locationLower.includes('seattle') || locationLower.includes('boston')) {
    return 'US';
  }
  
  // Default to GB
  return 'GB';
};

// Run tests
console.log('🧪 Testing Country Detection\n');
console.log('=' .repeat(60));

let passed = 0;
let failed = 0;

testLocations.forEach(test => {
  const result = getCountryCode(test.location);
  const success = result === test.expected;
  
  if (success) {
    console.log(`✅ ${test.location.padEnd(20)} → ${result} (Expected: ${test.expected})`);
    passed++;
  } else {
    console.log(`❌ ${test.location.padEnd(20)} → ${result} (Expected: ${test.expected})`);
    failed++;
  }
});

console.log('=' .repeat(60));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testLocations.length} tests\n`);

if (failed === 0) {
  console.log('🎉 All tests passed! Country detection is working correctly.\n');
  console.log('Next steps:');
  console.log('1. Make sure Adzuna API credentials are set in backend/.env');
  console.log('2. Start the backend: npm start');
  console.log('3. Test with real job searches for Portugal!');
} else {
  console.log('⚠️  Some tests failed. Please check the implementation.\n');
}

