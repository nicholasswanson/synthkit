import { generateDatasetUrl, storeDatasetUrl } from './animal-url-generator';

export interface DatasetPublishResult {
  success: boolean;
  url?: string;
  error?: string;
}

// GitHub API configuration
const GITHUB_OWNER = 'nicholasswanson';
const GITHUB_REPO = 'synthkit';
const GITHUB_BRANCH = 'gh-pages';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'ghp_dummy_token_for_development';

async function uploadToGitHub(dataset: any, filename: string): Promise<boolean> {
  try {
    console.log(`[DEBUG] GitHub token present: ${GITHUB_TOKEN ? 'YES' : 'NO'}`);
    console.log(`[DEBUG] Token starts with ghp_: ${GITHUB_TOKEN.startsWith('ghp_')}`);
    
    // Check if we have a valid GitHub token
    if (GITHUB_TOKEN === 'ghp_dummy_token_for_development') {
      console.log(`[DEV] Simulating GitHub Pages upload: ${filename}`);
      console.log(`[DEV] Dataset size: ${JSON.stringify(dataset).length} characters`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For development, return true to simulate success
      return true;
    }
    
    // Production: Use GitHub API
    const content = JSON.stringify(dataset, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/datasets/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
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
      console.log(`Successfully uploaded dataset to GitHub Pages: ${filename}`);
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

export async function publishDataset(
  params: { businessType: string; stage: string; scenarioId: number }
): Promise<DatasetPublishResult> {
  try {
    // Call server-side API endpoint
    const response = await fetch('/api/publish-dataset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });
    
    const result = await response.json();
    
    if (result.success) {
      storeDatasetUrl(result.url);
      return {
        success: true,
        url: result.url
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to upload dataset to GitHub Pages'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function updateDataset(
  params: { businessType: string; stage: string; scenarioId: number },
  existingUrl?: string
): Promise<DatasetPublishResult> {
  try {
    // Call server-side API endpoint
    const response = await fetch('/api/publish-dataset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });
    
    const result = await response.json();
    
    if (result.success) {
      storeDatasetUrl(result.url);
      return {
        success: true,
        url: result.url
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to update dataset on GitHub Pages'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
