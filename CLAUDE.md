# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Surebank (Defipay) is a Node.js/Express.js RESTful API built for financial operations, inventory management, and e-commerce functionality. The project uses MongoDB as its database and can be deployed as a serverless application on AWS Lambda.

## Key Development Commands

### Development
```bash
# Start development server with hot reload
npm run dev

# Start serverless offline for local AWS Lambda simulation
npm run sls
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run coverage

# Run a specific test file
npm test path/to/test.file.js
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Check code formatting with Prettier
npm run prettier

# Fix code formatting issues
npm run prettier:fix
```

### Production
```bash
# Start with PM2
npm start

# Docker commands
npm run docker:dev    # Development environment
npm run docker:prod   # Production environment
npm run docker:test   # Test environment
```

## Architecture Overview

### Directory Structure
- **src/** - Main application source code
  - **config/** - Configuration files (database, logger, auth, etc.)
  - **controllers/** - Request handling logic
  - **models/** - Mongoose schemas and models
  - **services/** - Business logic layer
  - **routes/v1/** - API route definitions
  - **middlewares/** - Express middleware (auth, error handling, validation)
  - **validations/** - Joi validation schemas
  - **utils/** - Utility functions and helpers
  - **docs/** - Swagger/OpenAPI documentation

### Key Architectural Patterns

1. **Layered Architecture**: Controllers → Services → Models
   - Controllers handle HTTP requests and responses
   - Services contain business logic
   - Models define data schemas and database interactions

2. **Database Connection**: Uses a singleton pattern for MongoDB connections (src/models/connection.js) optimized for serverless environments

3. **Authentication**: JWT-based authentication using Passport.js with role-based access control (RBAC)

4. **API Versioning**: All routes are versioned under `/v1` prefix

5. **Error Handling**: Centralized error handling with custom ApiError class and middleware

### Core Modules

- **Accounts & Transactions**: Financial account management and transaction processing
- **Products & Inventory**: Product catalog, inventory tracking, and collections
- **Sales & Orders**: Shopping cart, order processing, and sales tracking
- **User Management**: User authentication, roles, and permissions
- **Branch Management**: Multi-branch support for operations
- **Notifications**: SMS and email notification services
- **Reporting**: Various business reports and analytics

### Environment Configuration

The application uses `env.json` for environment variables (see `env.example.json` for template). Key configurations include:
- Database connection settings
- JWT secrets and token configurations
- SMS/Email service credentials
- AWS configurations for serverless deployment

### Testing Approach

- Unit tests for models and utilities
- Integration tests for API endpoints
- Test database setup utility in `tests/utils/setupTestDB.js`
- Uses Jest as the testing framework with Supertest for API testing