'use client';

import { useState, useEffect } from 'react';
import { IntegrationPanel } from './IntegrationPanel';

interface DynamicRightPanelProps {
  currentDatasetUrl: string | null;
  datasetInfo: any;
  integrationLoading: boolean;
}

export function DynamicRightPanel({ currentDatasetUrl, datasetInfo, integrationLoading }: DynamicRightPanelProps) {
  // Always show the integration panel for now
  return (
    <IntegrationPanel
      url={currentDatasetUrl || 'https://nicholasswanson.github.io/synthkit/datasets/fallback.json'}
      datasetInfo={datasetInfo}
      isLoading={integrationLoading}
    />
  );
}
