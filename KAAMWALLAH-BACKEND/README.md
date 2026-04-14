# 🔨 Labour Marketplace API

A production-ready backend for a labour marketplace platform connecting clients with skilled workers in India. Built with Node.js, Express, and PostgreSQL (Supabase-compatible).

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials and JWT secrets
```

### 3. Run database migrations
```bash
npm run migrate
```

### 4. Seed sample data (optional)
```bash
npm run seed
```

### 5. Start the server
```bash
npm run dev      # Development (with nodemon)
npm start        # Production
```

---

## 📁 Project Structure

```
labour-marketplace/
├── src/
│   ├── server.js                  # Entry point
│   ├── app.js                     # Express app config
│   ├── config/
│   │   ├── database.js            # PostgreSQL pool
│   │   ├── i18n.js                # Hindi/English labels
│   │   ├── migrate.js             # DB migration runner
│   │   └── seed.js                # Dev seed data
│   ├── controllers/
│   │   ├── authController.js      # OTP, JWT, logout
│   │   ├── userController.js      # User profile
│   │   ├── workerController.js    # Worker CRUD, search, earnings
│   │   └── jobController.js       # Job lifecycle, reviews
│   ├── middleware/
│   │   ├── auth.js                # JWT authenticate + RBAC authorize
│   │   ├── validators.js          # express-validator rules
│   │   └── errorHandler.js        # Global error + 404 handler
│   ├── models/
│   │   ├── User.js                # users table queries
│   │   ├── Otp.js                 # otp_codes + refresh_tokens
│   │   ├── Worker.js              # workers table queries
│   │   ├── Job.js                 # jobs table + status machine
│   │   ├── Review.js              # reviews table queries
│   │   └── Earnings.js            # earnings dashboard queries
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── workerRoutes.js
│   │   └── jobRoutes.js
│   └── utils/
│       ├── response.js            # Standardized API responses
│       ├── jwt.js                 # Token generation/verification
│       └── otp.js                 # OTP generate/hash/send
└── docs/
    ├── schema.sql                 # Full PostgreSQL schema
    └── API.md                     # API reference with examples
```

---

## 🗺️ API Routes Summary

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/otp/send` | Public | Send OTP |
| POST | `/api/auth/otp/verify` | Public | Verify OTP → login/signup |
| POST | `/api/auth/token/refresh` | Public | Refresh access token |
| POST | `/api/auth/logout` | Auth | Logout current device |
| POST | `/api/auth/logout/all` | Auth | Logout all devices |
| GET | `/api/users/me` | Auth | Get own profile |
| PATCH | `/api/users/me` | Auth | Update profile |
| GET | `/api/workers/search` | Public | Search workers |
| POST | `/api/workers/profile` | Labour | Create worker profile |
| GET | `/api/workers/profile` | Labour | Get own worker profile |
| PATCH | `/api/workers/profile` | Labour | Update worker profile |
| GET | `/api/workers/earnings` | Labour | Earnings dashboard |
| GET | `/api/workers/:id` | Public | Get worker profile |
| GET | `/api/workers/:id/reviews` | Public | Get worker reviews |
| POST | `/api/jobs` | Client | Post a job |
| GET | `/api/jobs` | Auth | List my jobs |
| GET | `/api/jobs/:id` | Auth | Get job details |
| PATCH | `/api/jobs/:id/status` | Auth | Update job status |
| POST | `/api/jobs/:jobId/review` | Client | Submit review |

---

## 🔒 Security

- **OTP**: bcrypt hashed, 10-minute expiry, max 5 attempts
- **JWT**: Short-lived access token (7d) + rotating refresh tokens (30d)
- **Refresh tokens**: SHA-256 hashed before DB storage
- **Aadhaar**: Only `aadhaar_verified` boolean stored — full number NEVER persisted
- **Rate limiting**: 100 req/15min globally; 5 req/10min on OTP endpoints
- **Helmet**: HTTP security headers on all responses
- **Input validation**: All inputs validated via express-validator

## 🌐 Multilingual

Send `Accept-Language: hi` header to receive Hindi labels for job statuses and messages.

---

## 🗃️ Database

Supabase-compatible PostgreSQL schema. Run `npm run migrate` to apply.

Key design choices:
- UUID primary keys throughout
- DB triggers auto-update `updated_at`, `avg_rating`, and `total_jobs`
- GIN index on `workers.skills` array for fast skill searches
- Earnings table denormalized for O(1) dashboard aggregation
- Row Level Security (RLS) enabled; backend uses service role

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (access + refresh) + OTP |
| Validation | express-validator |
| Security | helmet, bcryptjs, rate-limit |
| OTP Provider | MSG91 / Twilio (pluggable) |
