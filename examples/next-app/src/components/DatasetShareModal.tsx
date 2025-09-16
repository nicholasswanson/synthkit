'use client';

import { useState } from 'react';
import { X, Copy, Check, ExternalLink, Download } from 'lucide-react';
import { generateAllIntegrations, type DatasetInfo } from '@/lib/ai-integrations';
import { downloadCursorRules } from '@/lib/cursor-rules-generator';
import { downloadReactHook } from '@/lib/react-hook-generator';

interface DatasetShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  datasetInfo: DatasetInfo;
}

export function DatasetShareModal({ isOpen, onClose, url, datasetInfo }: DatasetShareModalProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Cursor');

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const integrationExamples = generateAllIntegrations(url, datasetInfo);

  const tabs = [
    { id: 'Cursor', label: '🤖 Cursor', description: 'AI-powered code editor' },
    { id: 'Claude', label: '🧠 Claude', description: 'Detailed development guidance' },
    { id: 'ChatGPT', label: '💬 ChatGPT', description: 'Quick coding solutions' },
    { id: 'v0', label: '⚡ v0', description: 'Component generator' },
    { id: 'Fetch API', label: '🔗 Fetch API', description: 'Direct JavaScript integration' }
  ];

  const activeIntegration = integrationExamples.find(e => e.tool === activeTab);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
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
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dataset Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📊 Dataset Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                <div className="col-span-2 md:col-span-3">
                  <span className="font-medium text-blue-800 dark:text-blue-200">Business Idea:</span>
                  <div className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                    "{datasetInfo.aiAnalysis.prompt.substring(0, 100)}..."
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
              <span className="font-medium text-blue-800 dark:text-blue-200">Records:</span>
              <div className="flex flex-wrap gap-3 mt-1">
                {Object.entries(datasetInfo.recordCounts).map(([key, count]) => (
                  <span key={key} className="text-sm bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    {key}: {count.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>
          </div>
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
              React Hook (.ts)
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
              💡 <strong>Pro tip:</strong> Download both files, add the React hook to your project, 
              and place the .cursorrules file in your project root for optimal AI assistance!
            </p>
          </div>
        </div>

        {/* Integration Tabs */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            🛠️ Integration Options
          </h3>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>{tab.label}</span>
                  <span className="text-xs opacity-75">{tab.description}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeIntegration && (
            <div className="space-y-4">
              {/* Integration Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {activeIntegration.tool} Integration
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeIntegration.description}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(activeIntegration.copyText || activeIntegration.code, activeIntegration.tool)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors text-sm"
                >
                  {copiedItem === activeIntegration.tool ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedItem === activeIntegration.tool ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Integration Content */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <pre className="bg-white dark:bg-gray-900 p-4 rounded text-sm overflow-x-auto border border-gray-200 dark:border-gray-700">
                  <code className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {activeIntegration.code}
                  </code>
                </pre>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 {activeIntegration.instructions}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>✅ Dataset is immediately accessible</p>
              <p>🔄 Same URL always returns identical data</p>
              <p>🌐 Works with any HTTP client or AI tool</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}