'use client';

import { useState, useEffect } from 'react';
import { IntegrationPanel } from './IntegrationPanel';

interface DynamicRightPanelProps {
  currentDatasetUrl: string | null;
  datasetInfo: any;
  integrationLoading: boolean;
}

export function DynamicRightPanel({ currentDatasetUrl, datasetInfo, integrationLoading }: DynamicRightPanelProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentDatasetUrl) {
    return (
      <IntegrationPanel
        url={currentDatasetUrl}
        datasetInfo={datasetInfo}
        isLoading={integrationLoading}
      />
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
      <div className="text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Configure Your Dataset
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Select a category and configure your scenario to see integration examples
        </p>
      </div>
    </div>
  );
}
