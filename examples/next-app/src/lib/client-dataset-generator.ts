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
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/datasets/${filename}`;
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

export async function generateAndPublishDataset(params: DatasetGenerationParams): Promise<DatasetGenerationResult> {
  try {
    console.log('Triggering GitHub Actions dataset generation with params:', params);
    
    // Trigger GitHub Actions workflow
    const response = await fetch('https://api.github.com/repos/nicholasswanson/synthkit/dispatches', {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.NEXT_PUBLIC_SYNTHKIT_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Synthkit-Dataset-Generator'
      },
      body: JSON.stringify({
        event_type: 'generate-dataset',
        client_payload: {
          businessType: params.businessType,
          stage: params.stage,
          scenarioId: params.scenarioId
        }
      })
    });
    
    if (response.ok) {
      // Generate expected URL (same logic as before)
      const url = generateDatasetUrl(params.scenarioId);
      
      return {
        success: true,
        url,
        message: 'Dataset generation started. It will be available shortly at the URL above.'
      };
    } else {
      const errorData = await response.json();
      console.error('GitHub Actions trigger failed:', errorData);
      return {
        success: false,
        error: `Failed to trigger dataset generation: ${response.status} ${response.statusText}`
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
