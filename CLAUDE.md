# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `npm run local` - Runs local Express server with MongoDB connection (local-server.js)
- `npm run sls` - Runs Serverless offline mode for Lambda development
- `npm run dev` - Runs with nodemon for development (currently index.js is mostly commented out)

### Testing
- `npm test` - Run all tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run coverage` - Generate test coverage report

### Code Quality
- `npm run lint` - Run ESLint to check code style
- `npm run lint:fix` - Auto-fix linting issues
- `npm run prettier` - Check code formatting
- `npm run prettier:fix` - Auto-fix formatting issues

### Deployment
- `npm run deploy:dev` - Deploy to AWS development environment
- `npm run deploy:prod` - Deploy to AWS production environment
- `npm run deploy:optimized` - Build layers, clean deps, then deploy to dev
- `npm run build-layer` - Build Lambda layer dependencies

### Monitoring
- `npm run logs:dev` - Tail development Lambda logs
- `npm run logs:prod` - Tail production Lambda logs

## Architecture Overview

### Application Structure
This is a **Serverless Express.js API** for a banking/financial services platform deployed on AWS Lambda. The application uses:
- **Runtime**: Node.js 22.x on AWS Lambda via Serverless Framework v4
- **Database**: MongoDB (Mongoose ODM)
- **Caching**: Redis (with fallback support if unavailable)
- **Authentication**: JWT-based with Passport.js
- **Payment Processing**: Paystack integration for Nigerian payments

### Key Entry Points
- **sls.js**: Main Lambda handler for Serverless deployment, wraps Express app with serverless-http
- **local-server.js**: Local development server that connects to MongoDB directly
- **src/app.js**: Express application setup with all middleware configurations
- **src/index.js**: Traditional server entry (mostly commented out, used for reference)

### Environment Configuration
- **env.json**: Main environment variables (git-ignored, copy from env.example.json)
- **env-wrapper.js**: Loads environment variables for Serverless deployment
- Configuration is centralized in `src/config/config.js` using the env variables

### Security Layers
The application implements multiple security layers:
1. **Rate Limiting**: Global and per-IP rate limits (`src/middlewares/globalRateLimit.js`)
2. **Authentication**: JWT strategy with access/refresh tokens (`src/config/passport.js`)
3. **CSRF Protection**: Token-based CSRF protection (`src/middlewares/csrf.js`)
4. **Input Validation**: Joi-based request validation (`src/validations/`)
5. **Security Headers**: Helmet + custom security headers (`src/middlewares/security.js`)
6. **Data Sanitization**: MongoDB injection prevention, XSS protection

### Service Architecture
Services follow a layered pattern:
- **Controllers** (`src/controllers/`): Handle HTTP requests/responses
- **Services** (`src/services/`): Business logic and external integrations
- **Models** (`src/models/`): Mongoose schemas with Sequelize models
- **Routes** (`src/routes/v1/`): Express route definitions
- **Middlewares** (`src/middlewares/`): Request processing pipeline

### Database Schema Pattern
Models use a dual-schema approach:
- `*.schema.js`: Sequelize schema definition (PostgreSQL structure)
- `*.model.js`: Mongoose model implementation (MongoDB ORM)
This suggests a migration or multi-database support strategy.

### Payment Integration
Paystack integration handles:
- Virtual account creation for users
- Card tokenization and storage
- Recurring payments for savings/contributions
- Webhook processing for payment events

### Scheduled Tasks
The system processes scheduled contributions via:
- AWS EventBridge scheduled events
- Lambda function: `processScheduledContributions` in sls.js
- Handles daily savings, scheduled contributions based on frequency

### Notification System
Multi-channel notification support:
- **Email**: AWS SES with templates in `src/templates/emails/`
- **SMS**: Via external service with templates in `src/templates/sms/`
- User preferences control channel selection

### File Storage
- AWS S3 for KYC documents and file uploads
- Bucket: `surebank-kyc-documents`
- Pre-signed URLs for secure uploads/downloads

## Important Considerations

### Serverless Framework v4
- Requires authentication via `serverless login` or `SERVERLESS_ACCESS_KEY` environment variable
- See README.md for setup instructions

### Database Connections
- MongoDB connection is initialized on Lambda cold start
- Connection pooling is managed by Mongoose
- Redis connection failures are handled gracefully (app continues without cache)

### Environment-Specific Configuration
- Memory/timeout settings vary by stage (dev/prod) in serverless.yml
- CORS origins are environment-specific
- Rate limits may differ between environments

### Testing Approach
- Unit tests in `tests/unit/`
- Integration tests in `tests/integration/`
- Test database setup in `tests/utils/setupTestDB.js`
- Mocks for AWS services in `tests/mocks/`