// Simple test to verify the enhanced client works
import { getData, synthkit } from './dist/index.js';

async function test() {
  console.log('🧪 Testing Synthkit Enhanced...');
  
  try {
    // Test basic data fetching
    const result = await getData({ showStatus: true, debug: true });
    
    console.log('✅ Data loaded successfully!');
    console.log('📊 Status:', result.status);
    console.log('🔍 Debug:', result.debug);
    console.log('👥 Customers:', result.data.customers.length);
    console.log('💳 Charges:', result.data.charges.length);
    
    // Test direct synthkit instance
    const directResult = await synthkit.getData();
    console.log('✅ Direct instance works!');
    console.log('👥 Direct customers:', directResult.data.customers.length);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

test();

