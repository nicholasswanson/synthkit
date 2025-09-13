# Synthkit Monitoring & Observability Guide

This guide covers setting up monitoring, logging, and observability for Synthkit applications in production.

## Table of Contents

- [Overview](#overview)
- [Quick Setup](#quick-setup)
- [Error Tracking](#error-tracking)
- [Performance Monitoring](#performance-monitoring)
- [Logging](#logging)
- [Metrics & Dashboards](#metrics--dashboards)
- [Alerts](#alerts)
- [Best Practices](#best-practices)

## Quick Setup

### 1. Copy Example Configurations

```bash
cd examples/next-app

# Copy Sentry configurations
cp sentry.client.config.ts.example sentry.client.config.ts
cp sentry.server.config.ts.example sentry.server.config.ts
cp sentry.edge.config.ts.example sentry.edge.config.ts

# Update .env.local with your monitoring service credentials
```

### 2. Install Monitoring Dependencies

```bash
# For Sentry
pnpm add @sentry/nextjs

# For LogRocket (optional)
pnpm add logrocket

# For DataDog (optional)
pnpm add @datadog/browser-logs
```

### 3. Configure Environment Variables

Add to `.env.local`:
```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID
SENTRY_AUTH_TOKEN=YOUR_AUTH_TOKEN
SENTRY_ORG=YOUR_ORG
SENTRY_PROJECT=YOUR_PROJECT

# LogRocket (optional)
NEXT_PUBLIC_LOGROCKET_APP_ID=YOUR_APP/YOUR_PROJECT

# DataDog (optional)
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=YOUR_CLIENT_TOKEN
```

## Overview

A comprehensive monitoring setup includes:
- **Error Tracking**: Catch and track application errors
- **Performance Monitoring**: Track load times and user experience
- **Logging**: Centralized log collection and analysis
- **Metrics**: Custom business and technical metrics
- **Alerts**: Proactive notifications for issues

## Error Tracking

### Sentry Integration

1. **Install Sentry**
   ```bash
   cd examples/next-app
   pnpm add @sentry/nextjs
   ```

2. **Configure Sentry**
   ```typescript
   // sentry.client.config.ts
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
     debug: false,
     replaysOnErrorSampleRate: 1.0,
     replaysSessionSampleRate: 0.1,
     integrations: [
       new Sentry.Replay({
         maskAllText: true,
         blockAllMedia: true,
       }),
     ],
   });
   ```

3. **Update Error Boundary**
   ```typescript
   // src/app/error.tsx
   import * as Sentry from "@sentry/nextjs";
   
   useEffect(() => {
     Sentry.captureException(error);
     logger.error('Application error occurred', error, {
       digest: error.digest,
       url: window.location.href,
     });
   }, [error]);
   ```

### Custom Error Tracking

Update the logger to send errors to monitoring service:

```typescript
// src/lib/logger.ts
import * as Sentry from "@sentry/nextjs";

class Logger {
  error(message: string, error?: Error | unknown, context?: LogContext) {
    // ... existing code ...
    
    // Send to Sentry in production
    if (!this.isDevelopment && error instanceof Error) {
      Sentry.captureException(error, {
        extra: context,
        tags: {
          component: 'synthkit',
        },
      });
    }
  }
}
```

## Performance Monitoring

### Web Vitals

1. **Create Web Vitals Reporter**
   ```typescript
   // src/lib/web-vitals.ts
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

   function sendToAnalytics(metric: any) {
     // Send to your analytics endpoint
     const body = JSON.stringify({
       name: metric.name,
       value: metric.value,
       rating: metric.rating,
       delta: metric.delta,
       id: metric.id,
       navigationType: metric.navigationType,
     });

     // Use sendBeacon for reliability
     if (navigator.sendBeacon) {
       navigator.sendBeacon('/api/metrics', body);
     } else {
       fetch('/api/metrics', {
         body,
         method: 'POST',
         keepalive: true,
       });
     }
   }

   export function reportWebVitals() {
     getCLS(sendToAnalytics);
     getFID(sendToAnalytics);
     getFCP(sendToAnalytics);
     getLCP(sendToAnalytics);
     getTTFB(sendToAnalytics);
   }
   ```

2. **Integrate with App**
   ```typescript
   // src/app/layout.tsx
   import { reportWebVitals } from '@/lib/web-vitals';
   
   if (typeof window !== 'undefined') {
     reportWebVitals();
   }
   ```

### API Performance

Track API endpoint performance:

```typescript
// src/lib/api-metrics.ts
export function trackApiPerformance(
  endpoint: string,
  method: string,
  startTime: number,
  status: number
) {
  const duration = Date.now() - startTime;
  
  // Log locally
  logger.info('API request completed', {
    endpoint,
    method,
    duration,
    status,
  });
  
  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to DataDog, New Relic, etc.
  }
}
```

## Logging

### Structured Logging

1. **Log Aggregation Service Setup**

   **LogRocket**
   ```typescript
   // src/lib/logrocket.ts
   import LogRocket from 'logrocket';
   
   if (process.env.NODE_ENV === 'production') {
     LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID!);
   }
   ```

   **Datadog**
   ```typescript
   // src/lib/datadog.ts
   import { datadogLogs } from '@datadog/browser-logs';
   
   datadogLogs.init({
     clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
     site: 'datadoghq.com',
     forwardErrorsToLogs: true,
     sampleRate: 100,
   });
   ```

2. **Server-Side Logging**
   ```typescript
   // src/lib/server-logger.ts
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.Console({
         format: winston.format.simple(),
       }),
       // Add cloud logging transport
       // new winston.transports.Http({ ... })
     ],
   });
   ```

### Log Levels & Best Practices

- **DEBUG**: Detailed information for debugging
- **INFO**: General informational messages
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages for failures

```typescript
// Good logging practices
logger.info('User action completed', {
  userId: user.id,
  action: 'create_snapshot',
  duration: endTime - startTime,
});

// Avoid logging sensitive data
logger.info('Login attempt', {
  email: user.email,
  // Don't log: password, apiKey, etc.
});
```

## Metrics & Dashboards

### Custom Metrics

1. **Business Metrics**
   ```typescript
   // Track AI usage
   function trackAIUsage(action: string, success: boolean) {
     const metric = {
       name: 'ai_usage',
       action,
       success,
       timestamp: new Date().toISOString(),
     };
     
     // Send to metrics service
     sendMetric(metric);
   }
   ```

2. **Technical Metrics**
   ```typescript
   // Track cache hit rates
   function trackCacheMetrics(hit: boolean) {
     const metric = {
       name: 'cache_hit_rate',
       hit,
       timestamp: new Date().toISOString(),
     };
     
     sendMetric(metric);
   }
   ```

### Dashboard Setup

**Grafana Dashboard Example**
```json
{
  "dashboard": {
    "title": "Synthkit Monitoring",
    "panels": [
      {
        "title": "API Response Times",
        "targets": [{
          "expr": "histogram_quantile(0.95, api_request_duration_seconds)"
        }]
      },
      {
        "title": "Error Rate",
        "targets": [{
          "expr": "rate(error_total[5m])"
        }]
      },
      {
        "title": "AI Usage",
        "targets": [{
          "expr": "sum(ai_requests_total) by (endpoint)"
        }]
      }
    ]
  }
}
```

## Alerts

### Alert Configuration

1. **Error Rate Alerts**
   ```yaml
   # alerting-rules.yml
   groups:
     - name: synthkit
       rules:
         - alert: HighErrorRate
           expr: rate(error_total[5m]) > 0.05
           for: 5m
           labels:
             severity: warning
           annotations:
             summary: "High error rate detected"
             description: "Error rate is above 5% for 5 minutes"
   ```

2. **Performance Alerts**
   ```yaml
   - alert: SlowAPIResponse
     expr: histogram_quantile(0.95, api_request_duration_seconds) > 2
     for: 5m
     labels:
       severity: warning
     annotations:
       summary: "API responses are slow"
       description: "95th percentile response time > 2s"
   ```

3. **AI Service Alerts**
   ```yaml
   - alert: AIServiceDown
     expr: up{job="ai_service"} == 0
     for: 1m
     labels:
       severity: critical
     annotations:
       summary: "AI service is down"
       description: "Anthropic API is not responding"
   ```

### Notification Channels

Configure multiple notification channels:

```typescript
// src/lib/alerts.ts
export async function sendAlert(alert: Alert) {
  // Slack
  if (process.env.SLACK_WEBHOOK) {
    await fetch(process.env.SLACK_WEBHOOK, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 ${alert.title}: ${alert.message}`,
      }),
    });
  }
  
  // Email
  if (process.env.ALERT_EMAIL) {
    // Send email notification
  }
  
  // PagerDuty for critical alerts
  if (alert.severity === 'critical') {
    // Trigger PagerDuty
  }
}
```

## Best Practices

### 1. Sampling Strategy

Don't log everything in production:

```typescript
// Sample 10% of successful requests
if (Math.random() < 0.1 || status >= 400) {
  logger.info('API request', { ... });
}
```

### 2. Correlation IDs

Track requests across services:

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 
    crypto.randomUUID();
  
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);
  
  return response;
}
```

### 3. Privacy & Security

- Never log sensitive data (passwords, API keys, PII)
- Mask or redact sensitive fields
- Comply with GDPR/privacy regulations

```typescript
function sanitizeLog(data: any) {
  const sensitive = ['password', 'apiKey', 'ssn', 'creditCard'];
  
  return Object.keys(data).reduce((acc, key) => {
    if (sensitive.includes(key)) {
      acc[key] = '[REDACTED]';
    } else {
      acc[key] = data[key];
    }
    return acc;
  }, {} as any);
}
```

### 4. Performance Impact

Monitor the monitoring:

```typescript
// Track monitoring overhead
const monitoringStart = performance.now();
sendMetric(data);
const monitoringDuration = performance.now() - monitoringStart;

if (monitoringDuration > 100) {
  logger.warn('Monitoring taking too long', { duration: monitoringDuration });
}
```

### 5. Retention Policies

- Logs: 30 days
- Metrics: 90 days
- Errors: 180 days
- Adjust based on compliance requirements

## Testing Monitoring

### Local Testing

```bash
# Test error tracking
curl -X POST http://localhost:3001/api/test-error

# Test metrics endpoint
curl http://localhost:3001/api/health

# Generate load for performance testing
artillery quick --count 100 --num 10 http://localhost:3001
```

### Monitoring Checklist

- [ ] Error tracking configured and tested
- [ ] Performance monitoring active
- [ ] Logs are structured and searchable
- [ ] Dashboards show key metrics
- [ ] Alerts are configured and tested
- [ ] Runbooks exist for common alerts
- [ ] Privacy compliance verified
- [ ] Monitoring doesn't impact performance

---

Remember: Good monitoring is invisible until you need it!
