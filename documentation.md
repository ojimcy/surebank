# SureBank API Documentation

## User Account API

This documentation covers the self-service account creation and retrieval endpoints for users.

### Prerequisites

- User must be authenticated (have a valid JWT token)
- For account creation, user must have completed KYC verification
- For account creation, user must have verified their BVN

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
