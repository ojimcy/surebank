#!/bin/bash

# AWS Secrets Manager Setup Script for SureBank
# This script creates all necessary secrets in AWS Secrets Manager

echo "Setting up AWS Secrets Manager for SureBank..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Set AWS region
AWS_REGION=${AWS_REGION:-us-east-1}
echo "Using AWS Region: $AWS_REGION"

# Create Database Secrets
echo "Creating database secrets..."
aws secretsmanager create-secret \
    --name surebank/prod/database \
    --description "SureBank Production Database Credentials" \
    --secret-string '{
        "MONGODB_URL": "mongodb+srv://production-user:CHANGE_PASSWORD@production-cluster.mongodb.net/surebankProd?retryWrites=true&w=majority",
        "ENCRYPTION_KEY": "GENERATE_NEW_32_BYTE_BASE64_KEY_HERE"
    }' \
    --region $AWS_REGION || echo "Database secret already exists"

# Create JWT Secrets
echo "Creating JWT secrets..."
aws secretsmanager create-secret \
    --name surebank/prod/jwt \
    --description "SureBank JWT Configuration" \
    --secret-string '{
        "JWT_SECRET": "GENERATE_A_STRONG_SECRET_HERE",
        "JWT_ACCESS_EXPIRATION_MINUTES": 30,
        "JWT_REFRESH_EXPIRATION_DAYS": 30,
        "JWT_RESET_PASSWORD_EXPIRATION_MINUTES": 10,
        "JWT_VERIFY_EMAIL_EXPIRATION_MINUTES": 10
    }' \
    --region $AWS_REGION || echo "JWT secret already exists"

# Create Paystack Secrets
echo "Creating Paystack secrets..."
aws secretsmanager create-secret \
    --name surebank/prod/paystack \
    --description "SureBank Paystack Integration" \
    --secret-string '{
        "PAYSTACK_SECRET_KEY": "YOUR_PAYSTACK_SECRET_KEY",
        "PAYSTACK_PUBLIC_KEY": "YOUR_PAYSTACK_PUBLIC_KEY",
        "PAYSTACK_WEBHOOK_SECRET": "YOUR_WEBHOOK_SECRET"
    }' \
    --region $AWS_REGION || echo "Paystack secret already exists"

# Create System Configuration Secret
echo "Creating system configuration secret..."
aws secretsmanager create-secret \
    --name surebank/prod/system \
    --description "SureBank System Configuration" \
    --secret-string '{
        "SYSTEM_ACCOUNT_ID": "644abcc6218ab532c37a501e",
        "ONLINE_BRANCH_ID": "67ea4ca91059af22703a3c49",
        "AWS_S3_BUCKET": "surebank-kyc-documents",
        "UPSTASH_REDIS_URL": "https://YOUR_UPSTASH_ENDPOINT.upstash.io",
        "UPSTASH_REDIS_TOKEN": "YOUR_UPSTASH_TOKEN",
        "USE_UPSTASH": "true",
        "NODE_ENV": "production",
        "PORT": 3001,
        "CLIENT_URL": "https://surebank.ng",
        "FRONTEND_URL": "https://surebank.ng",
        "MOBILE_APP_SCHEME": "surebank"
    }' \
    --region $AWS_REGION || echo "System secret already exists"

# Create Communication Secrets
echo "Creating communication secrets..."
aws secretsmanager create-secret \
    --name surebank/prod/communications \
    --description "SureBank Communication Services" \
    --secret-string '{
        "EMAIL_FROM": "services@surebankstores.ng",
        "MAILGUN_DOMAIN": "mg.surebankstores.ng",
        "MAILGUN_API_KEY": "YOUR_PRODUCTION_MAILGUN_KEY",
        "MAILGUN_API_USERNAME": "api",
        "MAILGUN_BASE_URL": "https://api.mailgun.net/v3/mg.surebankstores.ng",
        "SMS_API_TOKEN": "YOUR_PRODUCTION_SMS_TOKEN",
        "SMS_SENDER": "SUREBLTD",
        "SMS_PROVIDER_URL": "https://www.bulksmsnigeria.com/api/v2/sms",
        "TWILIO_ACCOUNT_SID": "YOUR_PRODUCTION_TWILIO_SID",
        "TWILIO_AUTH_TOKEN": "YOUR_PRODUCTION_TWILIO_TOKEN",
        "TWILIO_PHONE_NUMBER": "whatsapp:+YOUR_PRODUCTION_NUMBER",
        "META_PHONE_NUMBER_ID": "YOUR_PRODUCTION_META_ID",
        "META_ACCESS_TOKEN": "YOUR_PRODUCTION_META_TOKEN"
    }' \
    --region $AWS_REGION || echo "Communication secret already exists"

echo ""
echo "Secrets creation complete!"
echo ""
echo "IMPORTANT: Please update the secret values with your actual credentials using:"
echo "aws secretsmanager update-secret --secret-id SECRET_NAME --secret-string 'JSON_STRING'"
echo ""
echo "To verify secrets were created:"
echo "aws secretsmanager list-secrets --region $AWS_REGION | grep surebank"
echo ""
echo "To view a specific secret (for verification only):"
echo "aws secretsmanager get-secret-value --secret-id surebank/prod/database --region $AWS_REGION"