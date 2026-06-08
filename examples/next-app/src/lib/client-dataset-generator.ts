import { generateRealisticStripeData } from './realistic-stripe-generator';
import { generateMetrics } from './metrics-generator';
import { calculateBusinessMetricsFromStripeData } from './business-metrics-calculator';

export interface DatasetGenerationParams {
  businessType: string;
  stage: string;
  scenarioId: number;
}

export interface DatasetGenerationResult {
  success: boolean;
  url?: string;
  error?: string;
}

const DATASET_PUBLISH_TIMEOUT_MS = 8 * 60 * 1000;
const DATASET_PUBLISH_POLL_MS = 10 * 1000;

// GitHub API configuration
const GITHUB_OWNER = 'nicholasswanson';
const GITHUB_REPO = 'synthkit';
const GITHUB_BRANCH = 'main';

// Animal names for URL generation
const ANIMALS = [
  'cheetah', 'lion', 'eagle', 'tiger', 'wolf', 'bear', 'shark', 'dolphin',
  'panther', 'leopard', 'jaguar', 'lynx', 'bobcat', 'cougar', 'puma',
  'falcon', 'hawk', 'owl', 'raven', 'crow', 'swan', 'heron', 'egret',
  'fox', 'coyote', 'jackal', 'hyena', 'mongoose', 'weasel', 'otter',
  'seal', 'walrus', 'whale', 'orca', 'narwhal', 'beluga', 'dolphin',
  'elephant', 'rhino', 'hippo', 'giraffe', 'zebra', 'antelope', 'gazelle',
  'buffalo', 'bison', 'yak', 'camel', 'llama', 'alpaca', 'deer'
];

function generateDatasetUrl(scenarioId: number): string {
  const timestamp = Date.now().toString().slice(-6);
  const animal1 = ANIMALS[scenarioId % ANIMALS.length];
  const animal2 = ANIMALS[(scenarioId * 7) % ANIMALS.length];
  const filename = `${animal1}-${animal2}-${scenarioId}-${timestamp}.json`;
  return `https://nicholasswanson.github.io/synthkit/datasets/${filename}`;
}

async function uploadToGitHub(dataset: any, filename: string): Promise<boolean> {
  try {
    // Get GitHub token from environment or prompt user
    const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    
    if (!githubToken) {
      console.error('GitHub token not configured');
      return false;
    }
    
    // Prepare content for GitHub API
    const content = JSON.stringify(dataset, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/datasets/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Synthkit-Dataset-Publisher'
      },
      body: JSON.stringify({
        message: `Update dataset: ${filename}`,
        content: encodedContent,
        branch: GITHUB_BRANCH
      })
    });
    
    if (response.ok) {
      console.log(`Successfully uploaded dataset to GitHub: ${filename}`);
      return true;
    } else {
      const errorData = await response.json();
      console.error('GitHub API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return false;
    }
  } catch (error) {
    console.error('GitHub upload failed:', error);
    return false;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForPublishedDataset(url: string): Promise<boolean> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < DATASET_PUBLISH_TIMEOUT_MS) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-store',
      });

      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.warn('Dataset URL is not published yet:', error);
    }

    await delay(DATASET_PUBLISH_POLL_MS);
  }

  return false;
}

export async function generateAndPublishDataset(params: DatasetGenerationParams): Promise<DatasetGenerationResult> {
  try {
    console.log('Triggering dataset generation with params:', params);

    const response = await fetch('/api/dataset/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });

    const data = await response.json();
    
    if (response.ok && data.success && data.url) {
      const isPublished = await waitForPublishedDataset(data.url);

      if (!isPublished) {
        return {
          success: false,
          url: data.url,
          error: `Dataset generation started, but GitHub Pages has not published it yet. Try again shortly: ${data.url}`,
        };
      }

      return {
        success: true,
        url: data.url,
      };
    } else {
      console.error('Dataset generation trigger failed:', data);
      return {
        success: false,
        error: data.error || `Failed to trigger dataset generation: ${response.status} ${response.statusText}`
      };
    }
  } catch (error) {
    console.error('Dataset generation trigger error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Store dataset URL in localStorage
export function storeDatasetUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('synthkit_dataset_url', url);
  }
}

// Get stored dataset URL from localStorage
export function getStoredDatasetUrl(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('synthkit_dataset_url');
  }
  return null;
}
