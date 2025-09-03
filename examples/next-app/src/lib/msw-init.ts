export async function initMSW() {
  if (typeof window === 'undefined') {
    return;
  }

  const { worker } = await import('./msw-browser');
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
}
