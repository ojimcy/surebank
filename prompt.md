# SureBank API Implementation - Prompts for AI Agent

## Initial Instruction (Meta-Prompt)

**Prompt 0:**

"You are an AI assistant tasked with implementing the backend features for the SureBank User-Facing App API, following the provided checklist. For each task you work on, remember the following critical rule: **Only mark a checklist item as complete (`[✅]`) after you have implemented the functionality AND have simulated or described the necessary tests to verify its correctness.** Explain the tests performed or needed for each completed item. Now, let's begin with the first task."

---

## Phase 1: Core Infrastructure & Authentication

### 1.1 User Role & Permission Updates (To Do)

**Prompt 1 (Ref: 1.1 - Update user registration API endpoints):**

"Based on the SureBank PRD and checklist item 'Update user registration API endpoints to support self-registration', please:
1. Define the API endpoint (HTTP method, path e.g., `POST /api/v1/user/register`).
2. Specify the required request body fields (e.g., name, email, password).
3. Outline the backend logic for this endpoint, including data validation, password hashing, creating the user record with the default 'user' role, and triggering the email verification process (`[REQ-AUTH-01]`, `[REQ-AUTH-02]`).
4. Describe the tests needed to verify this endpoint (e.g., successful registration, handling duplicate emails, validation errors)."

*(AI Agent performs task, describes tests, and marks item complete)*

**Prompt 2 (Ref: 1.1 - Enhance backend KYC verification system):**

"Referring to checklist item 'Enhance backend KYC verification system/logic for self-registered users' and PRD requirements (`[REQ-USER-01]`, `[REQ-ADMIN-KYC-01]`, `[REQ-ADMIN-KYC-02]`):
1. Define the API endpoint for users to submit KYC data (`[REQ-USER-01]`). Specify method, path, and expected request body (consider fields like ID type, ID number, document upload reference).
2. Outline the backend logic for receiving and storing KYC submission data securely, initially marking the user's KYC status as 'Pending'.
3. Describe how this submitted data would integrate with the existing admin system for review (`[REQ-ADMIN-KYC-01]`).
4. Detail the tests needed (e.g., successful submission, storing data correctly, updating user status, handling potential file upload issues)."

*(AI Agent performs task, describes tests, and marks item complete)*

**Prompt 3 (Ref: 1.1 - Implement backend logic for email verification):**

"Implement the backend logic for email verification during self-registration (`[REQ-AUTH-02]`), as mentioned in the checklist:
1. Describe the process: How is the verification token generated and stored (associated with the user)?
2. How is the verification email sent (e.g., integration with an email service)?
3. Define the API endpoint the user clicks in the email (e.g., `GET /api/v1/auth/verify-email?token=...`).
4. Outline the backend logic for the verification endpoint: validate token, mark user email as verified, handle invalid/expired tokens.
5. Describe the tests (e.g., generating token, sending email simulation, successful verification via token, handling invalid token scenarios)."

*(AI Agent performs task, describes tests, and marks item complete)*

**Prompt 4 (Ref: 1.1 - Implement API endpoints for password reset):**

"Implement the self-service password reset flow (`[REQ-AUTH-04]`) as per the checklist:
1. Define the API endpoint for requesting a password reset (e.g., `POST /api/v1/auth/request-password-reset`). Input: email. Logic: generate reset token, store it, send reset email.
2. Define the API endpoint for verifying the token and setting a new password (e.g., `POST /api/v1/auth/reset-password`). Input: token, new password. Logic: validate token, update password hash, invalidate token.
3. Outline the security considerations (token expiry, secure token generation).
4. Describe the tests (e.g., successful request, email sending simulation, successful password update with valid token, handling invalid/expired tokens, validation on new password)."

*(AI Agent performs task, describes tests, and marks item complete)*

**Prompt 5 (Ref: 1.1 - Add rate limiting logic):**

"Implement rate limiting logic for the registration (`POST /api/v1/user/register`), login (`POST /api/v1/auth/login` - assume standard endpoint), and password reset request (`POST /api/v1/auth/request-password-reset`) API endpoints (`[REQ-AUTH-06]`), as per the checklist:
1. Choose a rate limiting strategy (e.g., token bucket, fixed window).
2. Specify the limits (e.g., X requests per minute per IP or user).
3. Describe how this would be implemented in the application's middleware or framework.
4. Outline tests (e.g., verifying requests are blocked after exceeding the limit, verifying requests are allowed within the limit)."

*(AI Agent performs task, describes tests, and marks item complete)*

---

### 1.2 Payment Gateway Integration (Paystack)

**Prompt 6 (Ref: 1.2 - Set up Paystack configuration):**

"Configure the backend application to use Paystack, as per the checklist item 'Set up Paystack configuration':
1. Identify the necessary Paystack API keys (Secret Key, Public Key).
2. Describe how these keys will be securely stored and accessed by the application (e.g., environment variables, secrets manager). Provide example placeholder names (e.g., `PAYSTACK_SECRET_KEY`).
3. Show how the Paystack client/SDK would be initialized within the application using these configurations.
4. Describe tests (e.g., verifying keys are loaded correctly, basic connection test to Paystack if SDK allows)."

*(AI Agent performs task, describes tests, and marks item complete)*

**Prompt 7 (Ref: 1.2 - Implement payment service layer/module):**

"Implement a dedicated payment service layer/module in the backend, as per the checklist:
1. Outline the structure of this service/module (e.g., functions/methods it would contain like `initiatePayment`, `verifyPayment`, `handleWebhook`, `createTransfer`).
2. Explain why abstracting payment logic into a service layer is beneficial.
3. Provide pseudocode or a basic class structure for this service.
4. Describe tests (e.g., unit tests for individual methods if possible at this stage, ensuring the structure is sound)."

*(AI Agent performs task, describes tests, and marks item complete)*

**Prompt 8 (Ref: 1.2 - Create backend webhook handlers):**

"Create the backend webhook handlers for Paystack events (`[REQ-PAY-02]`), as specified in the checklist:
1. Define the API endpoint that Paystack will call (e.g., `POST /api/v1/webhooks/paystack`).
2. Implement the security measure for verifying incoming webhooks (using the Paystack signature in the header and your secret key).
3. Outline the initial logic within the handler: Verify signature, parse the event type (e.g., `charge.success`, `transfer.success`, `transfer.failed`), and delegate processing to the appropriate function in the payment service.
4. Describe tests (e.g., simulating valid/invalid webhook requests, testing signature verification, testing routing based on event type)."

*(AI Agent performs task, describes tests, and marks item complete)*

**Prompt 9 (Ref: 1.2 - Implement backend payment verification logic):**

"Implement the backend payment verification logic (`[REQ-PAY-03]`), referring to the checklist:
1. Create a function within the payment service (e.g., `verifyPayment(reference)`) that takes a Paystack transaction reference.
2. Detail the logic: This function should call the Paystack API (e.g., Verify Transaction endpoint) using the provided reference.
3. Describe how the response from Paystack is interpreted to confirm if the payment was successful and the amount matches the expected amount.
4. Outline the tests (e.g., testing with valid/invalid references, simulating different Paystack responses like success, failure, pending)."

*(AI Agent performs task, describes tests, and marks item complete)*

**Prompt 10 (Ref: 1.2 - Set up backend logic for virtual account system):**

"Set up the backend logic for virtual account system integration (`[REQ-PAY-04]`, `[REQ-USER-VACC-01]`), as per the checklist and PRD clarifications:
1. Describe the interaction with Paystack (or internal system) needed to *assign* a dedicated virtual account to a user upon successful KYC completion (as determined by `[REQ-ADMIN-KYC-02]`). Where would this assignment logic be triggered?
2. Outline the logic needed within the Paystack webhook handler (`[REQ-PAY-02]`) to process incoming deposits to these virtual accounts (e.g., identifying the user based on the virtual account details in the webhook payload).
3. Specify how a successful virtual account deposit would credit the appropriate user's package (or handle cases where direct allocation isn't possible).
4. Define the API endpoint for users to view their assigned virtual account details (`[REQ-USER-VACC-01]`).
5. Describe tests (e.g., simulating KYC approval triggering VA assignment, simulating incoming VA deposit webhooks, verifying correct user/package crediting, testing the user endpoint to view details)."

*(AI Agent performs task, describes tests, and marks item complete)*

---
**(Continue with prompts for Phase 1.3 and beyond in subsequent interactions)**