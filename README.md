# Defipay API

## Notification Preferences Migration

After upgrading to the simplified notification preferences schema, you need to run a migration script to update existing user preferences. There are two ways to run the migration:

### Option 1: API Endpoint (Recommended)

Make a POST request to the migrations endpoint with admin credentials:

```
POST /v1/migrations/notification-preferences
Authorization: Bearer {admin_token}
```

This will run the migration within the application context, ensuring all environment variables are properly loaded.

### Option 2: Script

If you prefer to run the script directly:

1. Make sure your environment variables are properly set up in your `.env` file, especially `MONGODB_URL`
2. Run the migration script:

```bash
NODE_ENV=development node migrate-notifications.js
```

The migration:

- Finds all existing notification preferences
- Converts them from the old format with nested `{ channel, enabled }` properties to the new direct `channel` format
- Handles any errors during migration
- Reports the number of migrated and skipped preferences

During the migration period, the notification service is designed to handle both old and new formats, ensuring backwards compatibility.
