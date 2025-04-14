# Product Requirements Document: SureBank User-Facing Application APIs

* **Version:** 1.1
* **Date:** April 14, 2025
* **Status:** Final

## 1. Introduction

This document defines the requirements for the backend APIs necessary to extend the existing SureBank administrative application with user-facing functionalities. These APIs will power client applications (e.g., web, mobile) enabling end-users to self-register, manage savings packages, perform financial transactions via Paystack, manage an internal wallet (as an intermediary), and purchase products using functionality integrated with the existing platform. It also outlines the required API extensions for administrators to manage these new user-centric features, leveraging the existing admin infrastructure where applicable.

## 2. Goals & Objectives

* **Enable User Self-Sufficiency:** Allow users to register, log in, manage profile (including withdrawal bank details), complete KYC, and reset passwords without admin intervention.
* **Provide Flexible Savings Options:** Offer users distinct savings packages (Daily, Savings-Buying, Interest-Based) catering to different needs via API management.
* **Streamline Payments:** Integrate securely with Paystack for deposits (Card, Transfer) targeted to specific packages and support virtual accounts. Manage withdrawals initiated by users and approved by admins.
* **Facilitate Product Purchases:** Allow users to browse a product catalog (managed via existing admin system) and purchase items using funds from their Savings-Buying package balance or other integrated payment methods.
* **Enhance Admin Oversight:** Provide administrators with the necessary API tools to manage users (incl. KYC approval), oversee new package types, set interest rates, process user-initiated withdrawal requests, and monitor system activity related to new user functions.
* **Ensure Security & Reliability:** Build a robust and secure API layer protecting user data and financial transactions.

## 3. User Roles

* **User:** An end-customer of SureBank interacting via a client application. Uses the `/api/v1/user/` endpoints.
    * *Needs:* Register, log in, manage profile, set/update withdrawal bank account, complete KYC, manage various savings packages, view balances and history (including related wallet movements), initiate deposits to packages, initiate withdrawals from packages, browse products, manage cart, checkout, view orders, view assigned virtual account details.
* **Admin:** A SureBank staff member managing the platform via the existing administrative interface, extended with APIs to oversee new user functions. Uses the `/api/v1/admin/` endpoints (for new functionalities).
    * *Needs:* View/manage users, approve/reject KYC, view/manage user packages (associated with new features), set interest rates for Interest-Based packages, process withdrawal requests initiated by users, monitor transactions, generate reports (leveraging existing reporting where possible).

## 4. Functional Requirements (API)

### 4.1. Authentication & User Management

* **[REQ-AUTH-01] User Self-Registration:** API endpoint to allow new users to register an account (using the existing 'user' role).
* **[REQ-AUTH-02] Email Verification:** Backend process and API interaction for verifying user email addresses upon registration.
* **[REQ-AUTH-03] User Login:** API endpoint for authenticating users and issuing session tokens/credentials.
* **[REQ-AUTH-04] Password Reset:** API endpoints to support a self-service password reset flow (request token, verify token, set new password).
* **[REQ-AUTH-05] Role Enforcement:** All API endpoints must enforce permissions based on the authenticated user's role ('user' or 'admin').
* **[REQ-AUTH-06] Rate Limiting:** Implement rate limiting on authentication, registration, and password reset endpoints.
* **[REQ-USER-01] KYC Submission:** API endpoint for users to submit required KYC information/documents.
* **[REQ-USER-02] KYC Status:** API endpoint for users to check the status of their KYC verification.
* **[REQ-USER-03] Profile Management:** API endpoints for users to view and update their profile information (excluding sensitive/verified data like KYC details post-approval).
* **[REQ-USER-BANK-01] Manage Withdrawal Bank Account:** API endpoints for users to securely add, view, and update their designated bank account details used for processing withdrawals. (Linked to user settings).

### 4.2. Package Management (User APIs)

* **[REQ-PKG-01] List Packages:** API endpoint for users to list their existing savings packages.
* **[REQ-PKG-02] View Package Details:** API endpoint for users to view the specific details of a package (type, balance, status, relevant dates, interest info, etc.).
* **[REQ-PKG-03] View Package Transactions:** API endpoint for users to view the transaction history associated with a specific package (deposits, withdrawals, interest accruals, debits for purchases).
* **[REQ-PKG-DS-01] Create Daily Savings Package:** API endpoint for users to create a new Daily Savings package.
* **[REQ-PKG-DS-02] Contribute to Daily Savings:** Utilize the generic contribution endpoint (`[REQ-PAY-01]`) specifying the Daily Savings package as the target.
* **[REQ-PKG-DS-03] Request Daily Savings Withdrawal:** API endpoint for users to initiate a withdrawal request from this package type.
* **[REQ-PKG-SB-01] Create SB Package:** API endpoint for users to create a new Savings-Buying package.
* **[REQ-PKG-SB-02] Contribute to SB Package:** Utilize the generic contribution endpoint (`[REQ-PAY-01]`) specifying the SB package as the target.
* **[REQ-PKG-SB-03] View SB Balance for Purchase:** Package details API (`[REQ-PKG-02]`) should clearly indicate balance available for product purchases.
* **[REQ-PKG-SB-04] Request SB Withdrawal:** API endpoint for users to initiate a withdrawal request (subject to specific SB rules, if any).
* **[REQ-PKG-IS-01] Create Interest Savings Package:** API endpoint for users to create an Interest-Based Savings package, specifying amount and lock period.
* **[REQ-PKG-IS-02] View Interest Details:** Package details API (`[REQ-PKG-02]`) should show APR, lock period, maturity date, accrued interest.
* **[REQ-PKG-IS-03] Request Early Withdrawal (Interest):** API endpoint for users to request early withdrawal. The request payload should reflect the desired withdrawal amount, and the backend logic must calculate and factor in the applicable penalty (e.g., 50% of accrued interest forfeited) *before* submitting the request for admin approval. The API should potentially display the net amount and penalty to the user before confirmation.
* **[REQ-PKG-IS-04] Maturity Handling:** Backend logic to automatically handle package status and interest payout/availability upon maturity.

### 4.3. Payment System (API & Backend Logic)

* **[REQ-PAY-01] Initiate Contribution (Paystack):** Single backend logic endpoint and API interaction (callable by users) to initiate card or bank transfer payments via Paystack. This API must accept parameters specifying the `amount` and the `target_package_id`.
* **[REQ-PAY-02] Handle Paystack Webhooks:** Backend webhook handlers to securely receive and process status updates from Paystack (e.g., `charge.success`, `transfer.success`, `transfer.failed`).
* **[REQ-PAY-03] Verify Payments:** Backend logic to verify payment status with Paystack before crediting the specified user package.
* **[REQ-PAY-04] Virtual Account Crediting & Assignment:** Backend logic to detect and credit deposits made to assigned virtual accounts, linking them to the correct user/package if possible, or potentially to a user's wallet temporarily if direct package allocation isn't feasible from VA deposit info. Virtual accounts are assigned upon successful KYC completion (including BVN update if applicable).
* **[REQ-PAY-05] Withdrawal Request Processing:** Backend logic to handle user-initiated withdrawal requests (`[REQ-PKG-DS-03]`, `[REQ-PKG-SB-04]`, `[REQ-PKG-IS-03]`). Upon admin approval (`[REQ-ADMIN-PKG-03]`), this logic debits the relevant package/wallet balance and initiates a transfer via Paystack to the user's registered bank account (`[REQ-USER-BANK-01]`).
* **[REQ-WALLET-01] Intermediary Balance Management:** Backend logic to maintain an internal user wallet balance *purely as an intermediary mechanism*. This wallet is automatically updated (credited/debited) as part of package contributions, withdrawals, and Savings-Buying package purchases. Users do not deposit to or withdraw from this wallet directly.
* **[REQ-WALLET-02] View Wallet History:** API endpoint for users to view their wallet transaction history, providing transparency into the flow of funds related to their package activities and purchases (e.g., showing debits for SB purchases, debits for withdrawals post-approval).
* **[REQ-WALLET-03] Reconciliation:** Implement backend processes for reconciling internal transaction records (package ledgers, wallet ledger) against Paystack reports.
* **[REQ-USER-VACC-01] View Virtual Account Details:** API endpoint for users to retrieve details of the virtual account assigned to them after KYC completion.

### 4.4. Product Purchase (API & Backend Logic)

* **[REQ-PROD-01] Browse Products:** API endpoints to allow users to list, search, and filter products available for purchase (leveraging product data managed by existing admin system).
* **[REQ-PROD-02] View Product Details:** API endpoint to retrieve details of a specific product (description, price, availability) from the existing catalog.
* **[REQ-PROD-03] Stock Check:** Backend logic must validate product availability/stock levels (using existing inventory data) during cart addition and checkout.
* **[REQ-CART-01] Manage Cart:** API endpoints for users to add items, remove items, and update quantities in their shopping cart.
* **[REQ-CART-02] View Cart:** API endpoint to retrieve the current state of the user's cart, including items and total price.
* **[REQ-CART-03] Cart Persistence:** Backend mechanism to persist user carts across sessions.
* **[REQ-CHECKOUT-01] Initiate Checkout:** API endpoint to start the checkout process.
* **[REQ-CHECKOUT-02] Multi-Method Payment:** Checkout API must support payment via Paystack (Card/Transfer) and/or using available balance from the user's Savings-Buying Package (`[REQ-PKG-SB-03]`). Logic must handle partial payments if necessary (e.g., part SB balance, part Paystack). Funds used from SB package will debit the package, potentially via the intermediary wallet (`[REQ-WALLET-01]`).
* **[REQ-CHECKOUT-03] Order Creation:** Backend logic to create an order record (in the existing order system) upon successful payment confirmation.
* **[REQ-ORDER-01] View Orders:** API endpoint for users to view their past order history and status (reading from the existing order system).
* **[REQ-ORDER-02] Fulfillment Integration:** Define backend integration points/events (e.g., webhook, message queue) to signal order readiness for existing fulfillment processes upon successful order creation (`[REQ-CHECKOUT-03]`).

### 4.5. Admin Functions (API & Backend Logic)

*Note: These APIs primarily extend the existing admin capabilities to manage the new user-facing features and associated data.*

* **[REQ-ADMIN-KYC-01] View KYC Submissions:** API endpoint for admins to list and view user KYC submissions needing review.
* **[REQ-ADMIN-KYC-02] Process KYC:** API endpoint for admins to approve or reject KYC submissions, updating user status and triggering virtual account assignment (`[REQ-PAY-04]`) on approval.
* **[REQ-ADMIN-USER-01] Manage Users:** API endpoints for admins to view user details (including new data like assigned virtual accounts, package summaries) and manage user account status (e.g., activate, deactivate), leveraging existing user management framework.
* **[REQ-ADMIN-USER-02] View User Activity:** API endpoint for admins to retrieve activity logs for specific users, including logs related to new package interactions, payments, and orders.
* **[REQ-ADMIN-PKG-01] View User Packages:** API endpoints for admins to view details of all user packages, including the new types (Daily, SB, Interest). (Specific management actions beyond viewing depend on existing admin system rules).
* **[REQ-ADMIN-PKG-02] Manage Interest Rates:** API endpoint for admins to set and update the APR for Interest-Based Savings packages.
* **[REQ-ADMIN-PKG-03] Process Withdrawals:** API endpoint for admins to view pending withdrawal requests (initiated via `[REQ-PKG-DS-03]`, `[REQ-PKG-SB-04]`, `[REQ-PKG-IS-03]`) and approve or reject them. Approval triggers the backend withdrawal processing logic (`[REQ-PAY-05]`).
* **[REQ-ADMIN-PKG-04] Monitor Transactions:** API endpoint for admins to view and search/filter system-wide financial transactions, including those generated via Paystack and internal package/wallet movements related to the new features.
* **[REQ-ADMIN-RPT-01] Generate Reports:** API endpoints (or extensions to existing reporting) to generate reports covering user activity, package performance (for new types), transaction volumes, KYC status, and revenue analytics related to the user-facing app.

## 5. Non-Functional Requirements

* **[NFR-SEC-01] Secure Communication:** All API endpoints must enforce HTTPS/TLS.
* **[NFR-SEC-02] Authentication & Authorization:** Secure token-based authentication and strict role-based authorization must be implemented for all endpoints.
* **[NFR-SEC-03] Data Encryption:** Sensitive data (PII, financial info, credentials, bank details) must be encrypted at rest.
* **[NFR-SEC-04] Input Validation:** All incoming API data must be rigorously validated to prevent injection attacks (SQLi, XSS), ensure data type correctness, and enforce business rules (e.g., positive amounts).
* **[NFR-SEC-05] Paystack Security:** Secure handling of Paystack API keys, verification of webhooks using signatures, IP whitelisting (if applicable), and adherence to Paystack's security best practices are mandatory.
* **[NFR-SEC-06] Audit Logging:** Comprehensive audit trails must be logged for all sensitive operations (authentication events, financial transactions, KYC changes, bank account updates, admin approvals/rejections, profile changes).
* **[NFR-SEC-07] 2FA Support:** Backend must support 2FA mechanisms for enhanced user security during login or sensitive actions (specific flow TBD by client app, but API must support verification).
* **[NFR-PERF-01] Response Time:** Key API endpoints (e.g., login, get balance, list packages) should respond within `[Specify Target, e.g., 500ms]` under expected load `[Specify Load, e.g., 100 concurrent users]`. *(Placeholder: Needs specific targets)*
* **[NFR-REL-01] Error Handling:** APIs must return consistent, standardized, and informative error responses (e.g., defined error codes and messages) without exposing sensitive system details.
* **[NFR-REL-02] Transaction Integrity:** Financial operations (e.g., crediting deposit, debiting for withdrawal/purchase) should be handled atomically where possible or use compensating transactions to ensure data consistency across packages, wallet ledger, and order status.
* **[NFR-SCA-01] Scalability:** The architecture should leverage the existing scalable infrastructure and be designed to handle anticipated growth in users and transaction volume from the new user base. Consider stateless services, database indexing, and potential asynchronous processing for non-critical tasks.
* **[NFR-MAIN-01] API Design:** APIs should follow RESTful principles and maintain consistency in naming conventions, request/response formats (JSON), and HTTP verb usage.
* **[NFR-MAIN-02] API Documentation:** APIs must be documented using the OpenAPI (Swagger) standard, including clear descriptions, parameters, request/response schemas, and examples.

## 6. Release Criteria (Example for Initial Launch)

* All functional requirements for User APIs (Phase 1-4.4) and necessary Admin API extensions (Phase 4.5 for KYC, Withdrawals, Interest Rates, basic monitoring) are implemented and pass integration testing with the existing admin system.
* All defined security NFRs (`[NFR-SEC-...]`) are met and verified via security review/testing.
* Paystack integration (contributions, webhooks, transfers for withdrawals) is fully functional and tested end-to-end.
* Virtual Account assignment and deposit crediting (`[REQ-PAY-04]`) are tested.
* API documentation (Swagger/OpenAPI) is complete and accurate for released endpoints.
* Successful completion of User Acceptance Testing (UAT) for core user flows (Registration, KYC, Package Creation/Contribution/Withdrawal, Product Purchase using SB Balance/Paystack, Profile/Bank Management).

## 7. Success Metrics (Post-Launch)

* Number of active users utilising the new features via client apps.
* Volume and success rate of package contributions and product purchases.
* Average KYC verification throughput time (from submission to admin action).
* API uptime percentage and error rates (monitoring key endpoints).
* User satisfaction scores related to the new functionalities (gathered via client app feedback).
* Withdrawal processing time (from user request to admin approval and successful Paystack transfer).

## 8. Future Considerations / Out of Scope (For this Version)

* Advanced fraud detection models integrated with API flows.
* Integration with additional payment providers beyond Paystack.
* Mobile push notifications triggered directly by API events (current plan relies on client polling/events).
* More sophisticated reporting and data visualization features for admins beyond `[REQ-ADMIN-RPT-01]`.
* Direct user-to-user transfers or features beyond the defined savings/purchase flows.
* Developing new Admin UI components (focus is on APIs supporting existing/extended admin backend).

## 9. Appendix

* [Link to SureBank API Implementation Checklist (`surebank_implementation_plan.md`)]() *(Placeholder)*
* [Link to Paystack Integration Documentation](https://paystack.com/docs/)
* [Link to existing SureBank Admin System Architecture Overview]() *(Placeholder - if available)*