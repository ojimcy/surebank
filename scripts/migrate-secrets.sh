#!/bin/bash

# Migration Script: Transfer secrets from env.json to AWS Secrets Manager
# This script reads your current env.json and uploads secrets to AWS

set -e

echo "🔄 Migrating secrets from env.json to AWS Secrets Manager..."

# Check if env.json exists
if [ ! -f "env.json" ]; then
    echo "❌ env.json not found. Please run this script from the project root."
    exit 1
fi

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not installed. Please install it first."
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq not installed. Please install it first: brew install jq"
    exit 1
fi

AWS_REGION=${AWS_REGION:-us-east-1}
echo "📍 Using AWS Region: $AWS_REGION"

# Function to create or update secret
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2
    
    echo "🔐 Processing secret: $secret_name"
    
    # Check if secret exists
    if aws secretsmanager describe-secret --secret-id "$secret_name" --region "$AWS_REGION" &> /dev/null; then
        echo "   ↻ Updating existing secret..."
        aws secretsmanager update-secret \
            --secret-id "$secret_name" \
            --secret-string "$secret_value" \
            --region "$AWS_REGION" > /dev/null
    else
        echo "   ⚡ Creating new secret..."
        aws secretsmanager create-secret \
            --name "$secret_name" \
            --secret-string "$secret_value" \
            --region "$AWS_REGION" > /dev/null
    fi
    echo "   ✅ $secret_name completed"
}

# Read env.json and extract secrets
echo "📖 Reading env.json..."

# Database secrets
DATABASE_SECRETS=$(jq -n \
    --arg mongodb_url "$(jq -r '.MONGODB_URL' env.json)" \
    --arg encryption_key "$(jq -r '.ENCRYPTION_KEY' env.json)" \
    '{
        "MONGODB_URL": $mongodb_url,
        "ENCRYPTION_KEY": $encryption_key
    }')

# JWT secrets
JWT_SECRETS=$(jq -n \
    --arg jwt_secret "$(jq -r '.JWT_SECRET' env.json)" \
    --arg access_exp "$(jq -r '.JWT_ACCESS_EXPIRATION_MINUTES' env.json)" \
    --arg refresh_exp "$(jq -r '.JWT_REFRESH_EXPIRATION_DAYS' env.json)" \
    --arg reset_exp "$(jq -r '.JWT_RESET_PASSWORD_EXPIRATION_MINUTES' env.json)" \
    --arg verify_exp "$(jq -r '.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES' env.json)" \
    '{
        "JWT_SECRET": $jwt_secret,
        "JWT_ACCESS_EXPIRATION_MINUTES": ($access_exp | tonumber),
        "JWT_REFRESH_EXPIRATION_DAYS": ($refresh_exp | tonumber),
        "JWT_RESET_PASSWORD_EXPIRATION_MINUTES": ($reset_exp | tonumber),
        "JWT_VERIFY_EMAIL_EXPIRATION_MINUTES": ($verify_exp | tonumber)
    }')

# Paystack secrets
PAYSTACK_SECRETS=$(jq -n \
    --arg secret_key "$(jq -r '.PAYSTACK_SECRET_KEY' env.json)" \
    --arg public_key "$(jq -r '.PAYSTACK_PUBLIC_KEY' env.json)" \
    --arg callback_url "$(jq -r '.PAYSTACK_CALLBACK_URL' env.json)" \
    --arg base_url "$(jq -r '.PAYSTACK_BASE_URL' env.json)" \
    '{
        "PAYSTACK_SECRET_KEY": $secret_key,
        "PAYSTACK_PUBLIC_KEY": $public_key,
        "PAYSTACK_CALLBACK_URL": $callback_url,
        "PAYSTACK_BASE_URL": $base_url
    }')

# System secrets
SYSTEM_SECRETS=$(jq -n \
    --arg system_account "$(jq -r '.SYSTEM_ACCOUNT_ID' env.json)" \
    --arg online_branch "$(jq -r '.ONLINE_BRANCH_ID' env.json)" \
    --arg s3_bucket "$(jq -r '.AWS_S3_BUCKET' env.json)" \
    --arg upstash_url "$(jq -r '.UPSTASH_REDIS_URL' env.json)" \
    --arg upstash_token "$(jq -r '.UPSTASH_REDIS_TOKEN' env.json)" \
    --arg use_upstash "$(jq -r '.USE_UPSTASH' env.json)" \
    --arg client_url "$(jq -r '.CLIENT_URL' env.json)" \
    --arg frontend_url "$(jq -r '.FRONTEND_URL' env.json)" \
    --arg mobile_scheme "$(jq -r '.MOBILE_APP_SCHEME' env.json)" \
    '{
        "SYSTEM_ACCOUNT_ID": $system_account,
        "ONLINE_BRANCH_ID": $online_branch,
        "AWS_S3_BUCKET": $s3_bucket,
        "UPSTASH_REDIS_URL": $upstash_url,
        "UPSTASH_REDIS_TOKEN": $upstash_token,
        "USE_UPSTASH": $use_upstash,
        "NODE_ENV": "production",
        "PORT": 3001,
        "CLIENT_URL": $client_url,
        "FRONTEND_URL": $frontend_url,
        "MOBILE_APP_SCHEME": $mobile_scheme
    }')

# Communication secrets
COMM_SECRETS=$(jq -n \
    --arg email_from "$(jq -r '.EMAIL_FROM' env.json)" \
    --arg mailgun_domain "$(jq -r '.MAILGUN_DOMAIN' env.json)" \
    --arg mailgun_key "$(jq -r '.MAILGUN_API_KEY' env.json)" \
    --arg mailgun_user "$(jq -r '.MAILGUN_API_USERNAME' env.json)" \
    --arg mailgun_url "$(jq -r '.MAILGUN_BASE_URL' env.json)" \
    --arg sms_token "$(jq -r '.SMS_API_TOKEN' env.json)" \
    --arg sms_sender "$(jq -r '.SMS_SENDER' env.json)" \
    --arg sms_url "$(jq -r '.SMS_PROVIDER_URL' env.json)" \
    --arg twilio_sid "$(jq -r '.TWILIO_ACCOUNT_SID' env.json)" \
    --arg twilio_token "$(jq -r '.TWILIO_AUTH_TOKEN' env.json)" \
    --arg twilio_phone "$(jq -r '.TWILIO_PHONE_NUMBER' env.json)" \
    --arg meta_phone "$(jq -r '.META_PHONE_NUMBER_ID' env.json)" \
    --arg meta_token "$(jq -r '.META_ACCESS_TOKEN' env.json)" \
    '{
        "EMAIL_FROM": $email_from,
        "MAILGUN_DOMAIN": $mailgun_domain,
        "MAILGUN_API_KEY": $mailgun_key,
        "MAILGUN_API_USERNAME": $mailgun_user,
        "MAILGUN_BASE_URL": $mailgun_url,
        "SMS_API_TOKEN": $sms_token,
        "SMS_SENDER": $sms_sender,
        "SMS_PROVIDER_URL": $sms_url,
        "TWILIO_ACCOUNT_SID": $twilio_sid,
        "TWILIO_AUTH_TOKEN": $twilio_token,
        "TWILIO_PHONE_NUMBER": $twilio_phone,
        "META_PHONE_NUMBER_ID": $meta_phone,
        "META_ACCESS_TOKEN": $meta_token
    }')

# Create/update all secrets
echo ""
echo "🚀 Creating/updating secrets in AWS Secrets Manager..."

create_or_update_secret "surebank/prod/database" "$DATABASE_SECRETS"
create_or_update_secret "surebank/prod/jwt" "$JWT_SECRETS"
create_or_update_secret "surebank/prod/paystack" "$PAYSTACK_SECRETS"
create_or_update_secret "surebank/prod/system" "$SYSTEM_SECRETS"
create_or_update_secret "surebank/prod/communications" "$COMM_SECRETS"

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Verify secrets in AWS Console: https://console.aws.amazon.com/secretsmanager/"
echo "  2. Test your application with NODE_ENV=production"
echo "  3. Remove or secure your local env.json file"
echo ""
echo "🔍 To verify secrets:"
echo "  aws secretsmanager list-secrets --region $AWS_REGION | grep surebank"