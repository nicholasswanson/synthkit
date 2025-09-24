// Debug test to see what data structure is returned
import { getData } from './dist/index.js';

async function debugTest() {
  console.log('🔍 Debug Test:');
  
  try {
    const result = await getData({ showStatus: true, debug: true });
    
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result));
    console.log('Data type:', typeof result.data);
    console.log('Data keys:', result.data ? Object.keys(result.data) : 'No data');
    
    if (result.data) {
      console.log('Customers type:', typeof result.data.customers);
      console.log('Customers length:', result.data.customers?.length);
      console.log('Charges type:', typeof result.data.charges);
      console.log('Charges length:', result.data.charges?.length);
    }
    
    console.log('\nFull result structure:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugTest();

