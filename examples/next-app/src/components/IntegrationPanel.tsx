'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Download } from 'lucide-react';
import { generateAllIntegrations, type DatasetInfo } from '@/lib/ai-integrations';
import { downloadCursorRules } from '@/lib/cursor-rules-generator';
import { downloadReactHook } from '@/lib/react-hook-generator';
import { generateAndPublishDataset, storeDatasetUrl, getStoredDatasetUrl } from '@/lib/client-dataset-generator';

interface IntegrationPanelProps {
  url: string;
  datasetInfo: DatasetInfo;
  isLoading?: boolean;
}

export function IntegrationPanel({ url, datasetInfo, isLoading = false }: IntegrationPanelProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Cursor');
  const [datasetUrl, setDatasetUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePublishDataset = async () => {
    setIsPublishing(true);
    try {
      const result = await generateAndPublishDataset({
        businessType: 'b2b-saas-subscriptions', // Default business type
        stage: 'growth', // Default stage
        scenarioId: datasetInfo.scenario?.id || 12345
      });
      if (result.success && result.url) {
        setDatasetUrl(result.url);
        storeDatasetUrl(result.url);
      }
    } catch (error) {
      console.error('Failed to publish dataset:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdateDataset = async () => {
    setIsPublishing(true);
    try {
      const result = await generateAndPublishDataset({
        businessType: 'b2b-saas-subscriptions', // Default business type
        stage: 'growth', // Default stage
        scenarioId: datasetInfo.scenario?.id || 12345
      });
      if (result.success && result.url) {
        setDatasetUrl(result.url);
        storeDatasetUrl(result.url);
      }
    } catch (error) {
      console.error('Failed to update dataset:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const integrationExamples = generateAllIntegrations(url, datasetInfo);

  const tabs = [
    { id: 'Cursor', label: '🤖 Cursor', description: 'AI-powered code editor' },
    { id: 'React', label: '⚛️ React', description: 'One-line data integration' },
    { id: 'Claude', label: '🧠 Claude', description: 'Detailed development guidance' },
    { id: 'ChatGPT', label: '💬 ChatGPT', description: 'Quick coding solutions' },
    { id: 'v0', label: '⚡ v0', description: 'Component generator' },
    { id: 'Fetch API', label: '🔗 Fetch API', description: 'Direct JavaScript integration' }
  ];

  const activeIntegration = integrationExamples.find(e => e.tool === activeTab);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Generating integration examples...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📤 Share Dataset
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your dataset is ready to use in any prototype or AI tool
          </p>
        </div>
      </div>

      {/* Dataset Info */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📊 Dataset Overview
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Type:</span>
              <div className="text-blue-700 dark:text-blue-300">
                {datasetInfo.type === 'scenario' ? 'Scenario-based' : 'AI-generated'}
              </div>
            </div>
            {datasetInfo.scenario && (
              <>
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">Category:</span>
                  <div className="text-blue-700 dark:text-blue-300">{datasetInfo.scenario.category}</div>
                </div>
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">Stage:</span>
                  <div className="text-blue-700 dark:text-blue-300">{datasetInfo.scenario.stage}</div>
                </div>
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">ID:</span>
                  <div className="text-blue-700 dark:text-blue-300">{datasetInfo.scenario.id}</div>
                </div>
              </>
            )}
            {datasetInfo.aiAnalysis && (
              <div className="col-span-2">
                <span className="font-medium text-blue-800 dark:text-blue-200">Business Idea:</span>
                <div className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                  "{datasetInfo.aiAnalysis.prompt.substring(0, 100)}..."
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
            <span className="font-medium text-blue-800 dark:text-blue-200">Records:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(datasetInfo.recordCounts).map(([key, count]) => (
                <span key={key} className="text-sm bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  {key}: {count.toLocaleString()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Publishing Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          🌐 Dataset Publishing
        </h3>
        
        {!datasetUrl ? (
          <button
            onClick={handlePublishDataset}
            disabled={isPublishing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
          >
            {isPublishing ? 'Generating...' : 'Generate Dataset URL'}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <p className="text-sm text-green-700 mb-2">Dataset URL Generated:</p>
              <code className="text-xs font-mono text-green-800 break-all">{datasetUrl}</code>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(datasetUrl, 'dataset-url')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </button>
              
              <button
                onClick={handleUpdateDataset}
                disabled={isPublishing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
              >
                {isPublishing ? 'Updating...' : 'Update Dataset'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* URL Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          🔗 Dataset URL
        </h3>
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <code className="flex-1 text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
            {url}
          </code>
          <button
            onClick={() => copyToClipboard(url, 'url')}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            {copiedItem === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedItem === 'url' ? 'Copied!' : 'Copy'}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View
          </a>
        </div>
      </div>

      {/* Quick Download Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          ⚡ Quick Setup Files
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Download ready-to-use files for instant integration in your prototype:
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => downloadReactHook(url, datasetInfo)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Enhanced Hook (.ts)
          </button>
          <button
            onClick={() => downloadCursorRules(url, datasetInfo)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Cursor Rules
          </button>
        </div>
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs text-green-700 dark:text-green-300">
            💡 <strong>Pro tip:</strong> Install <code>@synthkit/enhanced</code> for zero-config data integration!
            Just run <code>npm install @synthkit/enhanced</code> and use <code>const result = await getData();</code>
          </p>
        </div>
      </div>

      {/* Integration Tabs */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          🛠️ Integration Examples
        </h3>
        <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeIntegration && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {activeIntegration.tool}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeIntegration.description}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(activeIntegration.copyText || activeIntegration.code, activeIntegration.tool)}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  {copiedItem === activeIntegration.tool ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedItem === activeIntegration.tool ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">
                {activeIntegration.code}
              </code>
            </pre>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              💡 {activeIntegration.instructions}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>✅ Zero configuration - works out of the box</p>
          <p>🚀 One line integration: <code>const result = await getData();</code></p>
          <p>🌐 Universal compatibility - works everywhere</p>
        </div>
      </div>
    </div>
  );
}
