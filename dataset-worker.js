// Web Worker for generating datasets in the background
self.onmessage = function(e) {
  const { businessType, stage, progressCallback } = e.data;
  
  try {
    // Send progress update
    self.postMessage({ type: 'progress', message: 'Generating full realistic dataset...' });
    
    // Import the generation function (we'll need to handle this differently)
    // For now, we'll simulate the generation
    const result = {
      customers: [],
      subscriptions: [],
      charges: [],
      invoices: [],
      plans: [],
      _metadata: {
        generatedAt: Date.now(),
        businessType,
        stage,
        counts: {
          customers: 0,
          subscriptions: 0,
          charges: 0,
          invoices: 0,
          plans: 0
        }
      }
    };
    
    // Send completion
    self.postMessage({ type: 'complete', result });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};
