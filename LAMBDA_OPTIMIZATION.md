# Lambda Timeout Optimization Guide

## Changes Made to Fix Timeout Issues

### 1. Fixed N+1 Query Problem
- **File**: `src/services/product.service.js`
- **Issue**: `getProductsBySlug` was making individual database queries for each product
- **Fix**: Changed to use a single query with `$in` operator to fetch all products at once

### 2. Optimized Database Connection for Lambda
- **File**: `sls.js`
- **Issue**: Creating new MongoDB connections on every Lambda invocation
- **Fix**: 
  - Added connection caching
  - Set `context.callbackWaitsForEmptyEventLoop = false` to prevent Lambda from waiting
  - Added proper error handling for connection failures

### 3. Fixed Major Performance Issue in Contribution Service
- **File**: `src/services/reports.service.js`
- **Issue**: `getSumOfDailyContributionsByDate` was fetching ALL contributions then using JavaScript reduce()
- **Fix**: 
  - Replaced with MongoDB aggregation pipeline to sum on database side
  - Added in-memory caching with 5-minute TTL
  - Reduced query time from potentially minutes to milliseconds

### 4. Added Database Indexes
- **Files**: `src/models/contribution.schema.js`, `src/models/charge.schema.js`
- **Added indexes for**:
  - Single field indexes: date, branchId, createdBy, narration, reasons
  - Compound indexes for common query patterns
  - This dramatically speeds up filtered queries

### 5. Query Optimizations
- Added `.lean()` to read-only queries to return plain JavaScript objects
- Optimized populate queries to select only needed fields
- Used aggregation pipelines instead of JavaScript array operations

### 6. Implemented Caching Layer
- **File**: `src/services/cache.service.js`
- **Features**:
  - In-memory caching with configurable TTL
  - Smart cache key generation
  - Separate caches for different data types

### 7. Added Performance Monitoring
- **File**: `src/middlewares/performanceMonitor.js`
- **Purpose**: Log slow requests (>5 seconds) to identify problematic endpoints

### 8. Lambda Configuration Optimization
- **File**: `serverless.yml`
- **Changes**:
  - Increased memory to 1024MB (improves CPU performance)
  - Reduced timeout to 30 seconds (after optimizations)

## Additional Recommendations

### 1. Increase Lambda Memory
Lambda CPU power scales with memory. Consider increasing memory to 1024MB or higher:
```yaml
# serverless.yml
functions:
  api:
    handler: sls.handler
    memorySize: 1024  # Increase from default 512MB
    timeout: 30       # Can reduce from 90s after optimizations
```

### 2. Enable Provisioned Concurrency
For production, consider using provisioned concurrency to eliminate cold starts:
```yaml
functions:
  api:
    handler: sls.handler
    provisionedConcurrency: 2  # Keep 2 warm instances
```

### 3. Database Indexing
Ensure MongoDB indexes exist for commonly queried fields:
```javascript
// Example indexes to add
accountSchema.index({ userId: 1, accountType: 1 });
productSchema.index({ merchantId: 1, status: 1 });
collectionSchema.index({ slug: 1 });
```

### 4. Use MongoDB Atlas Performance Advisor
- Check MongoDB Atlas Performance Advisor for slow queries
- Enable query profiling to identify bottlenecks

### 5. Implement Caching
Consider adding Redis caching for frequently accessed data:
- Product catalogs
- User permissions
- Collection data

### 6. Query Optimization Tips
- Always use `.lean()` for read-only queries
- Limit populated fields to only what's needed
- Use projection to select only required fields
- Implement pagination with reasonable limits

### 7. Monitor CloudWatch Logs
After deployment, monitor CloudWatch logs for:
- Slow request warnings from performance monitor
- Database connection errors
- Memory usage patterns

## Testing the Optimizations

1. Deploy the changes:
   ```bash
   npm run sls deploy
   ```

2. Monitor CloudWatch logs for performance warnings

3. Test specific endpoints that were timing out

4. Check Lambda metrics in AWS Console:
   - Duration
   - Memory usage
   - Cold start frequency

## Common Timeout Causes to Check

1. **Large Data Processing**: Break into smaller chunks or use Step Functions
2. **External API Calls**: Add timeouts and retry logic
3. **Complex Aggregations**: Optimize MongoDB queries or pre-aggregate data
4. **Missing Indexes**: Check query patterns and add appropriate indexes
5. **Connection Pool Exhaustion**: Monitor active connections

## Emergency Fixes

If timeouts persist:
1. Temporarily increase Lambda timeout to 5 minutes (300s)
2. Enable X-Ray tracing to identify bottlenecks
3. Check MongoDB Atlas metrics for slow queries
4. Consider moving heavy operations to background jobs (SQS/EventBridge)