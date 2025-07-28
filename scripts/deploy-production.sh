#!/bin/bash

# Production Deployment Script for SureBank
# This script handles deployment with AWS Secrets Manager

set -e  # Exit on any error

echo "🚀 Starting SureBank Production Deployment..."

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Verify AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure'."
    exit 1
fi

# Set environment variables
export NODE_ENV=production
export AWS_REGION=${AWS_REGION:-us-east-1}

echo "✅ AWS credentials verified"
echo "📍 Using AWS Region: $AWS_REGION"

# Check if secrets exist, create if they don't
echo "🔐 Checking AWS Secrets Manager..."

# Function to check if secret exists
check_secret() {
    local secret_name=$1
    if aws secretsmanager describe-secret --secret-id "$secret_name" --region "$AWS_REGION" &> /dev/null; then
        echo "✅ Secret '$secret_name' exists"
        return 0
    else
        echo "❌ Secret '$secret_name' does not exist"
        return 1
    fi
}

# Check all required secrets
SECRETS_MISSING=false

if ! check_secret "surebank/prod/database"; then
    SECRETS_MISSING=true
fi

if ! check_secret "surebank/prod/jwt"; then
    SECRETS_MISSING=true
fi

if ! check_secret "surebank/prod/paystack"; then
    SECRETS_MISSING=true
fi

if ! check_secret "surebank/prod/system"; then
    SECRETS_MISSING=true
fi

if [ "$SECRETS_MISSING" = true ]; then
    echo ""
    echo "🔧 Some secrets are missing. Would you like to create them? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "📝 Running setup-secrets.sh..."
        ./scripts/setup-secrets.sh
        echo ""
        echo "⚠️  IMPORTANT: Please update the secret values with your actual credentials:"
        echo "   aws secretsmanager update-secret --secret-id surebank/prod/database --secret-string '{\"MONGODB_URL\":\"your-prod-url\"}'"
        echo "   aws secretsmanager update-secret --secret-id surebank/prod/jwt --secret-string '{\"JWT_SECRET\":\"your-strong-secret\"}'"
        echo "   aws secretsmanager update-secret --secret-id surebank/prod/paystack --secret-string '{\"PAYSTACK_SECRET_KEY\":\"your-key\"}'"
        echo "   aws secretsmanager update-secret --secret-id surebank/prod/system --secret-string '{\"SYSTEM_ACCOUNT_ID\":\"your-id\"}'"
        echo ""
        echo "❓ Have you updated all secret values? (y/n)"
        read -r secrets_updated
        if [[ ! "$secrets_updated" =~ ^[Yy]$ ]]; then
            echo "⏸️  Please update the secrets and run this script again."
            exit 1
        fi
    else
        echo "❌ Cannot deploy without secrets. Exiting."
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🔨 Building application..."
npm run build 2>/dev/null || echo "ℹ️  No build script found, skipping..."

# Deploy with serverless
echo "🚀 Deploying to AWS..."
npx serverless deploy --stage production --region "$AWS_REGION" --config env.production.json

# Verify deployment
echo "🔍 Verifying deployment..."
if aws lambda get-function --function-name surebank-api-production-api --region "$AWS_REGION" &> /dev/null; then
    echo "✅ Lambda function deployed successfully"
else
    echo "❌ Lambda deployment failed"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Post-deployment checklist:"
echo "  □ Test API endpoints"
echo "  □ Verify database connections"
echo "  □ Check CloudWatch logs"
echo "  □ Test payment processing"
echo "  □ Monitor application performance"
echo ""
echo "🔗 Useful commands:"
echo "  View logs: aws logs tail /aws/lambda/surebank-api-production-api --follow"
echo "  Check function: aws lambda get-function --function-name surebank-api-production-api"