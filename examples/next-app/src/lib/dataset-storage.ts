import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';

// Dataset types
export interface StoredDataset {
  id: string;
  type: 'scenario' | 'ai-generated';
  data: {
    customers: any[];
    payments: any[];
    businessMetrics: any;
    [key: string]: any; // For AI-generated entities
  };
  metadata: {
    createdAt: string;
    scenario?: {
      category: string;
      role: string;
      stage: string;
      id: number;
    };
    aiAnalysis?: {
      prompt: string;
      analysis: any;
    };
    checksum: string;
  };
}

export interface DatasetCreateRequest {
  type: 'scenario' | 'ai-generated';
  data: {
    customers: any[];
    payments: any[];
    businessMetrics: any;
    [key: string]: any;
  };
  metadata: {
    scenario?: {
      category: string;
      role: string;
      stage: string;
      id: number;
    };
    aiAnalysis?: {
      prompt: string;
      analysis: any;
    };
  };
}

export interface DatasetCreateResponse {
  success: boolean;
  id: string;
  url: string;
  error?: string;
}

// Storage configuration
const DATASETS_DIR = path.join(process.cwd(), 'public', 'datasets');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

// Utility functions
export function generateDatasetId(type: 'scenario' | 'ai-generated', config: any): string {
  if (type === 'scenario') {
    const { category, role, stage, id } = config;
    return `scenario-${category}-${role}-${stage}-${id}`;
  } else {
    // For AI-generated datasets, create a short hash from prompt + timestamp
    const prompt = config.prompt || 'ai-dataset';
    const hash = crypto.createHash('md5').update(prompt).digest('hex').substring(0, 8);
    const timestamp = Date.now().toString(36);
    return `ai-${hash}-${timestamp}`;
  }
}

export function generateChecksum(data: any): string {
  const dataString = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('md5').update(dataString).digest('hex');
}

export function getDatasetUrl(id: string): string {
  return `${BASE_URL}/datasets/${id}.json`;
}

export function getDatasetFilePath(id: string): string {
  return path.join(DATASETS_DIR, `${id}.json`);
}

// Storage operations
export async function ensureDatasetDirectory(): Promise<void> {
  await fs.ensureDir(DATASETS_DIR);
}

export async function saveDataset(dataset: StoredDataset): Promise<void> {
  await ensureDatasetDirectory();
  const filePath = getDatasetFilePath(dataset.id);
  await fs.writeFile(filePath, JSON.stringify(dataset, null, 2));
}

export async function loadDataset(id: string): Promise<StoredDataset | null> {
  try {
    const filePath = getDatasetFilePath(id);
    
    if (!(await fs.pathExists(filePath))) {
      return null;
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    const dataset = JSON.parse(content) as StoredDataset;
    
    // Verify checksum
    const expectedChecksum = generateChecksum(dataset.data);
    if (dataset.metadata.checksum !== expectedChecksum) {
      console.warn(`Checksum mismatch for dataset ${id}`);
      // Return dataset anyway, but log the warning
    }
    
    return dataset;
  } catch (error) {
    console.error(`Error loading dataset ${id}:`, error);
    return null;
  }
}

export async function datasetExists(id: string): Promise<boolean> {
  const filePath = getDatasetFilePath(id);
  return fs.pathExists(filePath);
}

export async function listDatasets(): Promise<string[]> {
  try {
    await ensureDatasetDirectory();
    const files = await fs.readdir(DATASETS_DIR);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error('Error listing datasets:', error);
    return [];
  }
}

// Dataset creation
export async function createDataset(request: DatasetCreateRequest): Promise<DatasetCreateResponse> {
  try {
    // Generate dataset ID
    const config = request.type === 'scenario' 
      ? request.metadata.scenario 
      : { prompt: request.metadata.aiAnalysis?.prompt };
    
    const id = generateDatasetId(request.type, config);
    
    // Check if dataset already exists (for scenario datasets, this is expected)
    if (request.type === 'scenario' && await datasetExists(id)) {
      // For scenario datasets, return existing URL
      return {
        success: true,
        id,
        url: getDatasetUrl(id)
      };
    }
    
    // Create dataset object
    const dataset: StoredDataset = {
      id,
      type: request.type,
      data: request.data,
      metadata: {
        createdAt: new Date().toISOString(),
        checksum: generateChecksum(request.data),
        ...request.metadata
      }
    };
    
    // Save dataset
    await saveDataset(dataset);
    
    return {
      success: true,
      id,
      url: getDatasetUrl(id)
    };
    
  } catch (error) {
    console.error('Error creating dataset:', error);
    return {
      success: false,
      id: '',
      url: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
