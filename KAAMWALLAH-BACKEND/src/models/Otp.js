const { query } = require('../config/database');
const { hashOTP, getOTPExpiry } = require('../utils/otp');
const { hashToken } = require('../utils/jwt');

const MAX_ATTEMPTS = parseInt(process.env.MAX_OTP_ATTEMPTS) || 5;

const OtpModel = {
  /**
   * Create and store a hashed OTP
   */
  create: async (phone, rawOtp, purpose = 'login') => {
    // Invalidate previous OTPs for same phone+purpose
    await query(
      `UPDATE otp_codes SET is_used = TRUE
       WHERE phone = $1 AND purpose = $2 AND is_used = FALSE`,
      [phone, purpose]
    );

    const codeHash = await hashOTP(rawOtp);
    const expiresAt = getOTPExpiry();

    const { rows } = await query(
      `INSERT INTO otp_codes (phone, code_hash, purpose, expires_at)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [phone, codeHash, purpose, expiresAt]
    );
    return rows[0];
  },

  /**
   * Get most recent valid OTP for phone+purpose
   */
  findValid: async (phone, purpose = 'login') => {
    const { rows } = await query(
      `SELECT * FROM otp_codes
       WHERE phone = $1
         AND purpose = $2
         AND is_used = FALSE
         AND expires_at > NOW()
         AND attempts < $3
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone, purpose, MAX_ATTEMPTS]
    );
    return rows[0] || null;
  },

  /**
   * Increment attempt counter
   */
  incrementAttempts: async (id) => {
    await query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1', [id]);
  },

  /**
   * Mark OTP as used
   */
  markUsed: async (id) => {
    await query('UPDATE otp_codes SET is_used = TRUE WHERE id = $1', [id]);
  },

  /**
   * Delete expired OTPs (for cleanup job)
   */
  purgeExpired: async () => {
    await query('DELETE FROM otp_codes WHERE expires_at < NOW() OR is_used = TRUE');
  },
};

const RefreshTokenModel = {
  /**
   * Store a hashed refresh token
   */
  create: async (userId, rawToken, expiresAt) => {
    const tokenHash = hashToken(rawToken);
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  },

  /**
   * Validate refresh token
   */
  findValid: async (userId, rawToken) => {
    const tokenHash = hashToken(rawToken);
    const { rows } = await query(
      `SELECT * FROM refresh_tokens
       WHERE user_id = $1 AND token_hash = $2 AND revoked = FALSE AND expires_at > NOW()
       LIMIT 1`,
      [userId, tokenHash]
    );
    return rows[0] || null;
  },

  /**
   * Revoke a token
   */
  revoke: async (userId, rawToken) => {
    const tokenHash = hashToken(rawToken);
    await query(
      `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1 AND token_hash = $2`,
      [userId, tokenHash]
    );
  },

  /**
   * Revoke all tokens for user (logout all devices)
   */
  revokeAll: async (userId) => {
    await query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [userId]);
  },
};

module.exports = { OtpModel, RefreshTokenModel };
