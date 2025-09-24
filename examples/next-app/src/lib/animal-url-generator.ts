const ANIMALS = [
  'cheetah', 'lion', 'eagle', 'tiger', 'wolf', 'bear', 'shark', 'dolphin',
  'panther', 'leopard', 'jaguar', 'lynx', 'bobcat', 'cougar', 'puma',
  'falcon', 'hawk', 'owl', 'raven', 'crow', 'swan', 'heron', 'egret',
  'fox', 'coyote', 'jackal', 'hyena', 'mongoose', 'weasel', 'otter',
  'seal', 'walrus', 'whale', 'orca', 'narwhal', 'beluga', 'dolphin',
  'elephant', 'rhino', 'hippo', 'giraffe', 'zebra', 'antelope', 'gazelle',
  'buffalo', 'bison', 'yak', 'camel', 'llama', 'alpaca', 'deer'
];

export function generateDatasetUrl(scenarioId: number): string {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits
  const animal1 = ANIMALS[scenarioId % ANIMALS.length];
  const animal2 = ANIMALS[(scenarioId * 7) % ANIMALS.length];
  
  return `https://nicholasswanson.github.io/synthkit/datasets/${animal1}-${animal2}-${scenarioId}-${timestamp}.json`;
}

export function getStoredDatasetUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('synthkit-dataset-url');
}

export function storeDatasetUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('synthkit-dataset-url', url);
}

export function clearStoredDatasetUrl(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('synthkit-dataset-url');
}

