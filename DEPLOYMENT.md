# Synthkit Deployment Guide

This guide covers deploying Synthkit applications to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [Production Checklist](#production-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

- Node.js 20.11.0 or higher
- pnpm 9.0.0 or higher
- Git repository with your Synthkit project
- Anthropic API key (for AI features)

## Environment Setup

### 1. Environment Variables

Create a `.env.production` file with your production values:

```bash
# Required for AI features
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_PRODUCTION_KEY

# Optional configurations
NEXT_PUBLIC_API_URL=https://your-domain.com
NEXT_PUBLIC_LOG_LEVEL=error
NODE_ENV=production

# Security
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 2. Build Configuration

Ensure your `package.json` has the correct build commands:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

## Deployment Options

### Vercel Deployment (Recommended for Next.js)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # From your project root
   cd examples/next-app
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to your Vercel dashboard
   - Navigate to Project Settings → Environment Variables
   - Add your production environment variables

5. **Custom Domain (Optional)**
   ```bash
   vercel domains add your-domain.com
   ```

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   # examples/next-app/Dockerfile
   FROM node:20-alpine AS base

   # Install pnpm
   RUN corepack enable
   RUN corepack prepare pnpm@latest --activate

   # Dependencies stage
   FROM base AS deps
   WORKDIR /app
   COPY package.json pnpm-lock.yaml ./
   RUN pnpm install --frozen-lockfile

   # Build stage
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN pnpm build

   # Runtime stage
   FROM base AS runner
   WORKDIR /app

   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"

   CMD ["node", "server.js"]
   ```

2. **Build Docker Image**
   ```bash
   docker build -t synthkit-app .
   ```

3. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e ANTHROPIC_API_KEY=your_key \
     -e NODE_ENV=production \
     synthkit-app
   ```

### AWS/Cloud Deployment

1. **Using AWS Amplify**
   ```bash
   npm install -g @aws-amplify/cli
   amplify init
   amplify add hosting
   amplify publish
   ```

2. **Using Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Deploy
   railway login
   railway up
   ```

## Production Checklist

### Security
- [ ] Environment variables are properly set
- [ ] API keys are stored securely (not in code)
- [ ] CORS is configured for your domains
- [ ] Rate limiting is enabled
- [ ] Security headers are configured
- [ ] HTTPS is enforced

### Performance
- [ ] Production build is optimized
- [ ] Images are optimized
- [ ] Caching headers are set
- [ ] CDN is configured (optional)
- [ ] Database connections are pooled (if applicable)

### Monitoring
- [ ] Error tracking is set up (e.g., Sentry)
- [ ] Performance monitoring is configured
- [ ] Health check endpoints are accessible
- [ ] Logging is configured

### Testing
- [ ] All tests pass
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Accessibility tested

## Monitoring & Maintenance

### Health Checks

Monitor your application health:

```bash
# Check application health
curl https://your-domain.com/api/health

# Check readiness
curl https://your-domain.com/api/health/ready

# Check liveness
curl https://your-domain.com/api/health/live
```

### Logging

Configure centralized logging:

1. **Vercel Logs**
   ```bash
   vercel logs --follow
   ```

2. **Docker Logs**
   ```bash
   docker logs -f container_id
   ```

3. **Custom Logging Service**
   Update `src/lib/logger.ts` to send logs to your service:
   ```typescript
   // Example: Send to LogRocket, Datadog, etc.
   if (process.env.NODE_ENV === 'production') {
     // Send logs to external service
   }
   ```

### Performance Monitoring

1. **Vercel Analytics**
   - Automatically included with Vercel deployments
   - View in Vercel dashboard

2. **Custom Monitoring**
   ```typescript
   // Add to your pages
   import { useReportWebVitals } from 'next/web-vitals';
   
   useReportWebVitals((metric) => {
     // Send to analytics service
     console.log(metric);
   });
   ```

### Updates & Maintenance

1. **Regular Updates**
   ```bash
   # Update dependencies
   pnpm update
   
   # Check for vulnerabilities
   pnpm audit
   
   # Fix vulnerabilities
   pnpm audit fix
   ```

2. **Backup Strategy**
   - Regular database backups (if applicable)
   - Configuration backups
   - Monitor disk usage

3. **Scaling**
   - Monitor CPU and memory usage
   - Set up auto-scaling rules
   - Configure load balancing

## Troubleshooting

### Common Issues

1. **MSW Loading in Production**
   - Ensure MSW is conditionally loaded
   - Check `NODE_ENV` is set to 'production'

2. **Missing Environment Variables**
   - Verify all required variables are set
   - Check variable names match exactly

3. **Build Failures**
   - Clear cache: `rm -rf .next`
   - Reinstall dependencies: `pnpm install`
   - Check Node.js version

### Debug Mode

Enable debug logging temporarily:
```bash
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG=true
```

Remember to disable debug mode after troubleshooting!

## Support

For deployment issues:
- Check the [GitHub Issues](https://github.com/synthkit/synthkit/issues)
- Review deployment logs
- Ensure all prerequisites are met

---

Last updated: {{ current_date }}
