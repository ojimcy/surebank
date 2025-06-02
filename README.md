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

## Serverless Framework v4 Authentication

This project uses Serverless Framework v4, which requires authentication. There are two ways to authenticate:

### Interactive Login (Development)

For local development, you can use the interactive login:

```bash
serverless login
```

This will open a browser window where you can log in to your Serverless Dashboard account.

### Non-Interactive Authentication (CI/CD)

For CI/CD pipelines or headless environments, you can use an access key:

1. Go to the [Serverless Dashboard](https://app.serverless.com/)
2. Navigate to your profile > Access Keys
3. Create a new access key for CI/CD use
4. Set it as an environment variable in your CI/CD system:

```bash
export SERVERLESS_ACCESS_KEY=your-access-key-here
```

Then you can run commands like:

```bash
serverless deploy
```

Without any interactive prompts. The `SERVERLESS_ACCESS_KEY` environment variable will be used for authentication.

Note: According to Serverless documentation, organizations with revenue under $2 million annually do not need a paid license for Serverless Framework v4.
