'use client';

import { useState } from 'react';
import { AnalysisResult, MatchingResult, GenerationResult } from '../components/AIComponents';

interface AnalysisData {
  success: boolean;
  analysis?: any;
  processingTime: number;
}

interface MatchingData {
  analysis: AnalysisData;
  matches: {
    success: boolean;
    matches: any[];
    bestMatch?: any;
    recommendNewScenario: boolean;
    reasoning: string[];
  };
}

interface GenerationData {
  analysis: AnalysisData;
  generation: {
    success: boolean;
    pack?: any;
    scenario?: any;
    personas?: any[];
    reasoning: string[];
    suggestions: string[];
    error?: string;
  };
}

export default function AIPage() {
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'analyze' | 'match' | 'generate'>('analyze');
  const [loading, setLoading] = useState(false);
  const [saveToFile, setSaveToFile] = useState(false);
  const [outputPath, setOutputPath] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [matchingResult, setMatchingResult] = useState<MatchingData | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze description');
      }
      
      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!description.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      
      if (!response.ok) {
        throw new Error('Failed to find matching scenarios');
      }
      
      const result = await response.json();
      setMatchingResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description,
          saveToFile,
          outputPath: outputPath.trim() || undefined,
          exportFormat
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate scenario');
      }
      
      const result = await response.json();
      setGenerationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTabAction = () => {
    switch (activeTab) {
      case 'analyze':
        handleAnalyze();
        break;
      case 'match':
        handleMatch();
        break;
      case 'generate':
        handleGenerate();
        break;
    }
  };

  const exampleDescriptions = [
    "A fitness app for tracking workouts and meal planning with social features",
    "An e-commerce marketplace for handmade crafts",
    "A SaaS project management tool for remote teams",
    "A social media platform for pet owners",
    "A nonprofit platform for donations and volunteer management"
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8">
      <div className="z-10 max-w-6xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold">AI-Powered Scenario Builder</h1>
            <a 
              href="/" 
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              ← Back to Demo
            </a>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Describe your business or app idea, and our AI will analyze it, find matching scenarios, or generate a custom one.
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-8 p-6 border rounded-lg bg-white dark:bg-gray-900">
          <label className="block text-sm font-medium mb-2">
            Business Description
          </label>
          <textarea
            className="w-full px-4 py-3 border rounded-lg text-black bg-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Describe your business or app idea... (e.g., 'A fitness app for tracking workouts and meal planning with social features')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          {/* Example descriptions */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleDescriptions.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setDescription(example)}
                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {example.length > 50 ? `${example.substring(0, 50)}...` : example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex border-b">
            {[
              { id: 'analyze', label: 'Analyze', icon: '🤖', description: 'Understand your business' },
              { id: 'match', label: 'Match', icon: '🔍', description: 'Find existing scenarios' },
              { id: 'generate', label: 'Generate', icon: '🏗️', description: 'Create custom scenario' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-center border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="text-2xl mb-1">{tab.icon}</div>
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{tab.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* File Output Options (only for generate tab) */}
        {activeTab === 'generate' && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="font-medium mb-3">📁 File Output Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={saveToFile}
                  onChange={(e) => setSaveToFile(e.target.checked)}
                  className="rounded"
                />
                <span>Save generated pack to files</span>
              </label>
              {saveToFile && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Export Format
                    </label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="json">JSON (pack.json)</option>
                      <option value="yaml">YAML (pack.yaml)</option>
                      <option value="typescript">TypeScript (pack.ts)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Output Directory (optional)
                    </label>
                    <input
                      type="text"
                      value={outputPath}
                      onChange={(e) => setOutputPath(e.target.value)}
                      placeholder="Leave empty for default (./generated-packs)"
                      className="w-full px-3 py-2 border rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Files will be saved as: {outputPath || './generated-packs'}/[pack-id]/
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mb-8 text-center">
          <button
            onClick={handleTabAction}
            disabled={!description.trim() || loading}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {activeTab === 'analyze' && 'Analyzing...'}
                {activeTab === 'match' && 'Finding Matches...'}
                {activeTab === 'generate' && 'Generating...'}
              </span>
            ) : (
              <>
                {activeTab === 'analyze' && '🤖 Analyze Business'}
                {activeTab === 'match' && '🔍 Find Matching Scenarios'}
                {activeTab === 'generate' && '🏗️ Generate Custom Scenario'}
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-red-600 dark:text-red-400">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Results */}
        {activeTab === 'analyze' && analysisResult && (
          <AnalysisResult result={analysisResult} />
        )}
        
        {activeTab === 'match' && matchingResult && (
          <MatchingResult result={matchingResult} />
        )}
        
        {activeTab === 'generate' && generationResult && (
          <GenerationResult result={generationResult} />
        )}
      </div>
    </main>
  );
}
