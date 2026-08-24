# API Standards

## Response Envelope

All API responses use a consistent JSON envelope.

### Success Response

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-07-24T11:51:55.000Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "field": "email", "message": "Invalid email address", "code": "invalid_string" }],
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-07-24T11:51:55.000Z"
  }
}
```

## Versioning

URL-based: `/api/v1/...`  
Breaking changes require a new version prefix.

## Filtering

```
GET /api/v1/trials?filter[status]=PUBLISHED&filter[level]=MID
```

## Sorting

```
GET /api/v1/trials?sort=-createdAt,title
```

Prefix `-` for descending. Multiple fields comma-separated.

## Pagination

```
GET /api/v1/trials?page=2&limit=20
```

- `page`: 1-indexed (default: 1)
- `limit`: 1-100 (default: 20)

## Search

```
GET /api/v1/trials?q=typescript+developer
```

## HTTP Status Codes

| Code | Meaning                       |
| ---- | ----------------------------- |
| 200  | Success                       |
| 201  | Created                       |
| 204  | No Content (DELETE)           |
| 400  | Bad Request                   |
| 401  | Unauthorized (no token)       |
| 403  | Forbidden (insufficient role) |
| 404  | Not Found                     |
| 409  | Conflict (duplicate)          |
| 422  | Validation Error              |
| 429  | Rate Limited                  |
| 500  | Internal Server Error         |
| 503  | Service Unavailable           |

## Authentication

```
Authorization: Bearer <access_token>
```

Access tokens expire in **15 minutes**. Use `POST /api/v1/auth/refresh` to get a new one.
