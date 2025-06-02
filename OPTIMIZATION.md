# Surebank API Optimization

This document outlines the optimizations made to reduce Lambda package size and improve performance.

## Optimizations Implemented

### 1. Lambda Package Size Reduction

- Reduced package size from 63MB to 42MB (33% reduction)
- Created Lambda layers for common dependencies (4.74MB)
- Implemented package pattern exclusions
- Removed unnecessary files (tests, docs, examples)
- Added cleanup scripts

### 2. Performance Improvements

- Configured appropriate memory and timeout settings
- Moved common dependencies to layers to improve cold start times
- Optimized AWS SDK by keeping only necessary modules

### 3. Deployment Enhancements

- Added optimized deployment workflow
- Implemented layer-based architecture
- Created dedicated cleanup scripts

### 4. Logging and Monitoring

- Enhanced health check endpoint with detailed logging
- Added real-time log streaming capabilities
- Created CloudWatch dashboard for monitoring
- Implemented health check monitoring tools
- Added scripts for continuous testing and monitoring

## How to Use the Optimized Deployment

### Standard Deployment

```bash
npm run deploy:dev
```

### Optimized Deployment

```bash
npm run deploy:optimized
```

This will:

1. Build the dependencies layer
2. Clean up unnecessary files
3. Deploy with optimized settings

## Testing Health Endpoints

```bash
# Basic health check
curl https://[api-id].execute-api.[region].amazonaws.com/health

# Detailed health check
curl https://[api-id].execute-api.[region].amazonaws.com/v1/health/detailed
```

## Monitoring Tools

### Real-time Logs

```bash
# Stream all logs
npm run logs

# Stream only health check logs
npm run logs:health
```

### Health Check Testing

```bash
# Run continuous health checks (every 30 seconds by default)
npm run health-check

# Custom interval and endpoint
node scripts/health-checker.js https://your-endpoint.com/health 10
```

### CloudWatch Dashboard

```bash
# Create or update CloudWatch dashboard
npm run dashboard
```

## Available Scripts

- `npm run build-layer`: Install dependencies for the Lambda layer
- `npm run clean-deps`: Clean up unnecessary files in node_modules
- `npm run deploy:optimized`: Full optimized deployment process
- `npm run health-server`: Run a local health check server
- `npm run logs`: Stream real-time logs from Lambda
- `npm run logs:health`: Stream health-check related logs
- `npm run health-check`: Run continuous health checks
- `npm run dashboard`: Create CloudWatch dashboard

## Future Optimizations

- Implement esbuild or webpack bundling
- Further code splitting
- Implement tree-shaking for unused code
- Analyze dependency usage to remove unused packages
