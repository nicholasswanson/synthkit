import { NextRequest, NextResponse } from 'next/server';
import { generateMetrics } from '@/lib/metrics-generator';

// Store metrics in memory (in production, this would be in a database)
let currentMetrics: any = null;

export async function POST(request: NextRequest) {
  try {
    const { dataset, businessType, stage } = await request.json();
    
    if (!dataset || !businessType || !stage) {
      return NextResponse.json(
        { error: 'Missing required fields: dataset, businessType, stage' },
        { status: 400 }
      );
    }

    // Generate metrics for the dataset
    const metrics = generateMetrics(dataset, businessType, stage);
    
    // Store metrics in memory
    currentMetrics = {
      metrics,
      businessType,
      stage,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      metricsCount: metrics.length,
      businessType,
      stage
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const granularity = searchParams.get('granularity') || 'monthly';
    const metricName = searchParams.get('metric');
    const businessType = searchParams.get('businessType');
    const stage = searchParams.get('stage');

    if (!currentMetrics) {
      return NextResponse.json(
        { error: 'No metrics available. Please generate a dataset first.' },
        { status: 404 }
      );
    }

    // Filter by business type and stage if provided
    if (businessType && currentMetrics.businessType !== businessType) {
      return NextResponse.json(
        { error: 'Metrics not available for this business type' },
        { status: 404 }
      );
    }

    if (stage && currentMetrics.stage !== stage) {
      return NextResponse.json(
        { error: 'Metrics not available for this stage' },
        { status: 404 }
      );
    }

    // If specific metric requested
    if (metricName) {
      const metric = currentMetrics.metrics.find((m: any) => m.name === metricName);
      if (!metric) {
        return NextResponse.json(
          { error: `Metric '${metricName}' not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        metric: {
          name: metric.name,
          category: metric.category,
          type: metric.type,
          unit: metric.unit,
          chartType: metric.chartType,
          currentValue: metric.currentValue,
          exampleValue: metric.exampleValue,
          timeSeries: {
            [granularity]: metric.timeSeries[granularity as keyof typeof metric.timeSeries]
          }
        }
      });
    }

    // Return all metrics with requested granularity
    const metricsWithGranularity = currentMetrics.metrics.map((metric: any) => ({
      name: metric.name,
      category: metric.category,
      type: metric.type,
      unit: metric.unit,
      chartType: metric.chartType,
      currentValue: metric.currentValue,
      exampleValue: metric.exampleValue,
      timeSeries: {
        [granularity]: metric.timeSeries[granularity as keyof typeof metric.timeSeries]
      }
    }));

    return NextResponse.json({
      metrics: metricsWithGranularity,
      businessType: currentMetrics.businessType,
      stage: currentMetrics.stage,
      generatedAt: currentMetrics.generatedAt,
      granularity
    });
  } catch (error) {
    console.error('Error retrieving metrics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    );
  }
}
