# SureBank User-Facing App - API Implementation Checklist

## Overview

Extend the current admin-focused app's backend/API to support user-facing functionalities: package management, deposits/withdrawals via Paystack, and product purchases using the existing 'user' role.

## Phase 1: Core Infrastructure & Authentication

### 1.1 User Role & Permission Updates

**Already Completed:**

- [✅] Basic role-based authentication middleware
- [✅] Role hierarchy system
- [✅] Permission management system
- [✅] User role assignment (using existing 'user' role)
- [✅] Basic user permissions
- [✅] Add new package-specific permissions (CREATE_PACKAGE, VIEW_PACKAGE, CONTRIBUTE_TO_PACKAGE, WITHDRAW_FROM_PACKAGE, INTEREST_PACKAGE_CREATE, INTEREST_PACKAGE_VIEW)
- [✅] Add new payment-specific permissions (PAYMENT_INITIATE, PAYMENT_VERIFY, VIRTUAL_ACCOUNT_VIEW)
- [✅] Add new product-specific permissions (PRODUCT*VIEW, PRODUCT_PURCHASE, CART_MANAGE)
  *(Note: 'appUser' role creation removed as per request)\_

**To Do:**

- [✅] Update user registration API endpoints to support self-registration
- [✅] Enhance backend KYC verification system/logic for self-registered users
- [✅] Implement backend logic for email verification during self-registration
- [✅] Implement API endpoints for self-service password reset flow
- [✅] Add rate limiting logic to registration and authentication API endpoints

### 1.2 Payment Gateway Integration (Paystack)

- [✅] Set up Paystack configuration (API keys, environment variables) in backend
- [✅] Implement payment service layer/module in backend
- [✅] Create backend webhook handlers for Paystack events (e.g., `charge.success`, `transfer.success`, etc.)
- [✅] Implement backend payment verification logic (query Paystack API to confirm transaction status)
- [✅] Implement backend logic for virtual account system integration (Paystack's or internal), which should be generated upon KYC completion (and BVN update if user chose different KYC type)

### 1.3 Database Schema Updates

- [✅] Design and implement additions of payment-related fields to existing schemas (e.g., User, Package)
- [✅] Design and implement new schema for Interest-based savings packages
- [✅] Design and implement new schema for Payment transactions
- [✅] Design and implement new schema for Withdrawal requests

## Phase 2: Package Management System (API Logic)

### 2.1 Daily Savings Package

- [ ] Implement API endpoint for user-initiated package creation (Daily Savings type)
- [ ] Implement backend contribution logic using Paystack integration (linking payments to packages)
- [ ] Implement backend withdrawal request workflow specific to Daily Savings rules
- [ ] Implement backend transaction history tracking and API endpoint for package history retrieval
- [ ] Implement backend package status management logic (e.g., active, pending withdrawal, closed)

### 2.2 SB (Savings-Buying) Package

- [ ] Implement API endpoint for user-initiated package creation (SB Package type)
- [ ] Implement backend contribution logic using Paystack integration for SB packages
- [ ] Implement backend logic allowing product purchase debits from SB package balance
- [ ] Implement backend withdrawal system logic specific to SB Package rules

### 2.3 Interest-Based Savings Package

- [ ] Implement database model based on the Interest-Based Package Schema
- [ ] Implement backend system for configuring APR (Annual Percentage Rate) - likely admin controlled API
- [ ] Implement backend lock period management logic (setting and enforcing)
- [ ] Implement core backend interest calculation logic (specify frequency, compounding method)
- [ ] Implement backend maturity tracking system (identify matured packages, trigger actions/notifications)
- [ ] Implement backend early withdrawal process, including calculating and applying penalties (as specified in the request), factored into the withdrawal request.

## Phase 3: Payment & Transaction System (API & Backend Logic)

### 3.1 Payment Methods

- [ ] Integrate backend logic for initiating Card payments via Paystack
- [ ] Integrate backend logic for initiating Bank transfer payments via Paystack
- [ ] Implement backend logic for Virtual account deposit crediting, which should be directly to the package of choice, not the wallet.
- [ ] Ensure robust backend payment verification logic covers all integrated methods
- [ ] Design and implement backend transaction reconciliation process (comparing internal records with Paystack)

### 3.2 Wallet System

- [ ] Implement in-app wallet data structure/schema. The wallet should only serve as an intermediary for holding/aggregation point for package funds, with withdrawals via package withdrawal requests. There should be no direct deposit to the wallet, deposits should be to the packages of choice.
- [ ] Implement core backend balance management logic (credits/debits for all transaction types)
- [ ] Implement API endpoint for retrieving user wallet transaction history
- [ ] Design and implement backend auto-reconciliation system for internal wallet consistency

### 3.3 Security Features (Related to Payments)

- [ ] Implement backend encryption for sensitive payment data (e.g., tokenized card details) at rest and in transit
- [ ] Implement backend transaction signing mechanisms where appropriate for data integrity
- [ ] Set up detailed backend audit logging for all payment, withdrawal, and wallet operations
- [ ] Research and implement appropriate backend fraud detection mechanisms (e.g., velocity checks, pattern analysis)

## Phase 4: Product Purchase Integration (API & Backend Logic)

### 4.1 Product Catalog

- [ ] Implement API endpoints for product Browse, search, and filtering
- [ ] Implement backend logic for checking product availability/stock levels
- [ ] Implement backend logic for retrieving product prices

### 4.2 Shopping Cart

- [ ] Implement API endpoints for cart management (add item, remove item, update quantity)
- [ ] Implement backend cart total price calculation logic
- [ ] Implement backend stock validation logic during cart manipulation or checkout initiation
- [ ] Implement backend cart persistence mechanism for users (e.g., database storage)

### 4.3 Checkout System

- [ ] Enhance checkout API endpoint to accept payment method selection (incl. Package Balance)
- [ ] Implement backend logic for payment using SB package balance
- [ ] Implement backend order creation and processing logic upon successful payment
- [ ] Define and implement backend integration points for order fulfillment processes
- [ ] Implement API endpoint for users to track order status

## Phase 5: Admin Dashboard Extensions (API & Backend Logic)

### 5.1 User Management

- [ ] Implement API endpoints for admin KYC review and approval/rejection
- [ ] Implement API endpoints for admin user management (view details, status change), which should be a single endpoint for scalability.
- [ ] Implement API endpoint for admins to retrieve user activity logs

### 5.2 Package Management

- [ ] Implement backend package approval workflow logic and associated admin API endpoints (if required)
- [ ] Implement API endpoints for admin management of interest rates (APR)
- [ ] Implement API endpoints for admin withdrawal request processing (approve/reject). Withdrawals should be credited to the users' withdrawal bank account, which is set in settings.
- [ ] Implement API endpoints for admin package transaction monitoring

### 5.3 Reporting & Analytics

- [ ] Develop backend logic and API endpoints for generating user activity reports
- [ ] Develop backend logic and API endpoints for generating transaction reports
- [ ] Develop backend logic and API endpoints for generating package performance metrics reports
- [ ] Develop backend logic and API endpoints for generating basic revenue analytics reports

## Technical Specifications Implementation

- [ ] Define final structure and implement Interest-Based Package Schema in the database
- [ ] Define final structure and implement Payment Transaction Schema in the database
- [ ] Define final structure and implement Withdrawal Request Schema in the database
- [ ] Build out User API endpoints according to the defined structure
- [ ] Build out Admin API endpoints according to the defined structure. These should integrate with the existing app built for admin.

## Security Considerations Implementation

### Payment Security

- [ ] Implement end-to-end encryption (TLS) for all payment-related API communication
- [ ] Implement encryption at rest for sensitive payment identifiers/tokens
- [ ] Ensure secure backend handling and storage of Paystack API keys and secrets
- [ ] Implement secure webhook verification for Paystack events
- [ ] Consider implementing transaction signing within backend processes if feasible and necessary

### User Security

- [ ] Implement backend logic for Two-factor Authentication (2FA) option during login/sensitive actions
- [ ] Implement secure session management policies (timeouts, rotation) on the backend
- [ ] Implement comprehensive backend activity logging for user account changes and actions
- [ ] Implement rate limiting on sensitive API endpoints (login, password reset, payments)

### Data Protection

- [ ] Implement encryption at rest for Personally Identifiable Information (PII) and financial data in the database
- [ ] Ensure all backend-to-backend and external API communication uses secure protocols (HTTPS/TLS)
- [ ] Strictly enforce role-based access control (RBAC) within the backend API logic for all data access
- [ ] Implement detailed backend audit trails for creation, modification, or deletion of critical data
