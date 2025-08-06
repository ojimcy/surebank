# Surebank API Deployment Guide

This guide covers deployment setup for both development and production environments using AWS Lambda and Serverless Framework.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **AWS CLI** configured with appropriate credentials
3. **Serverless Framework** installed globally: `npm install -g serverless`
4. **MongoDB** (local for dev, MongoDB Atlas for prod)

### Quick Deploy to Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.template .env
# Edit .env and set NODE_ENV=development

# 3. Deploy
npm run deploy:dev
```

### Quick Deploy to Production

```bash
# 1. Install dependencies
npm ci --only=production

# 2. Set up environment  
cp .env.template .env
# Edit .env and set NODE_ENV=production

# 3. Deploy
npm run deploy:prod
```

### Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.template .env
   ```

2. **Update environment variables** in the `.env` file with your actual values

3. **Set NODE_ENV** based on your deployment target:
   - Development: `NODE_ENV=development`
   - Production: `NODE_ENV=production`

## 📋 Available npm Scripts

### Development Deployment
```bash
# Deploy to development environment
npm run deploy:dev

# Get deployment info
npm run info:dev

# View logs in real-time
npm run logs:dev

# Remove development deployment
npm run remove:dev
```

### Production Deployment
```bash
# Deploy to production environment
npm run deploy:prod

# Get deployment info
npm run info:prod

# View logs in real-time
npm run logs:prod

# Remove production deployment (⚠️ Use with caution!)
npm run remove:prod
```

### Local Development
```bash
# Run serverless offline for local development
npm run sls

# Run with local environment
npm run dev
```

## 🏗️ Deployment Process

### Development Deployment

1. **Automatic checks** (predeploy:dev):
   - Runs ESLint
   - Runs tests

2. **Deployment**:
   ```bash
   npm run deploy:dev
   ```

3. **Post-deployment**:
   - Shows API endpoints and stack info

### Production Deployment

1. **Comprehensive checks** (predeploy:prod):
   - Runs ESLint
   - Runs all tests
   - Generates test coverage report
   - Runs security audit

2. **Deployment**:
   ```bash
   npm run deploy:prod
   ```

3. **Features**:
   - Higher memory allocation (2048MB)
   - Provisioned concurrency (5 warm instances)
   - X-Ray tracing enabled
   - CloudWatch alarms
   - Dead letter queue for failed invocations

## 🔧 Configuration Details

### Serverless Configuration

Uses a single `serverless.yml` file with environment-based settings:

- **Development** (`NODE_ENV=development`):
  - Memory: 1024MB
  - Concurrency: 10 (limited)
  - CORS: Includes localhost and dev domains
  - Tracing: Disabled
  - Log level: Debug

- **Production** (`NODE_ENV=production`):
  - Memory: 2048MB
  - Concurrency: 100
  - Provisioned concurrency: 5
  - Monitoring: X-Ray tracing, CloudWatch alarms
  - CORS: Production domains only
  - Dead letter queue for failed invocations
  - Log level: Warn

### Environment Variables

The application uses a single `.env` file with intelligent defaults based on `NODE_ENV`:

#### Development (`NODE_ENV=development`)
- **JWT**: 30min access, 30 day refresh tokens
- **Blockchain**: Testnet endpoints (BSC testnet, Polygon testnet)  
- **Reloadly**: Sandbox endpoints
- **SMS**: "SUREBANK-DEV" sender
- **CORS**: Permissive for development

#### Production (`NODE_ENV=production`)
- **JWT**: 15min access, 7 day refresh tokens
- **Blockchain**: Mainnet endpoints (BSC mainnet, Polygon mainnet)
- **Reloadly**: Production endpoints
- **SMS**: "SUREBANK" sender  
- **CORS**: Restricted to production domains
- **Database**: Enhanced connection pooling

#### Smart Defaults
Many settings auto-configure based on `NODE_ENV`. You only need to specify values in `.env` when you want to override the defaults.

## 🚀 Manual Deployment Process

### Development Deployment
1. **Set up environment:**
   ```bash
   cp .env.template .env
   # Edit .env with development values and set NODE_ENV=development
   ```

2. **Deploy:**
   ```bash
   npm run deploy:dev
   ```

### Production Deployment
1. **Set up environment:**
   ```bash
   cp .env.template .env
   # Edit .env with production values and set NODE_ENV=production
   ```

2. **Deploy:**
   ```bash
   npm run deploy:prod
   ```

### AWS Credentials Setup
Ensure your AWS CLI is configured with appropriate credentials:
```bash
aws configure
# Or use AWS profiles
aws configure --profile dev
aws configure --profile prod
```

## 📊 Monitoring & Observability

### CloudWatch Logs
- **Development**: `/aws/lambda/surebank-api-dev-api`
- **Production**: `/aws/lambda/surebank-api-prod-api`

### CloudWatch Alarms (Production Only)
- **High Error Rate**: Triggers when errors > 10 in 5 minutes
- **High Duration**: Triggers when avg duration > 25 seconds

### X-Ray Tracing (Production Only)
- Enabled for Lambda functions and API Gateway
- Helps identify performance bottlenecks

## 🛠️ Troubleshooting

### Common Issues

1. **Deployment Fails with Permission Error**
   ```bash
   # Check AWS credentials
   aws sts get-caller-identity
   
   # Ensure IAM user has necessary permissions
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Verify environment files exist
   ls -la env.*.json .env.*
   
   # Check serverless configuration
   npx serverless print --config serverless.dev.yml
   ```

3. **Database Connection Issues**
   ```bash
   # Test MongoDB connection
   npm run invoke:dev -- --data '{"httpMethod":"GET","path":"/v1/auth/health"}'
   ```

4. **Lambda Timeout Issues**
   ```bash
   # Check CloudWatch logs
   npm run logs:dev
   
   # Increase timeout in serverless config if needed
   ```

### Debugging Commands

```bash
# Check deployment status
npm run info:dev
npm run info:prod

# Invoke function locally
npm run invoke:dev
npm run invoke:prod

# View real-time logs
npm run logs:dev --tail
npm run logs:prod --tail

# Print resolved serverless config
npx serverless print --config serverless.dev.yml
```

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit actual credentials to Git
   - Use different secrets for dev/prod
   - Rotate secrets regularly

2. **AWS IAM**
   - Use least-privilege principle
   - Separate IAM users for dev/prod
   - Enable MFA for production access

3. **Database**
   - Use MongoDB Atlas with IP whitelisting
   - Enable authentication and encryption
   - Regular backups

4. **API Security**
   - JWT tokens with short expiration
   - Rate limiting enabled
   - CORS properly configured
   - Input validation on all endpoints

## 🚨 Emergency Procedures

### Rollback Deployment
```bash
# List previous deployments
aws cloudformation describe-stacks

# Rollback to previous version (if needed)
aws cloudformation cancel-update-stack --stack-name surebank-api-prod
```

### Complete Removal
```bash
# Remove development stack
npm run remove:dev

# Remove production stack (⚠️ DANGER!)
npm run remove:prod
```

### Database Issues
1. Check MongoDB Atlas status
2. Verify connection strings
3. Check IP whitelist settings
4. Review CloudWatch logs for connection errors

## 📝 Deployment Checklist

### Before Each Deployment

- [ ] All tests passing locally
- [ ] No uncommitted changes (for prod)
- [ ] Environment variables updated
- [ ] Database migrations completed (if any)
- [ ] Dependencies updated and audited

### After Deployment

- [ ] API endpoints responding correctly
- [ ] Database connections working
- [ ] CloudWatch logs show no errors
- [ ] Performance metrics within expected ranges
- [ ] External integrations functioning

### Production Deployment Only

- [ ] Backup created
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment
- [ ] Health checks passing
- [ ] Documentation updated