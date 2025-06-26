# SureBank API Documentation

## User Account API

This documentation covers the self-service account creation and retrieval endpoints for users.

### Prerequisites

- User must be authenticated (have a valid JWT token)
- For account creation, user must have completed KYC verification
- For account creation, user must have verified their BVN

## Multi-Account Withdrawal API

### 1. Get User Accounts with Balances

#### Endpoint

```
GET /v1/accounts/self/balances
```

#### Description

Retrieves all active accounts for the authenticated user with balance information, useful for withdrawal selection.

#### Authentication

Requires a user authentication token in the `Authorization` header:

```
Authorization: Bearer {token}
```

#### Response (Success - 200 OK)

```json
[
  {
    "_id": "account_id_1",
    "accountNumber": "1234567890",
    "accountType": "ds",
    "availableBalance": 15000,
    "ledgerBalance": 20000,
    "heldAmount": 5000,
    "accountManager": {
      "_id": "manager_id",
      "firstName": "John",
      "lastName": "Manager"
    },
    "branch": {
      "_id": "branch_id",
      "name": "Main Branch"
    },
    "status": "active"
  },
  {
    "_id": "account_id_2",
    "accountNumber": "0987654321",
    "accountType": "sb",
    "availableBalance": 8000,
    "ledgerBalance": 8000,
    "heldAmount": 0,
    "accountManager": {
      "_id": "manager_id",
      "firstName": "John",
      "lastName": "Manager"
    },
    "branch": {
      "_id": "branch_id",
      "name": "Main Branch"
    },
    "status": "active"
  }
]
```

### 2. Create Multi-Account Withdrawal Request

#### Endpoint

```
POST /v1/payments/withdrawal/multi-request
```

#### Description

Allows users to create a single withdrawal request that withdraws from multiple accounts simultaneously, improving UX by eliminating the need for separate requests.

#### Authentication

Requires a user authentication token in the `Authorization` header:

```
Authorization: Bearer {token}
```

#### Request Body

```json
{
  "withdrawalAccounts": [
    {
      "accountNumber": "1234567890",
      "amount": 10000
    },
    {
      "accountNumber": "0987654321",
      "amount": 5000
    }
  ],
  "bankName": "Access Bank",
  "bankCode": "044",
  "bankAccountNumber": "0123456789",
  "bankAccountName": "John Doe",
  "reason": "Personal expenses"
}
```

#### Response (Success - 201 Created)

```json
{
  "withdrawalRequests": [
    {
      "_id": "req_id_1",
      "userId": "user_id",
      "accountNumber": "1234567890",
      "amount": 10000,
      "status": "pending",
      "narration": "Multi-account withdrawal request - ds",
      "relatedWithdrawalGroup": "1703123456789",
      "date": 1703123456789,
      "createdAt": "2023-12-20T10:00:00.000Z"
    },
    {
      "_id": "req_id_2",
      "userId": "user_id",
      "accountNumber": "0987654321",
      "amount": 5000,
      "status": "pending",
      "narration": "Multi-account withdrawal request - sb",
      "relatedWithdrawalGroup": "1703123456789",
      "date": 1703123456789,
      "createdAt": "2023-12-20T10:00:00.000Z"
    }
  ],
  "totalAmount": 15000,
  "groupId": "1703123456789",
  "summary": {
    "accountsCount": 2,
    "totalAmount": 15000,
    "bankDetails": {
      "bankName": "Access Bank",
      "bankAccountNumber": "0123456789",
      "bankAccountName": "John Doe"
    }
  }
}
```

#### Error Responses

- **400 Bad Request**:

  - Insufficient funds in any account
  - Duplicate account numbers
  - Invalid account type

  ```json
  {
    "code": 400,
    "message": "Insufficient funds in account 1234567890"
  }
  ```

- **403 Forbidden**: User doesn't own one of the accounts

  ```json
  {
    "code": 403,
    "message": "You do not have access to account 1234567890"
  }
  ```

- **404 Not Found**: Account not found
  ```json
  {
    "code": 404,
    "message": "Account 1234567890 not found"
  }
  ```

#### Validation Rules

- `withdrawalAccounts`: Array of 1-3 items (max one per account type)
- Each withdrawal account must have `accountNumber` (string) and `amount` (positive number)
- Bank details are required for all withdrawals
- Account numbers must be unique within the request

#### Benefits Over Single-Account Withdrawals

- **Improved UX**: One request instead of multiple separate requests
- **Atomic Operation**: All withdrawals succeed or fail together
- **Unified Notifications**: Single notification with total amount
- **Grouped Tracking**: Related withdrawals linked by `groupId`
- **Better Audit Trail**: Clear relationship between related withdrawals

#### Example Usage

```javascript
// JavaScript example
const withdrawalData = {
  withdrawalAccounts: [
    { accountNumber: '1234567890', amount: 10000 }, // DS account
    { accountNumber: '0987654321', amount: 5000 }, // SB account
    { accountNumber: '1122334455', amount: 8000 }, // IBS account
  ],
  bankName: 'GTBank',
  bankCode: '058',
  bankAccountNumber: '0123456789',
  bankAccountName: 'John Doe',
  reason: 'Emergency expenses',
};

fetch('/v1/payments/withdrawal/multi-request', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(withdrawalData),
})
  .then((response) => response.json())
  .then((result) => {
    console.log('Total withdrawal:', result.totalAmount);
    console.log('Group ID:', result.groupId);
    console.log('Individual requests:', result.withdrawalRequests);
  });
```

## 1. Create Self-Service Account

### Endpoint

```
POST /v1/account/self
```

### Description

Allows authenticated users to create a new account for themselves. The account is automatically assigned to the online branch.

### Authentication

Requires a user authentication token in the `Authorization` header:

```
Authorization: Bearer {token}
```

### Request Body

```json
{
  "accountType": "ds" // Required: Type of account (e.g.,  "ds", "sb", "ibs",)
}
```

### Valid Account Types

- `ds`: Daily savings account
- `sb`: Surebank account
- `ibs`: Investment banking services account

### Response (Success - 201 Created)

```json
{
  "userId": "userId123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "accountNumber": "1234567890",
  "availableBalance": 0,
  "ledgerBalance": 0,
  "accountType": "sales",
  "createdBy": "userId123",
  "branchId": "onlineBranchId123",
  "status": "active",
  "paystackCustomerId": "customer_123",
  "_id": "accountId123",
  "createdAt": "2023-05-01T10:00:00.000Z",
  "updatedAt": "2023-05-01T10:00:00.000Z"
}
```

### Error Responses

- **400 Bad Request**:

  - When user already has an account of the specified type:
    ```json
    {
      "code": 400,
      "message": "You already have an account of the specified type"
    }
    ```
  - When KYC verification is not completed:
    ```json
    {
      "code": 400,
      "message": "You need to verify your KYC before creating an account"
    }
    ```
  - When BVN verification is not completed:
    ```json
    {
      "code": 400,
      "message": "You need to verify your BVN before creating an account"
    }
    ```

- **401 Unauthorized**: When user is not authenticated:

  ```json
  {
    "code": 401,
    "message": "Please authenticate"
  }
  ```

- **404 Not Found**: When user is not found:
  ```json
  {
    "code": 404,
    "message": "User not found"
  }
  ```

---

## 2. Get Self Account Details

### Endpoint

```
GET /v1/account/self
```

### Description

Retrieves the account details of the authenticated user. You can optionally filter by account type.

### Authentication

Requires a user authentication token in the `Authorization` header:

```
Authorization: Bearer {token}
```

### Query Parameters

```
?accountType=savings  // Optional: Filter by account type
```

### Response (Success - 200 OK)

```json
{
  "userId": "userId123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "accountNumber": "1234567890",
  "availableBalance": 0,
  "ledgerBalance": 0,
  "accountType": "savings",
  "createdBy": "userId123",
  "branchId": {
    "_id": "branchId123",
    "name": "Online Branch"
  },
  "status": "active",
  "paystackCustomerId": "customer_123",
  "_id": "accountId123",
  "createdAt": "2023-05-01T10:00:00.000Z",
  "updatedAt": "2023-05-01T10:00:00.000Z"
}
```

### Error Responses

- **401 Unauthorized**: When user is not authenticated:
  ```json
  {
    "code": 401,
    "message": "Please authenticate"
  }
  ```
- **404 Not Found**: When account not found for the user:
  ```json
  {
    "code": 404,
    "message": "User does not have an account"
  }
  ```
