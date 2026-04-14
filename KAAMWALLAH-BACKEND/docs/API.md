# Labour Marketplace API — Complete Reference

Base URL: `https://your-api.com/api`

All responses follow this envelope:
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Send `Accept-Language: hi` header to receive Hindi labels.

---

## AUTH

### POST /auth/otp/send
Send OTP to a phone number.

**Request:**
```json
{ "phone": "9876543210", "purpose": "login" }
```
**Response 200:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": { "phone": "9876543210" }
}
```

---

### POST /auth/otp/verify
Verify OTP. Creates account if new user.

**Request (new user / signup):**
```json
{
  "phone": "9876543210",
  "otp": "482910",
  "purpose": "login",
  "role": "client",
  "name": "Rajesh Kumar",
  "language": "hi"
}
```
**Response 201 (new user):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "isNewUser": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Rajesh Kumar",
      "phone": "9876543210",
      "role": "client",
      "language": "hi"
    }
  }
}
```
**Response 200 (existing user login):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "isNewUser": false,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Rajesh Kumar",
      "phone": "9876543210",
      "role": "client",
      "language": "hi"
    }
  }
}
```

---

### POST /auth/token/refresh
**Request:** `{ "refreshToken": "eyJ..." }`
**Response 200:** `{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }`

### POST /auth/logout *(Auth required)*
**Request:** `{ "refreshToken": "eyJ..." }`

### POST /auth/logout/all *(Auth required)*
Revokes all devices.

---

## USERS

### GET /users/me *(Auth required)*
**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Rajesh Kumar",
      "phone": "9876543210",
      "role": "client",
      "language": "hi",
      "phone_verified": true,
      "last_login": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PATCH /users/me *(Auth required)*
**Request:** `{ "name": "Rajesh Kumar", "language": "en" }`

---

## WORKERS

### GET /workers/search
Search available workers.

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| skill | string | plumber |
| city | string | Lucknow |
| min_price | number | 500 |
| max_price | number | 2000 |
| page | int | 1 |
| limit | int | 10 |
| sort_by | string | rating / price / jobs |

**Response 200:**
```json
{
  "success": true,
  "message": "Found 2 workers",
  "data": [
    {
      "id": "worker-uuid-1",
      "name": "Suresh Plumber",
      "skills": ["plumber", "pipe fitting", "bathroom fitting"],
      "city": "Lucknow",
      "price_per_day": 800.00,
      "price_per_job": 300.00,
      "pricing_type": "both",
      "avg_rating": 4.50,
      "total_reviews": 12,
      "total_jobs": 34,
      "experience_years": 8,
      "is_available": true
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### POST /workers/profile *(Auth: labour)*
Create worker profile.

**Request:**
```json
{
  "skills": ["plumber", "pipe fitting"],
  "price_per_day": 800,
  "price_per_job": 300,
  "pricing_type": "both",
  "city": "Lucknow",
  "bio": "Expert plumber with 8 years of experience.",
  "experience_years": 8
}
```
**Response 201:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "worker": {
      "id": "worker-uuid-1",
      "user_id": "user-uuid-1",
      "skills": ["plumber", "pipe fitting"],
      "price_per_day": "800.00",
      "price_per_job": "300.00",
      "pricing_type": "both",
      "city": "Lucknow",
      "is_available": true,
      "avg_rating": "0.00",
      "total_reviews": 0,
      "aadhaar_verified": false,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### GET /workers/earnings *(Auth: labour)*
**Response 200:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "today": 350.00,
      "this_week": 1750.00,
      "this_month": 6400.00,
      "all_time": 48200.00,
      "total_jobs_paid": 138
    },
    "daily_breakdown": [
      { "date": "2024-01-15", "total": 350.00, "jobs": 1 },
      { "date": "2024-01-14", "total": 800.00, "jobs": 2 }
    ]
  }
}
```

---

### GET /workers/:id
**Response 200:**
```json
{
  "success": true,
  "data": {
    "worker": {
      "id": "worker-uuid-1",
      "name": "Suresh Plumber",
      "skills": ["plumber", "pipe fitting", "bathroom fitting"],
      "city": "Lucknow",
      "price_per_day": 800.00,
      "price_per_job": 300.00,
      "avg_rating": 4.50,
      "total_reviews": 12,
      "total_jobs": 34,
      "experience_years": 8,
      "aadhaar_verified": true,
      "bio": "Expert plumber with 8 years experience."
    },
    "recent_reviews": [
      {
        "id": "review-uuid-1",
        "rating": 5,
        "comment": "Excellent work! Very professional.",
        "client_name": "Rajesh Kumar",
        "created_at": "2024-01-14T14:00:00.000Z"
      }
    ]
  }
}
```

---

## JOBS

### POST /jobs *(Auth: client)*
**Request:**
```json
{
  "title": "Fix kitchen sink leakage",
  "description": "Urgent pipe leak in kitchen.",
  "skill_required": "plumber",
  "city": "Lucknow",
  "address": "Sector 14, Indira Nagar",
  "worker_id": "worker-uuid-1",
  "agreed_price": 350,
  "scheduled_at": "2024-01-16T10:00:00.000Z"
}
```
**Response 201:**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "data": {
    "job": {
      "id": "job-uuid-1",
      "client_id": "user-uuid-1",
      "worker_id": "worker-uuid-1",
      "title": "Fix kitchen sink leakage",
      "skill_required": "plumber",
      "city": "Lucknow",
      "agreed_price": "350.00",
      "status": "requested",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### GET /jobs *(Auth required)*
Get own jobs with optional status filter.

**Query Params:** `?status=requested&page=1&limit=10`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "job-uuid-1",
      "title": "Fix kitchen sink leakage",
      "status": "accepted",
      "status_label": "Accepted",
      "agreed_price": "350.00",
      "worker_name": "Suresh Plumber",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

Hindi response (with `Accept-Language: hi`):
```json
{ "status_label": "स्वीकार किया" }
```

---

### PATCH /jobs/:id/status *(Auth required)*
Update job status.

**Client can:** `cancelled`
**Labour can:** `accepted`, `rejected`, `on_the_way`, `in_progress`, `completed`

**Request:**
```json
{ "status": "on_the_way" }
```
**Response 200:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "job": {
      "id": "job-uuid-1",
      "status": "on_the_way",
      "status_label": "On the Way",
      "accepted_at": "2024-01-15T10:35:00.000Z",
      "updated_at": "2024-01-15T10:50:00.000Z"
    }
  }
}
```

**Error (invalid transition) 400:**
```json
{
  "success": false,
  "message": "Invalid transition: completed → on_the_way"
}
```

---

### POST /jobs/:jobId/review *(Auth: client)*
Submit review after job completion.

**Request:**
```json
{ "rating": 5, "comment": "Excellent work! Very professional." }
```
**Response 201:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "review": {
      "id": "review-uuid-1",
      "job_id": "job-uuid-1",
      "worker_id": "worker-uuid-1",
      "rating": 5,
      "comment": "Excellent work! Very professional.",
      "created_at": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

---

## ERROR RESPONSES

**401 Unauthorized:**
```json
{ "success": false, "message": "No token provided" }
```

**403 Forbidden:**
```json
{ "success": false, "message": "Access restricted to: client" }
```

**422 Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "phone", "message": "Invalid Indian mobile number" },
    { "field": "skills", "message": "skills must be a non-empty array" }
  ]
}
```

**429 Rate Limit:**
```json
{ "success": false, "message": "Too many OTP requests. Please wait 10 minutes." }
```

---

## JOB STATUS FLOW

```
requested → accepted → on_the_way → in_progress → completed
    ↓           ↓           ↓             ↓
 rejected    cancelled  cancelled     cancelled
```

## VALID SKILLS LIST
`plumber`, `electrician`, `carpenter`, `painter`, `cleaner`, `mason`, `mechanic`, `driver`, `gardener`, `cook`

## SECURITY NOTES
- Aadhaar: Only `aadhaar_verified` boolean stored. Full number NEVER persisted.
- OTPs: bcrypt hashed in DB. Expire in 10 min. Max 5 attempts.
- Refresh tokens: SHA-256 hashed in DB. Rotated on every refresh.
- All routes rate-limited. OTP endpoints: 5 req/10min.
