#!/bin/bash

# 🔧 Mobile Payment Debug Script using cURL
# This script tests mobile vs web payment requests to debug callback URL issues

# Configuration
BASE_URL="${TEST_BASE_URL:-http://localhost:3000}"
JWT_TOKEN="${TEST_USER_TOKEN:-your-jwt-token-here}"
PACKAGE_ID="${TEST_PACKAGE_ID:-test-package-id}"

echo "🚀 Mobile Payment Debug Test"
echo "============================"
echo "Base URL: $BASE_URL"
echo "Has Token: $([ "$JWT_TOKEN" != "your-jwt-token-here" ] && echo "✅ Yes" || echo "❌ No - Set TEST_USER_TOKEN")"
echo "Package ID: $PACKAGE_ID"
echo ""

# Test Mobile Request
echo "🔵 Testing MOBILE payment request..."
echo "Headers: X-App-Platform: mobile, X-Mobile-App: true"
echo ""

MOBILE_RESPONSE=$(curl -s -X POST "$BASE_URL/v1/payments/init-contribution" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-App-Platform: mobile" \
  -H "X-Mobile-App: true" \
  -H "User-Agent: SureBank Mobile App (Capacitor)" \
  -d '{
    "contributionType": "daily_savings",
    "packageId": "'"$PACKAGE_ID"'",
    "amount": 1000
  }')

echo "Mobile Response:"
echo "$MOBILE_RESPONSE" | jq '.' 2>/dev/null || echo "$MOBILE_RESPONSE"
echo ""

# Extract authorization URL from mobile response
MOBILE_AUTH_URL=$(echo "$MOBILE_RESPONSE" | jq -r '.authorizationUrl // empty' 2>/dev/null)
if [ -n "$MOBILE_AUTH_URL" ]; then
  # Extract callback URL from authorization URL
  MOBILE_CALLBACK=$(echo "$MOBILE_AUTH_URL" | grep -o 'callback_url=[^&]*' | cut -d'=' -f2- | python3 -c "import sys, urllib.parse; print(urllib.parse.unquote(sys.stdin.read().strip()))")
  echo "📱 Mobile Callback URL: $MOBILE_CALLBACK"
  
  if [[ "$MOBILE_CALLBACK" == surebank://* ]]; then
    echo "✅ SUCCESS: Mobile callback URL is a deep link"
  else
    echo "❌ FAILED: Mobile callback URL is NOT a deep link"
  fi
else
  echo "❌ ERROR: No authorization URL in mobile response"
fi

echo ""
echo "=========================================="
echo ""

# Test Web Request
echo "🟡 Testing WEB payment request..."
echo "Headers: No mobile headers"
echo ""

WEB_RESPONSE=$(curl -s -X POST "$BASE_URL/v1/payments/init-contribution" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -d '{
    "contributionType": "daily_savings",
    "packageId": "'"$PACKAGE_ID"'",
    "amount": 1000
  }')

echo "Web Response:"
echo "$WEB_RESPONSE" | jq '.' 2>/dev/null || echo "$WEB_RESPONSE"
echo ""

# Extract authorization URL from web response
WEB_AUTH_URL=$(echo "$WEB_RESPONSE" | jq -r '.authorizationUrl // empty' 2>/dev/null)
if [ -n "$WEB_AUTH_URL" ]; then
  # Extract callback URL from authorization URL
  WEB_CALLBACK=$(echo "$WEB_AUTH_URL" | grep -o 'callback_url=[^&]*' | cut -d'=' -f2- | python3 -c "import sys, urllib.parse; print(urllib.parse.unquote(sys.stdin.read().strip()))")
  echo "🌐 Web Callback URL: $WEB_CALLBACK"
  
  if [[ "$WEB_CALLBACK" != surebank://* ]]; then
    echo "✅ SUCCESS: Web callback URL is NOT a deep link"
  else
    echo "❌ FAILED: Web callback URL is a deep link (should be web URL)"
  fi
else
  echo "❌ ERROR: No authorization URL in web response"
fi

echo ""
echo "📊 Summary:"
echo "==========="
echo "Mobile Callback: $MOBILE_CALLBACK"
echo "Web Callback: $WEB_CALLBACK"
echo ""

# Analysis
if [[ "$MOBILE_CALLBACK" == surebank://* ]] && [[ "$WEB_CALLBACK" != surebank://* ]]; then
  echo "🎉 ALL TESTS PASSED: Mobile and web callbacks are correctly differentiated"
elif [[ "$MOBILE_CALLBACK" != surebank://* ]]; then
  echo "❌ MOBILE ISSUE: Mobile requests are not generating deep link callbacks"
  echo "   Check mobile detection logic and headers"
elif [[ "$WEB_CALLBACK" == surebank://* ]]; then
  echo "❌ WEB ISSUE: Web requests are generating mobile callbacks"
  echo "   Check mobile detection logic"
else
  echo "❓ UNKNOWN ISSUE: Check the responses above for errors"
fi

echo ""
echo "🔍 Next Steps:"
echo "- Check server logs for detailed debugging information"
echo "- Verify Paystack dashboard settings"
echo "- Ensure environment variables are set correctly" 