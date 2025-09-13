'use client';

export default function TestErrorPage() {
  // This will trigger the error boundary
  if (typeof window !== 'undefined') {
    throw new Error('Test error: This is a test of the error boundary');
  }
  
  return <div>This should not be visible</div>;
}
