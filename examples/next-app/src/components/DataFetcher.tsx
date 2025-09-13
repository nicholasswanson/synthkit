'use client';

import { useState, useEffect } from 'react';
import { useSynth } from '@synthkit/client';

interface DataFetcherProps {
  title: string;
  endpoint: string;
  itemsKey?: string;
}

export function DataFetcher({ title, endpoint, itemsKey }: DataFetcherProps) {
  const synth = useSynth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [synth.currentGenerationId, synth.activeCategory, synth.activeRole]);

  const fetchData = async () => {
    if (!synth.isReady || !synth.mswEnabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(itemsKey && result[itemsKey] ? result[itemsKey] : result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const createNew = async () => {
    if (!synth.isReady || !synth.mswEnabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: `New ${title.slice(0, -1)}`,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the list
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!synth.isReady || !synth.mswEnabled) {
      return;
    }

    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the list
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loading || !synth.isReady}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={createNew}
            disabled={loading || !synth.isReady}
            className="px-3 py-1 text-sm border rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            Create New
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : !synth.isReady ? (
        <div className="text-center py-8 text-gray-500">Synthkit not ready</div>
      ) : !synth.mswEnabled ? (
        <div className="text-center py-8 text-gray-500">MSW not enabled</div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No data</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.slice(0, 10).map((item, index) => (
            <div 
              key={item.id || index}
              className="p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{item.name || item.id}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {item.email && <div>Email: {item.email}</div>}
                    {item.role && <div>Role: {item.role}</div>}
                    {item.status && <div>Status: {item.status}</div>}
                    {item.amount !== undefined && <div>Amount: ${item.amount.toFixed(2)}</div>}
                    {item.dueDate && <div>Due: {new Date(item.dueDate).toLocaleDateString()}</div>}
                  </div>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="ml-2 px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {Math.min(10, data.length)} of {data.length} items
      </div>
    </div>
  );
}
