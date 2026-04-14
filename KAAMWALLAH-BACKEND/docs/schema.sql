-- ============================================================
-- Labour Marketplace - Database Schema (Supabase Compatible)
-- ============================================================

-- Enable UUID extension (already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(15) UNIQUE NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  role          VARCHAR(10) NOT NULL CHECK (role IN ('client', 'labour')),
  language      VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  is_active     BOOLEAN DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast phone lookup
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================
-- OTP TABLE (for phone verification)
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_codes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone         VARCHAR(15) NOT NULL,
  code_hash     VARCHAR(255) NOT NULL,  -- bcrypt hash of OTP
  purpose       VARCHAR(20) NOT NULL CHECK (purpose IN ('signup', 'login', 'verify')),
  attempts      INTEGER DEFAULT 0,
  is_used       BOOLEAN DEFAULT FALSE,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);

-- ============================================================
-- REFRESH TOKENS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    VARCHAR(255) NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ============================================================
-- WORKERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS workers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio             TEXT,
  skills          TEXT[] NOT NULL DEFAULT '{}',
  price_per_day   NUMERIC(10, 2),
  price_per_job   NUMERIC(10, 2),
  pricing_type    VARCHAR(10) DEFAULT 'day' CHECK (pricing_type IN ('day', 'job', 'both')),
  city            VARCHAR(100) DEFAULT 'Lucknow',
  state           VARCHAR(100) DEFAULT 'Uttar Pradesh',
  latitude        DECIMAL(9, 6),
  longitude       DECIMAL(9, 6),
  is_available    BOOLEAN DEFAULT TRUE,
  avg_rating      DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews   INTEGER DEFAULT 0,
  total_jobs      INTEGER DEFAULT 0,
  -- Aadhaar: DO NOT store full number. Store only verification flag.
  aadhaar_verified BOOLEAN DEFAULT FALSE,
  profile_photo   VARCHAR(500),
  experience_years INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_city ON workers(city);
CREATE INDEX IF NOT EXISTS idx_workers_skills ON workers USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_workers_available ON workers(is_available);
CREATE INDEX IF NOT EXISTS idx_workers_rating ON workers(avg_rating DESC);

-- ============================================================
-- JOBS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id       UUID REFERENCES workers(id) ON DELETE SET NULL,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  skill_required  VARCHAR(100) NOT NULL,
  city            VARCHAR(100) NOT NULL DEFAULT 'Lucknow',
  address         TEXT,
  latitude        DECIMAL(9, 6),
  longitude       DECIMAL(9, 6),
  agreed_price    NUMERIC(10, 2),
  status          VARCHAR(20) NOT NULL DEFAULT 'requested'
                  CHECK (status IN (
                    'requested',   -- Client posted job
                    'accepted',    -- Worker accepted
                    'on_the_way',  -- Worker is travelling
                    'in_progress', -- Work started
                    'completed',   -- Work done
                    'cancelled',   -- Job cancelled
                    'rejected'     -- Worker rejected
                  )),
  scheduled_at    TIMESTAMPTZ,
  accepted_at     TIMESTAMPTZ,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_client ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_worker ON jobs(worker_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id        UUID UNIQUE NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  client_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id     UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_worker ON reviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client ON reviews(client_id);

-- ============================================================
-- EARNINGS TABLE (Denormalized for fast dashboard queries)
-- ============================================================
CREATE TABLE IF NOT EXISTS earnings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id     UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  job_id        UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  amount        NUMERIC(10, 2) NOT NULL,
  earned_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_earnings_worker ON earnings(worker_id);
CREATE INDEX IF NOT EXISTS idx_earnings_date ON earnings(earned_at DESC);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_workers_updated_at
  BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRIGGER: auto-update worker avg_rating on new review
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_worker_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE workers
  SET 
    avg_rating = (
      SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE worker_id = NEW.worker_id
    ),
    total_reviews = (
      SELECT COUNT(*) FROM reviews WHERE worker_id = NEW.worker_id
    )
  WHERE id = NEW.worker_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_worker_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION refresh_worker_rating();

-- ============================================================
-- TRIGGER: increment worker total_jobs on completion
-- ============================================================
CREATE OR REPLACE FUNCTION increment_worker_jobs()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE workers SET total_jobs = total_jobs + 1 WHERE id = NEW.worker_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_jobs
  AFTER UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION increment_worker_jobs();

-- ============================================================
-- ROW LEVEL SECURITY (Supabase RLS - optional, for direct DB access)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS (used by backend API)
-- These policies allow authenticated backend (service role) full access
CREATE POLICY "service_role_all" ON users FOR ALL USING (true);
CREATE POLICY "service_role_all" ON workers FOR ALL USING (true);
CREATE POLICY "service_role_all" ON jobs FOR ALL USING (true);
CREATE POLICY "service_role_all" ON reviews FOR ALL USING (true);
CREATE POLICY "service_role_all" ON earnings FOR ALL USING (true);
