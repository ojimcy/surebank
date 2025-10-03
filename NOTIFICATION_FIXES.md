# Transaction Email Notification Fixes

## Summary
Fixed transaction email notifications that were failing for package creation, deposits, withdrawals, and contributions. Updated user notification preferences to support all transaction types.

## Changes Made

### 1. Notification Preference Schema Updates
**File:** `src/models/notificationPreference.schema.js`

#### Added Missing Notification Types:
- `package_maturity_alert` - For package maturity notifications
- `withdrawal_success` - When withdrawal completes successfully
- `withdrawal_failed` - When withdrawal fails
- `deposit_confirmation` - For deposit confirmations
- `contribution_notification` - For package contributions

#### Updated Default Preferences:
All new notification types default to `'both'` (email + in-app) to ensure users receive important transaction alerts.

### 2. Interest Package Service Migration
**File:** `src/services/interestPackage.service.js`

#### Changes:
- **Migrated from direct email calls to `sendMultiChannelNotification`**
  - Package creation now uses unified notification system
  - Package maturity now uses unified notification system
- **Removed direct dependencies on:**
  - `sendTransactionalEmail`
  - `sendPackageCreationEmail`
  - Direct SMS calls
- **Added proper error handling** with detailed logging
- **Added user preference checking** - respects user notification settings

#### Benefits:
- Consistent notification delivery across all channels
- Proper user preference enforcement
- Better error tracking
- Email queuing for reliability

### 3. Enhanced Notification Service Logging
**File:** `src/services/notification.service.js`

#### Improvements:
- **Detailed logging at every step:**
  - Start of multi-channel notification
  - In-app notification attempts
  - Email preference checks
  - Email queueing/sending
  - SMS sending
  - Completion summary with results
- **Better error handling:**
  - Structured error logging with stack traces
  - Separate logging for preference-blocked vs failed notifications
  - No email address warnings
- **Priority classification:**
  - Added new transaction types to priority lists
  - `withdrawal_success`, `withdrawal_failed` → HIGH priority
  - `contribution_notification`, `deposit_confirmation` → NORMAL priority

### 4. New Email Templates Created
**Directory:** `src/templates/emails/`

Created MJML templates for previously missing notification types:

#### `withdrawal-success-mjml.template.js`
- Professional success notification
- Transaction details table
- Green success indicators
- Reference number display
- Account balance information

#### `withdrawal-failed-mjml.template.js`
- Error notification with red indicators
- Failure reason display
- Funds refund notice
- Support contact information
- Clear call-to-action for retry

#### `deposit-confirmation-mjml.template.js`
- Deposit success notification
- Amount and new balance display
- Transaction description
- Receipt for record-keeping

### 5. Mailjet Service Template Registry
**File:** `src/services/mailjet.service.js`

Added new templates to the email templates registry:
- `WITHDRAWAL_SUCCESS`
- `WITHDRAWAL_FAILED`
- `DEPOSIT_CONFIRMATION`

## Testing Instructions

### 1. Package Creation Email Test
```bash
# Create a new interest package
# Expected: Email should be sent to user with package details
# Check logs for: "Email notification queued/sent successfully to {email} for type package_created"
```

### 2. Contribution Email Test
```bash
# Make a contribution to existing package (SB or DS)
# Expected: Email with contribution confirmation
# Check logs for: "Sending contribution email to {email} for type contribution_notification"
```

### 3. Withdrawal Email Test
```bash
# Create and approve a withdrawal request
# Expected:
# - Request email on creation
# - Success email when transfer completes
# - Failed email if transfer fails
# Check logs for withdrawal_success or withdrawal_failed notifications
```

### 4. Deposit Email Test
```bash
# Make a customer deposit
# Expected: Deposit confirmation email
# Check logs for: "Email notification queued/sent successfully to {email} for type deposit_confirmation"
```

### 5. User Notification Preferences Test
```bash
# Get user preferences
GET /v1/notifications/preferences

# Expected response should include all new types:
# - package_maturity_alert
# - withdrawal_success
# - withdrawal_failed
# - deposit_confirmation
# - contribution_notification

# Update preferences
PATCH /v1/notifications/preferences
{
  "preferences": {
    "contribution_notification": "email",
    "withdrawal_success": "both"
  }
}
```

### 6. Log Monitoring
Key log messages to look for:

✅ **Success Indicators:**
```
Starting multi-channel notification for user {userId}, type: {type}
Sending in-app notification to user {userId} for type {type}
Queueing template email ({template}) to {email} for type {type} with priority {priority}
Email notification queued/sent successfully to {email} for type {type}
Multi-channel notification completed for user {userId}, type: {type}. Results: inApp={true}, email={true}, sms={false}
```

❌ **Error Indicators:**
```
Error sending email notification to {email} for type {type}
Email notification skipped for user {userId} - no email address available
Email notification skipped for user {userId} - preference is none for type {type}
```

## Verification Checklist

- [ ] Package creation emails are being sent
- [ ] Contribution emails are being sent
- [ ] Withdrawal request emails are being sent
- [ ] Withdrawal success emails are being sent
- [ ] Withdrawal failure emails are being sent (test with invalid bank details)
- [ ] Deposit confirmation emails are being sent
- [ ] User preferences include all new notification types
- [ ] Email queue is processing jobs (check Redis/Upstash)
- [ ] Logs show detailed notification flow
- [ ] Templates render correctly with MJML
- [ ] User preference blocking works (set to 'none' and verify no email sent)

## Environment Variables
Ensure these are set correctly:

```env
# Mailjet Configuration
MAILJET_API_KEY=your_api_key
MAILJET_API_SECRET=your_api_secret
MAILJET_FROM_EMAIL=noreply@surebankstores.ng
MAILJET_FROM_NAME=SureBank

# Redis/Upstash (for email queue)
USE_UPSTASH=true
UPSTASH_REDIS_URL=your_url
UPSTASH_REDIS_TOKEN=your_token

# Frontend URL (for email links)
FRONTEND_URL=https://your-frontend-url.com
```

## Rollback Instructions
If issues occur, revert these files:
1. `src/models/notificationPreference.schema.js`
2. `src/services/interestPackage.service.js`
3. `src/services/notification.service.js`
4. `src/services/mailjet.service.js`

Delete new templates:
- `src/templates/emails/withdrawal-success-mjml.template.js`
- `src/templates/emails/withdrawal-failed-mjml.template.js`
- `src/templates/emails/deposit-confirmation-mjml.template.js`

## Notes
- Password reset emails still work because they use a different flow (direct email service)
- All transaction emails now use the email queue for better reliability
- User preferences auto-populate on first access with defaults
- Email queue workers must be running for emails to send
- Check CloudWatch logs in production for detailed debugging
