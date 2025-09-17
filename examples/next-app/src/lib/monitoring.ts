interface MonitoringEvent {
  timestamp: number;
  type: 'api_request' | 'api_error' | 'rate_limit' | 'dataset_served';
  endpoint?: string;
  datasetId?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  userAgent?: string;
  ip?: string;
}

class MonitoringService {
  private events: MonitoringEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  log(event: Omit<MonitoringEvent, 'timestamp'>) {
    const fullEvent: MonitoringEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);

    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MONITORING] ${event.type}:`, {
        endpoint: event.endpoint,
        datasetId: event.datasetId,
        statusCode: event.statusCode,
        responseTime: event.responseTime,
        error: event.error,
      });
    }
  }

  getStats() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    const last24Hours = now - (24 * 60 * 60 * 1000);

    const recentEvents = this.events.filter(e => e.timestamp > lastHour);
    const dailyEvents = this.events.filter(e => e.timestamp > last24Hours);

    const stats = {
      totalEvents: this.events.length,
      lastHour: {
        total: recentEvents.length,
        apiRequests: recentEvents.filter(e => e.type === 'api_request').length,
        errors: recentEvents.filter(e => e.type === 'api_error').length,
        rateLimits: recentEvents.filter(e => e.type === 'rate_limit').length,
        datasetsServed: recentEvents.filter(e => e.type === 'dataset_served').length,
      },
      last24Hours: {
        total: dailyEvents.length,
        apiRequests: dailyEvents.filter(e => e.type === 'api_request').length,
        errors: dailyEvents.filter(e => e.type === 'api_error').length,
        rateLimits: dailyEvents.filter(e => e.type === 'rate_limit').length,
        datasetsServed: dailyEvents.filter(e => e.type === 'dataset_served').length,
      },
      averageResponseTime: this.calculateAverageResponseTime(recentEvents),
      errorRate: this.calculateErrorRate(recentEvents),
      topEndpoints: this.getTopEndpoints(recentEvents),
      topDatasets: this.getTopDatasets(recentEvents),
    };

    return stats;
  }

  private calculateAverageResponseTime(events: MonitoringEvent[]): number {
    const responseTimes = events
      .filter(e => e.responseTime !== undefined)
      .map(e => e.responseTime!);
    
    if (responseTimes.length === 0) return 0;
    
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  private calculateErrorRate(events: MonitoringEvent[]): number {
    const totalRequests = events.filter(e => e.type === 'api_request').length;
    const errors = events.filter(e => e.type === 'api_error').length;
    
    if (totalRequests === 0) return 0;
    
    return (errors / totalRequests) * 100;
  }

  private getTopEndpoints(events: MonitoringEvent[]): Array<{ endpoint: string; count: number }> {
    const endpointCounts: Record<string, number> = {};
    
    events
      .filter(e => e.endpoint)
      .forEach(e => {
        endpointCounts[e.endpoint!] = (endpointCounts[e.endpoint!] || 0) + 1;
      });

    return Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getTopDatasets(events: MonitoringEvent[]): Array<{ datasetId: string; count: number }> {
    const datasetCounts: Record<string, number> = {};
    
    events
      .filter(e => e.datasetId)
      .forEach(e => {
        datasetCounts[e.datasetId!] = (datasetCounts[e.datasetId!] || 0) + 1;
      });

    return Object.entries(datasetCounts)
      .map(([datasetId, count]) => ({ datasetId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  getRecentErrors() {
    const lastHour = Date.now() - (60 * 60 * 1000);
    return this.events
      .filter(e => e.type === 'api_error' && e.timestamp > lastHour)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
  }

  clear() {
    this.events = [];
  }
}

// Singleton instance
export const monitoring = new MonitoringService();

// Helper functions for common monitoring tasks
export function logApiRequest(endpoint: string, responseTime: number, statusCode: number, userAgent?: string, ip?: string) {
  monitoring.log({
    type: 'api_request',
    endpoint,
    responseTime,
    statusCode,
    userAgent,
    ip,
  });
}

export function logApiError(endpoint: string, error: string, statusCode: number, userAgent?: string, ip?: string) {
  monitoring.log({
    type: 'api_error',
    endpoint,
    error,
    statusCode,
    userAgent,
    ip,
  });
}

export function logRateLimit(endpoint: string, userAgent?: string, ip?: string) {
  monitoring.log({
    type: 'rate_limit',
    endpoint,
    userAgent,
    ip,
  });
}

export function logDatasetServed(datasetId: string, responseTime: number, userAgent?: string, ip?: string) {
  monitoring.log({
    type: 'dataset_served',
    datasetId,
    responseTime,
    userAgent,
    ip,
  });
}
