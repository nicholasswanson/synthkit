'use client'

import { useState, useEffect } from 'react'
import { PersonaScenarioSwitcher } from '@synthkit/client'

interface DataItem {
  id: string
  [key: string]: any
}

export default function Home() {
  const [data, setData] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch data from your API endpoints
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      setData(Array.isArray(result) ? result : [result])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            funsies1
          </h1>
          <p className="text-lg text-gray-600">
            Powered by Synthkit - Realistic mock data generation
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🎭 Scenario Configuration
          </h2>
          <PersonaScenarioSwitcher />
        </div>

        {/* Data Display */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              📊 Generated Data
            </h2>
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-sm text-red-600 mt-2">
                Make sure your development server is running and MSW is properly configured.
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading data...</span>
            </div>
          ) : data.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Showing {data.length} records from <code>/api/users</code>
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.slice(0, 6).map((item, index) => (
                  <div
                    key={item.id || index}
                    className="bg-gray-50 rounded-lg p-4 border"
                  >
                    <div className="space-y-2">
                      {Object.entries(item)
                        .filter(([key]) => !key.startsWith('_'))
                        .slice(0, 5)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="font-medium text-gray-600 capitalize">
                              {key}:
                            </span>
                            <span className="text-gray-900 truncate ml-2">
                              {typeof value === 'object' 
                                ? JSON.stringify(value).slice(0, 20) + '...'
                                : String(value).slice(0, 30)
                              }
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              {data.length > 6 && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  ... and {data.length - 6} more records
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No data available</p>
              <p className="text-sm text-gray-400">
                Click "Refresh Data" to fetch from your API endpoints
              </p>
            </div>
          )}
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🚀 Getting Started
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Generate More Data</h3>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                npm run synth:generate
              </code>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">List Available Packs</h3>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                npm run synth:list
              </code>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Change the scenario configuration above to see how different 
              business contexts, roles, and stages affect your generated data.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
