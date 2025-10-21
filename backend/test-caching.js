/**
 * Test script to verify job caching functionality
 * 
 * This script tests:
 * 1. First request (cold cache) - should fetch fresh jobs
 * 2. Second request (warm cache) - should use cached jobs
 * 3. Different location - should fetch fresh jobs
 * 
 * Usage:
 *   node test-caching.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testCaching() {
  log('\n🧪 Starting Job Caching Test...\n', colors.bright);

  try {
    // Test 1: First request (should NOT use cache)
    log('📝 Test 1: First request (cold cache)', colors.blue);
    log('   → Searching for "Software Engineer" in "United States"');
    
    const startTime1 = Date.now();
    const response1 = await axios.post(`${API_URL}/scrape`, {
      keyword: 'Software Engineer',
      location: 'United States',
      useCache: true
    });
    const duration1 = Date.now() - startTime1;

    log(`   ✓ Response time: ${duration1}ms`, colors.green);
    log(`   ✓ Jobs found: ${response1.data.data?.length || 0}`, colors.green);
    log(`   ✓ Used cache: ${response1.data.usedCache ? 'YES' : 'NO'}`, 
        response1.data.usedCache ? colors.yellow : colors.green);
    log(`   ✓ Message: ${response1.data.message}`, colors.green);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Second request (should USE cache)
    log('\n📝 Test 2: Second request (warm cache)', colors.blue);
    log('   → Searching for "Software Engineer" in "United States" (same as Test 1)');
    
    const startTime2 = Date.now();
    const response2 = await axios.post(`${API_URL}/scrape`, {
      keyword: 'Software Engineer',
      location: 'United States',
      useCache: true
    });
    const duration2 = Date.now() - startTime2;

    log(`   ✓ Response time: ${duration2}ms`, colors.green);
    log(`   ✓ Jobs found: ${response2.data.data?.length || 0}`, colors.green);
    log(`   ✓ Used cache: ${response2.data.usedCache ? 'YES' : 'NO'}`, 
        response2.data.usedCache ? colors.green : colors.red);
    log(`   ✓ Message: ${response2.data.message}`, colors.green);
    
    if (duration2 < duration1) {
      const speedup = (duration1 / duration2).toFixed(1);
      log(`   🚀 Cache speedup: ${speedup}x faster!`, colors.bright + colors.green);
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Different location (should NOT use cache)
    log('\n📝 Test 3: Different location (cold cache)', colors.blue);
    log('   → Searching for "Software Engineer" in "Canada" (different location)');
    
    const startTime3 = Date.now();
    const response3 = await axios.post(`${API_URL}/scrape`, {
      keyword: 'Software Engineer',
      location: 'Canada',
      useCache: true
    });
    const duration3 = Date.now() - startTime3;

    log(`   ✓ Response time: ${duration3}ms`, colors.green);
    log(`   ✓ Jobs found: ${response3.data.data?.length || 0}`, colors.green);
    log(`   ✓ Used cache: ${response3.data.usedCache ? 'YES' : 'NO'}`, 
        response3.data.usedCache ? colors.yellow : colors.green);
    log(`   ✓ Message: ${response3.data.message}`, colors.green);

    // Summary
    log('\n' + '='.repeat(60), colors.bright);
    log('📊 Test Summary:', colors.bright);
    log('='.repeat(60), colors.bright);
    
    log(`\nTest 1 (Cold Cache):`, colors.bright);
    log(`  • Duration: ${duration1}ms`);
    log(`  • Used Cache: ${response1.data.usedCache ? 'YES ⚠️' : 'NO ✓'}`);
    log(`  • Expected: NO cache (first request)`);
    
    log(`\nTest 2 (Warm Cache):`, colors.bright);
    log(`  • Duration: ${duration2}ms`);
    log(`  • Used Cache: ${response2.data.usedCache ? 'YES ✓' : 'NO ⚠️'}`);
    log(`  • Expected: YES cache (repeat request)`);
    if (response2.data.usedCache) {
      log(`  • Speedup: ${(duration1 / duration2).toFixed(1)}x faster! 🚀`, colors.green);
    }
    
    log(`\nTest 3 (Different Location):`, colors.bright);
    log(`  • Duration: ${duration3}ms`);
    log(`  • Used Cache: ${response3.data.usedCache ? 'YES ⚠️' : 'NO ✓'}`);
    log(`  • Expected: NO cache (different location)`);

    // Final verdict
    const test1Pass = !response1.data.usedCache;
    const test2Pass = response2.data.usedCache;
    const test3Pass = !response3.data.usedCache;
    const allPass = test1Pass && test2Pass && test3Pass;

    log('\n' + '='.repeat(60), colors.bright);
    if (allPass) {
      log('✅ ALL TESTS PASSED!', colors.bright + colors.green);
      log('Cache system is working correctly! 🎉', colors.green);
    } else {
      log('⚠️  SOME TESTS FAILED', colors.bright + colors.yellow);
      log(`Test 1: ${test1Pass ? '✓' : '✗'}`, test1Pass ? colors.green : colors.red);
      log(`Test 2: ${test2Pass ? '✓' : '✗'}`, test2Pass ? colors.green : colors.red);
      log(`Test 3: ${test3Pass ? '✓' : '✗'}`, test3Pass ? colors.green : colors.red);
    }
    log('='.repeat(60) + '\n', colors.bright);

  } catch (error) {
    log('\n❌ Test failed with error:', colors.red);
    if (error.code === 'ECONNREFUSED') {
      log('   → Backend is not running. Please start the backend first:', colors.red);
      log('     cd backend && npm start', colors.yellow);
    } else if (error.response) {
      log(`   → ${error.response.status}: ${error.response.data.error}`, colors.red);
    } else {
      log(`   → ${error.message}`, colors.red);
    }
    process.exit(1);
  }
}

// Run tests
log('\n' + '='.repeat(60), colors.bright);
log('🧪 Job Caching Test Suite', colors.bright);
log('='.repeat(60), colors.bright);
log('This will test the job caching functionality by:', colors.bright);
log('  1. Making a fresh request (cold cache)');
log('  2. Making the same request (warm cache - should be faster)');
log('  3. Making a request with different location (cold cache again)');
log('');
log('⚠️  Make sure the backend is running on port 5001', colors.yellow);
log('');

testCaching();

