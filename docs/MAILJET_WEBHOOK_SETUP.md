# Mailjet Webhook Setup Guide

## Overview

Based on Mailjet's 2025 documentation, webhooks are configured **per event type**. This means you need to create separate webhook configurations for each type of email event you want to track (sent, opened, clicked, bounced, etc.).

## Event Types

The following event types are monitored (excluding 'sent' due to high volume):

- **open** - Email opened by recipient  
- **click** - Link clicked in email
- **bounce** - Email bounced (hard or soft bounce)
- **spam** - Email marked as spam
- **blocked** - Email blocked by email provider
- **unsub** - Recipient unsubscribed

> **Note**: The 'sent' event is excluded as Mailjet discourages tracking it due to the high volume of events it generates.

## Webhook URL Structure

Your webhook endpoint should be accessible at:
```
https://a5shket0i1.execute-api.us-east-1.amazonaws.com/v1/mailjet/webhook?secret=YOUR_SECRET_TOKEN
```

## Automated Setup

### 1. Setup All Webhooks Automatically

```bash
# Setup all webhook events
node scripts/setup-mailjet-webhooks.js

# Recreate all webhooks (deletes existing ones first)
node scripts/setup-mailjet-webhooks.js --recreate

# List existing webhooks only
node scripts/setup-mailjet-webhooks.js --list
```

### 2. Test Webhook Endpoint

```bash
# Test if your webhook endpoint is working
node scripts/test-webhook-endpoint.js
```

## Manual Setup (Alternative)

If you prefer to set up webhooks manually via Mailjet dashboard:

1. **Login to Mailjet** → Go to Account Settings
2. **Navigate to REST API** → Event notifications (webhooks)  
3. **For each event type**, create a new webhook:
   - **Event Type**: Select the event (sent, open, click, etc.)
   - **Webhook URL**: `https://a5shket0i1.execute-api.us-east-1.amazonaws.com/v1/mailjet/webhook?secret=1234567890`
   - **Description**: Descriptive name for the webhook
   - **Status**: Active

## Webhook Payload Structure

Each webhook will receive a JSON array of events. Example payload:

```json
[
  {
    "event": "sent",
    "time": 1644854400,
    "MessageID": 123456789,
    "MessageUUID": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "mj_campaign_id": 0,
    "mj_contact_id": 0,
    "customcampaign": "",
    "CustomID": "user-signup-email",
    "Payload": ""
  }
]
```

### Event-Specific Fields

- **Click events** include `url` field indicating which link was clicked
- **Bounce events** include `bounce_date`, `hard_bounce`, `error` fields
- **Spam events** include `source` field
- **Blocked events** include `error` and `error_related_to` fields

## Security

### Authentication Methods

The webhook controller supports two authentication methods:

1. **Secret Token (Recommended)**: Add `?secret=YOUR_SECRET` to webhook URL
2. **Signature Verification**: Mailjet signs requests with HMAC-SHA256

### Configuration

Update your `env.json`:
```json
{
  "MAILJET_WEBHOOK_SECRET": "your-secure-secret-token"
}
```

## Testing

### 1. Test Webhook Endpoint Reachability
```bash
node scripts/test-webhook-endpoint.js
```

### 2. Monitor Webhook Activity

Check your application logs for webhook events:
```bash
# View recent webhook activity in logs
tail -f logs/app.log | grep "Mailjet webhook"
```

### 3. Webhook Statistics

Get webhook statistics via API:
```bash
curl https://a5shket0i1.execute-api.us-east-1.amazonaws.com/v1/mailjet/stats
```

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check if webhook URL is accessible from internet
   - Verify secret token matches configuration
   - Check Mailjet dashboard for webhook status

2. **Authentication errors**
   - Ensure `MAILJET_WEBHOOK_SECRET` matches URL parameter
   - Check webhook signature verification

3. **Event processing errors**
   - Check application logs for processing errors
   - Verify database connection for email suppression updates

### Debug Mode

Enable debug logging in `env.json`:
```json
{
  "LOG_LEVEL": "debug"
}
```

## Webhook Event Processing

The webhook controller automatically:

1. **Validates** incoming webhook requests
2. **Updates email suppressions** for bounces, spam, blocks, unsubscribes
3. **Logs email events** for tracking and analytics
4. **Updates email delivery statistics**

## API Endpoints

- `POST /v1/mailjet/webhook` - Receive webhook events
- `GET /v1/mailjet/stats` - Get webhook statistics  
- `GET /v1/mailjet/suppressions` - Get suppression list

## Best Practices

1. **Monitor webhook status** in Mailjet dashboard regularly
2. **Set up alerts** for webhook failures
3. **Use HTTPS** for all webhook URLs
4. **Implement proper error handling** in webhook processing
5. **Scale webhook processing** for high email volumes using queues

## Next Steps

After setting up webhooks:

1. **Send test emails** to verify webhook events are received
2. **Monitor suppression list** updates
3. **Set up email analytics** dashboards
4. **Configure alerts** for email delivery issues