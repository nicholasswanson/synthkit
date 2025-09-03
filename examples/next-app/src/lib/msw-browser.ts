import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';

// Create a simple mock handler for testing
const handlers = [
  http.get('/api/test', () => {
    return HttpResponse.json({ message: 'MSW is working!' });
  }),
];

export const worker = setupWorker(...handlers);
