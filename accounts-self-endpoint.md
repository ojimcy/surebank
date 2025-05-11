# GET /v1/accounts/self Endpoint Documentation

## Overview

This endpoint retrieves the account details of the currently authenticated user based on a specified account type.

## Authentication

- **Required**: Yes
- Authentication method: JWT Bearer token in the `Authorization` header

## Request

### HTTP Method

```
GET
```

### Endpoint

```
/v1/accounts/self
```

### Query Parameters

| Parameter   | Type   | Required | Description                                                  |
| ----------- | ------ | -------- | ------------------------------------------------------------ |
| accountType | string | Yes      | The type of account to retrieve (e.g., 'SAVINGS', 'CURRENT') |

## Response

### Success Response (200 OK)

Returns the account details of the authenticated user for the specified account type.

#### Example Response Body

```json
{
  "id": "account_id",
  "accountNumber": "123456789",
  "accountType": "SAVINGS",
  "balance": 10000,
  "userId": "user_id",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Error Responses

- **400 Bad Request**: Missing or invalid `accountType` parameter
- **401 Unauthorized**: Invalid or missing authentication token
- **404 Not Found**: Account of specified type not found for the user
- **500 Internal Server Error**: Server-side error

## Example Usage

### JavaScript (Fetch API)

```javascript
const accountType = 'SAVINGS'; // Or other valid account type
const token = 'YOUR_AUTH_TOKEN'; // Replace with the actual token

fetch(`/v1/accounts/self?accountType=${accountType}`, {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((accountData) => {
    console.log('Self Account Data:', accountData);
    // Process account data
  })
  .catch((error) => {
    console.error('Error fetching self account:', error);
    // Handle error
  });
```

### Axios

```javascript
import axios from 'axios';

const accountType = 'SAVINGS';
const token = 'YOUR_AUTH_TOKEN';

axios
  .get(`/v1/accounts/self`, {
    params: {
      accountType,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => {
    console.log('Self Account Data:', response.data);
    // Process account data
  })
  .catch((error) => {
    console.error('Error fetching self account:', error.response || error);
    // Handle error
  });
```

## Notes

- The user ID is automatically extracted from the authentication token by the backend.
- You must specify a valid account type to retrieve the correct account information.
- This endpoint requires a valid authentication token. Ensure the user is logged in before making this request.

# GET /v1/accounts/self/all Endpoint Documentation

## Overview

This endpoint retrieves all accounts associated with the currently authenticated user, regardless of account type.

## Authentication

- **Required**: Yes
- Authentication method: JWT Bearer token in the `Authorization` header

## Request

### HTTP Method

```
GET
```

### Endpoint

```
/v1/accounts/self/all
```

### Query Parameters

None required.

## Response

### Success Response (200 OK)

Returns an array of all accounts associated with the authenticated user.

#### Example Response Body

```json
[
  {
    "id": "account_id_1",
    "accountNumber": "123456789",
    "accountType": "SAVINGS",
    "balance": 10000,
    "userId": "user_id",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  {
    "id": "account_id_2",
    "accountNumber": "987654321",
    "accountType": "CURRENT",
    "balance": 5000,
    "userId": "user_id",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Error Responses

- **401 Unauthorized**: Invalid or missing authentication token
- **500 Internal Server Error**: Server-side error

## Example Usage

### JavaScript (Fetch API)

```javascript
const token = 'YOUR_AUTH_TOKEN'; // Replace with the actual token

fetch('/v1/accounts/self/all', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((accountsData) => {
    console.log('All Self Accounts Data:', accountsData);
    // Process accounts data
  })
  .catch((error) => {
    console.error('Error fetching all self accounts:', error);
    // Handle error
  });
```

### Axios

```javascript
import axios from 'axios';

const token = 'YOUR_AUTH_TOKEN';

axios
  .get('/v1/accounts/self/all', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => {
    console.log('All Self Accounts Data:', response.data);
    // Process accounts data
  })
  .catch((error) => {
    console.error('Error fetching all self accounts:', error.response || error);
    // Handle error
  });
```

## Notes

- The user ID is automatically extracted from the authentication token by the backend.
- This endpoint retrieves all accounts for the user regardless of account type.
- Unlike the `/v1/accounts/self` endpoint, no query parameters are required.
- This endpoint requires a valid authentication token. Ensure the user is logged in before making this request.
