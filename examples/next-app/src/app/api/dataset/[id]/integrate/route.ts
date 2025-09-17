import { NextRequest, NextResponse } from 'next/server';
import { loadDataset } from '@/lib/dataset-storage';
import { generateAllIntegrations, type DatasetInfo } from '@/lib/ai-integrations';
import { generateCursorRules } from '@/lib/cursor-rules-generator';
import { ApiErrorResponse } from '@/lib/api-errors';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const tool = searchParams.get('tool'); // cursor, claude, chatgpt, v0, fetch
    const format = searchParams.get('format') || 'json'; // json, text, download

    // Validate dataset ID format
    if (!id || typeof id !== 'string') {
      return ApiErrorResponse.badRequest('Invalid dataset ID');
    }

    // Sanitize ID (prevent path traversal)
    const sanitizedId = id.replace(/[^a-zA-Z0-9\-_]/g, '');
    if (sanitizedId !== id) {
      return ApiErrorResponse.badRequest('Invalid characters in dataset ID');
    }

    // Load dataset
    const dataset = await loadDataset(sanitizedId);
    
    if (!dataset) {
      return ApiErrorResponse.notFound('Dataset not found');
    }

    // Build dataset info
    const datasetInfo: DatasetInfo = {
      type: dataset.type,
      recordCounts: Object.entries(dataset.data).reduce((counts, [key, value]) => {
        if (Array.isArray(value)) {
          counts[key] = value.length;
        }
        return counts;
      }, {} as Record<string, number>),
      scenario: dataset.metadata.scenario,
      aiAnalysis: dataset.metadata.aiAnalysis
    };

    const datasetUrl = `/datasets/${sanitizedId}.json`;

    // Generate integrations
    const integrations = generateAllIntegrations(datasetUrl, datasetInfo);

    // Handle specific tool request
    if (tool) {
      const integration = integrations.find(i => i.tool.toLowerCase() === tool.toLowerCase());
      
      if (!integration) {
        return ApiErrorResponse.badRequest(`Unsupported tool: ${tool}. Available: cursor, claude, chatgpt, v0, fetch`);
      }

      // Handle special case for cursor rules
      if (tool.toLowerCase() === 'cursor' && format === 'rules') {
        const cursorRules = generateCursorRules(datasetUrl, datasetInfo);
        
        return NextResponse.json({
          tool: 'cursor',
          type: 'rules',
          content: cursorRules
        });
      }

      // Return specific tool integration
      if (format === 'text') {
        return new NextResponse(integration.copyText || integration.code, {
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      return NextResponse.json({
        tool: integration.tool,
        description: integration.description,
        code: integration.code,
        instructions: integration.instructions,
        copyText: integration.copyText
      });
    }

    // Return all integrations
    const response = NextResponse.json({
      datasetId: sanitizedId,
      datasetUrl,
      datasetInfo,
      integrations: integrations.map(integration => ({
        tool: integration.tool,
        description: integration.description,
        instructions: integration.instructions,
        // Don't include full code in summary response
        hasCode: true,
        hasCopyText: !!integration.copyText
      })),
      availableTools: integrations.map(i => i.tool.toLowerCase()),
      usage: {
        singleTool: `${request.url}?tool=cursor`,
        textFormat: `${request.url}?tool=cursor&format=text`,
        cursorRules: `${request.url}?tool=cursor&format=rules`,
        downloadRules: `${request.url}?tool=cursor&format=rules&download=true`
      }
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Add caching headers
    response.headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour

    logger.info('Integration code generated', {
      id: sanitizedId,
      tool: tool || 'all',
      format,
      userAgent: request.headers.get('user-agent')?.substring(0, 100)
    });

    return response;

  } catch (error) {
    logger.error('Integration generation error', { id: params.id, error });
    return ApiErrorResponse.internalError(
      'Failed to generate integration code',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
