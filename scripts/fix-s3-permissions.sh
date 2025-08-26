#!/bin/bash

# S3 Bucket Configuration Script for KYC Documents
# This script updates the S3 bucket policy and CORS configuration to allow public read access

BUCKET_NAME="surebank-kyc-documents"
REGION="us-east-1"

echo "Updating S3 bucket permissions for: $BUCKET_NAME"

# 1. Update bucket policy to allow public read access
echo "Setting bucket policy..."
cat > /tmp/bucket-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json --region $REGION

if [ $? -eq 0 ]; then
    echo "✓ Bucket policy updated successfully"
else
    echo "✗ Failed to update bucket policy"
fi

# 2. Configure CORS to allow cross-origin requests
echo "Setting CORS configuration..."
cat > /tmp/cors-config.json <<EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": [
                "https://surebank.ng",
                "https://surebank.sonicflare.net",
                "https://admin.surebankstores.ng",
                "https://localhost",
                "https://localhost:8081",
                "http://localhost:8081",
                "http://localhost:8080",
                "http://localhost:3001",
                "http://localhost:3000"
            ],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file:///tmp/cors-config.json --region $REGION

if [ $? -eq 0 ]; then
    echo "✓ CORS configuration updated successfully"
else
    echo "✗ Failed to update CORS configuration"
fi

# 3. Disable Block Public Access settings (if needed)
echo "Updating Block Public Access settings..."
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
    --region $REGION

if [ $? -eq 0 ]; then
    echo "✓ Block Public Access settings updated"
else
    echo "✗ Failed to update Block Public Access settings"
fi

# 4. Verify the configuration
echo ""
echo "Verifying configuration..."
echo "Bucket Policy:"
aws s3api get-bucket-policy --bucket $BUCKET_NAME --region $REGION 2>/dev/null | jq '.'

echo ""
echo "CORS Configuration:"
aws s3api get-bucket-cors --bucket $BUCKET_NAME --region $REGION 2>/dev/null | jq '.'

echo ""
echo "Public Access Block Configuration:"
aws s3api get-public-access-block --bucket $BUCKET_NAME --region $REGION 2>/dev/null | jq '.'

# Clean up temporary files
rm -f /tmp/bucket-policy.json /tmp/cors-config.json

echo ""
echo "S3 bucket configuration complete!"
echo "Your KYC document images should now be accessible."
echo ""
echo "Test URL: https://$BUCKET_NAME.s3.$REGION.amazonaws.com/test-file.jpg"