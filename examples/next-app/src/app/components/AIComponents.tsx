'use client';

import { useState } from 'react';

interface AnalysisData {
  success: boolean;
  analysis?: {
    businessContext: {
      type: string;
      stage: string;
      primaryFeatures: string[];
      targetAudience: string[];
      monetizationModel: string;
    };
    entities: Array<{
      name: string;
      type: string;
      relationships: string[];
      estimatedVolume: string;
    }>;
    userRoles: string[];
    keyFeatures: string[];
    confidence: number;
    reasoning: string[];
  };
  processingTime: number;
}

interface MatchingData {
  analysis: AnalysisData;
  matches: {
    success: boolean;
    matches: Array<{
      scenario: {
        id: string;
        name: string;
        description?: string;
        packName: string;
        businessType: string;
        matchScore: number;
      };
      reasons: string[];
      confidence: number;
    }>;
    bestMatch?: {
      scenario: {
        id: string;
        name: string;
        description?: string;
        packName: string;
        businessType: string;
        matchScore: number;
      };
      reasons: string[];
      confidence: number;
    };
    recommendNewScenario: boolean;
    reasoning: string[];
  };
}

interface GenerationData {
  analysis: AnalysisData;
  generation: {
    success: boolean;
    pack?: {
      id: string;
      name: string;
      description: string;
      schemas: Record<string, any>;
      scenarios: Record<string, any>;
      personas: Record<string, any>;
    };
    scenario?: {
      id: string;
      name: string;
      description: string;
      config: {
        volume: Record<string, number>;
        relationships: Record<string, number>;
      };
    };
    personas?: Array<{
      id: string;
      name: string;
      description: string;
    }>;
    reasoning: string[];
    suggestions: string[];
    error?: string;
    savedFiles?: string[];
    fileError?: string;
  };
}

export function AnalysisResult({ result }: { result: AnalysisData }) {
  if (!result.success || !result.analysis) {
    return (
      <div className="p-6 border rounded-lg bg-red-50 dark:bg-red-900/20">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          ❌ Analysis Failed
        </h3>
        <p>Unable to analyze the business description.</p>
      </div>
    );
  }

  const { analysis } = result;

  return (
    <div className="space-y-6">
      <div className="p-6 border rounded-lg bg-green-50 dark:bg-green-900/20">
        <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
          ✅ Analysis Complete
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Processing time: {result.processingTime}ms • Confidence: {Math.round(analysis.confidence * 100)}%
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Business Context */}
        <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
          <h4 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">
            📊 Business Context
          </h4>
          <div className="space-y-3">
            <div><span className="font-medium">Type:</span> <span className="capitalize">{analysis.businessContext.type}</span></div>
            <div><span className="font-medium">Stage:</span> <span className="capitalize">{analysis.businessContext.stage}</span></div>
            <div><span className="font-medium">Monetization:</span> <span className="capitalize">{analysis.businessContext.monetizationModel}</span></div>
            <div>
              <span className="font-medium">Target Audience:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.businessContext.targetAudience.map((audience, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                    {audience}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Primary Features:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.businessContext.primaryFeatures.map((feature, i) => (
                  <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
          <h4 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">
            🔧 Key Features
          </h4>
          <div className="space-y-2">
            {analysis.keyFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Roles */}
        <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
          <h4 className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400">
            👥 User Roles
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.userRoles.map((role, i) => (
              <span key={i} className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Data Entities */}
        <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
          <h4 className="text-lg font-semibold mb-4 text-teal-600 dark:text-teal-400">
            🗃️ Data Entities
          </h4>
          <div className="space-y-3">
            {analysis.entities.map((entity, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="font-medium">{entity.name} <span className="text-sm text-gray-500">({entity.type})</span></div>
                {entity.relationships.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    → Related to: {entity.relationships.join(', ')}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Volume: {entity.estimatedVolume}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reasoning */}
      {analysis.reasoning.length > 0 && (
        <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h4 className="text-lg font-semibold mb-4">🧠 Analysis Reasoning</h4>
          <ul className="space-y-2">
            {analysis.reasoning.map((reason, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function MatchingResult({ result }: { result: MatchingData }) {
  const { matches } = result;

  if (!matches.success) {
    return (
      <div className="p-6 border rounded-lg bg-red-50 dark:bg-red-900/20">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          ❌ Matching Failed
        </h3>
        <p>Unable to find matching scenarios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {matches.matches.length === 0 ? (
        <div className="p-6 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
          <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
            🤷 No Matching Scenarios Found
          </h3>
          <p className="mb-4">We couldn't find any existing scenarios that match your business description.</p>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
            <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">💡 Recommendation</h4>
            <p>Consider creating a custom scenario for your unique business needs.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="p-6 border rounded-lg bg-green-50 dark:bg-green-900/20">
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
              ✅ Found {matches.matches.length} Matching Scenarios
            </h3>
          </div>

          {/* Best Match */}
          {matches.bestMatch && (
            <div className="p-6 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">
                🏆 Best Match
              </h4>
              <div className="mb-3">
                <div className="text-xl font-bold">{matches.bestMatch.scenario.name}</div>
                <div className="text-gray-600 dark:text-gray-400">{matches.bestMatch.scenario.packName}</div>
                <div className="text-sm text-gray-500 mt-1">{matches.bestMatch.scenario.description}</div>
              </div>
              <div className="mb-3">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {Math.round(matches.bestMatch.confidence * 100)}% confidence
                </span>
              </div>
              {matches.bestMatch.reasons.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Reasons:</h5>
                  <ul className="space-y-1">
                    {matches.bestMatch.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Other Matches */}
          {matches.matches.length > 1 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">📋 Other Matches</h4>
              <div className="grid gap-4">
                {matches.matches.slice(1).map((match, i) => (
                  <div key={i} className="p-4 border rounded-lg bg-white dark:bg-gray-900">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">{match.scenario.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{match.scenario.packName}</div>
                        <div className="text-xs text-gray-500 mt-1">{match.scenario.description}</div>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm">
                        {Math.round(match.confidence * 100)}%
                      </span>
                    </div>
                    {match.reasons.length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        → {match.reasons[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
            <h4 className="text-lg font-semibold mb-3">
              {matches.recommendNewScenario ? '💡 Recommendation' : '🎯 Recommendation'}
            </h4>
            {matches.recommendNewScenario ? (
              <div className="space-y-2">
                <p>While we found some matches, your business has unique characteristics.</p>
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  Consider generating a custom scenario for better fit.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p>Use the <strong>{matches.bestMatch?.scenario.name}</strong> scenario.</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Run <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">synthkit scenario activate {matches.bestMatch?.scenario.id}</code> to get started.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Reasoning */}
      {matches.reasoning.length > 0 && (
        <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h4 className="text-lg font-semibold mb-4">🧠 Analysis Reasoning</h4>
          <ul className="space-y-2">
            {matches.reasoning.map((reason, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function GenerationResult({ result }: { result: GenerationData }) {
  const [showFullPack, setShowFullPack] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activationResult, setActivationResult] = useState<string | null>(null);
  const { generation } = result;

  const handleActivateScenario = async () => {
    if (!generation.pack || !generation.scenario) return;
    
    setActivating(true);
    setActivationResult(null);
    
    try {
      const response = await fetch('/api/ai/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: generation.pack.id,
          scenarioId: generation.scenario.id
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setActivationResult(`✅ ${result.message}`);
      } else {
        setActivationResult(`❌ ${result.error}`);
      }
    } catch (error) {
      setActivationResult('❌ Failed to activate scenario');
    } finally {
      setActivating(false);
    }
  };

  if (!generation.success) {
    return (
      <div className="p-6 border rounded-lg bg-red-50 dark:bg-red-900/20">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          ❌ Generation Failed
        </h3>
        <p>{generation.error || 'Unable to generate custom scenario.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 border rounded-lg bg-green-50 dark:bg-green-900/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
            ✅ Custom Scenario Generated Successfully!
          </h3>
          {generation.pack && generation.scenario && (
            <button
              onClick={handleActivateScenario}
              disabled={activating}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {activating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Activating...
                </span>
              ) : (
                '🚀 Activate Scenario'
              )}
            </button>
          )}
        </div>
        {activationResult && (
          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
            <p className="text-sm">{activationResult}</p>
          </div>
        )}
      </div>

      {/* Generated Pack */}
      {generation.pack && (
        <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
          <h4 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">
            📦 Generated Pack
          </h4>
          <div className="space-y-3">
            <div><span className="font-medium">Name:</span> {generation.pack.name} ({generation.pack.id})</div>
            <div><span className="font-medium">Description:</span> {generation.pack.description}</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><span className="font-medium">Schemas:</span> {Object.keys(generation.pack.schemas).length}</div>
              <div><span className="font-medium">Scenarios:</span> {Object.keys(generation.pack.scenarios).length}</div>
              <div><span className="font-medium">Personas:</span> {Object.keys(generation.pack.personas).length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Scenario */}
      {generation.scenario && (
        <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
          <h4 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">
            🎭 Generated Scenario
          </h4>
          <div className="space-y-3">
            <div><span className="font-medium">Name:</span> {generation.scenario.name} ({generation.scenario.id})</div>
            <div><span className="font-medium">Description:</span> {generation.scenario.description}</div>
            <div>
              <span className="font-medium">Data Volumes:</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {Object.entries(generation.scenario.config.volume).map(([entity, volume]) => (
                  <div key={entity} className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <div className="font-medium text-sm">{entity}</div>
                    <div className="text-lg">{volume.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            {Object.keys(generation.scenario.config.relationships).length > 0 && (
              <div>
                <span className="font-medium">Relationships:</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(generation.scenario.config.relationships).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium">{key}:</span> {typeof value === 'number' ? (value < 1 ? `${(value * 100).toFixed(1)}%` : value.toFixed(2)) : value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generated Personas */}
      {generation.personas && generation.personas.length > 0 && (
        <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
          <h4 className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400">
            👤 Generated Personas
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {generation.personas.map((persona, i) => (
              <div key={i} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded">
                <div className="font-semibold">{persona.name} ({persona.id})</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{persona.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generation Details */}
      {generation.reasoning.length > 0 && (
        <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h4 className="text-lg font-semibold mb-4">🧠 Generation Details</h4>
          <ul className="space-y-2">
            {generation.reasoning.map((reason, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {generation.suggestions.length > 0 && (
        <div className="p-6 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <h4 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">💡 Next Steps</h4>
          <ul className="space-y-2">
            {generation.suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File Output Results */}
      {generation.savedFiles && generation.savedFiles.length > 0 && (
        <div className="p-6 border rounded-lg bg-green-50 dark:bg-green-900/20">
          <h4 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">✅ Files Saved Successfully</h4>
          <div className="space-y-2">
            {generation.savedFiles.map((filePath, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">
                  {filePath}
                </code>
              </div>
            ))}
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-3">
            💡 You can now use these files with <code className="bg-green-100 dark:bg-green-900 px-1 rounded">synthkit pack validate</code> or integrate them into your project.
          </p>
        </div>
      )}

      {/* File Error */}
      {generation.fileError && (
        <div className="p-6 border rounded-lg bg-red-50 dark:bg-red-900/20">
          <h4 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">❌ File Save Error</h4>
          <p className="text-red-600 dark:text-red-400">{generation.fileError}</p>
        </div>
      )}

      {/* Full Pack JSON */}
      {generation.pack && (
        <div className="p-6 border rounded-lg bg-white dark:bg-gray-900">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">📄 Generated Pack JSON</h4>
            <button
              onClick={() => setShowFullPack(!showFullPack)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {showFullPack ? 'Hide' : 'Show'} Full Pack
            </button>
          </div>
          {showFullPack && (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-x-auto max-h-96 overflow-y-auto">
              {JSON.stringify(generation.pack, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
