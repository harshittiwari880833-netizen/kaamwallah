const UserModel = require('../models/User');
const { OtpModel, RefreshTokenModel } = require('../models/Otp');
const { generateOTP, sendOTP, verifyOTP } = require('../utils/otp');
const { generateTokenPair, verifyRefreshToken, hashToken } = require('../utils/jwt');
const { getMessage } = require('../config/i18n');
const R = require('../utils/response');

/**
 * POST /auth/otp/send
 * Send OTP to phone number
 */
exports.sendOtp = async (req, res) => {
  try {
    const { phone, purpose = 'login' } = req.body;
    const lang = req.headers['accept-language'] === 'hi' ? 'hi' : 'en';

    const otp = generateOTP();
    await OtpModel.create(phone, otp, purpose);
    await sendOTP(phone, otp);

    return R.success(res, { phone }, getMessage('otpSent', lang));
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * POST /auth/otp/verify
 * Verify OTP → login or signup
 *
 * If user doesn't exist + role provided → create account (signup)
 * If user exists → login
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp, purpose = 'login', role, name, language = 'en' } = req.body;

    // 1. Find valid OTP record
    const otpRecord = await OtpModel.findValid(phone, purpose);
    if (!otpRecord) {
      return R.unauthorized(res, getMessage('invalidOtp', language));
    }

    // 2. Verify OTP hash
    const isValid = await verifyOTP(otp, otpRecord.code_hash);
    if (!isValid) {
      await OtpModel.incrementAttempts(otpRecord.id);
      return R.unauthorized(res, getMessage('invalidOtp', language));
    }

    // 3. Mark OTP used
    await OtpModel.markUsed(otpRecord.id);

    // 4. Find or create user
    let user = await UserModel.findByPhone(phone);
    let isNewUser = false;

    if (!user) {
      if (!role || !name) {
        return R.error(res, 'New user: provide role and name to register', 400);
      }
      user = await UserModel.create({ name, phone, role, language });
      isNewUser = true;
    }

    // 5. Mark phone verified
    if (!user.phone_verified) {
      await UserModel.markPhoneVerified(phone);
      user.phone_verified = true;
    }

    // 6. Update last login
    await UserModel.updateLastLogin(user.id);

    // 7. Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // 8. Store refresh token hash
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30);
    await RefreshTokenModel.create(user.id, refreshToken, refreshExpiry);

    return R.success(
      res,
      {
        isNewUser,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          language: user.language,
        },
      },
      getMessage(isNewUser ? 'signupSuccess' : 'loginSuccess', language),
      isNewUser ? 201 : 200
    );
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * POST /auth/token/refresh
 * Issue new access token from refresh token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return R.unauthorized(res, 'Refresh token required');

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return R.unauthorized(res, 'Invalid or expired refresh token');
    }

    const stored = await RefreshTokenModel.findValid(decoded.id, refreshToken);
    if (!stored) return R.unauthorized(res, 'Refresh token revoked or expired');

    const user = await UserModel.findById(decoded.id);
    if (!user) return R.unauthorized(res, 'User not found');

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

    // Rotate refresh token
    await RefreshTokenModel.revoke(decoded.id, refreshToken);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    await RefreshTokenModel.create(user.id, newRefreshToken, expiry);

    return R.success(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * POST /auth/logout
 * Revoke refresh token (current device)
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshTokenModel.revoke(req.user.id, refreshToken);
    }
    return R.success(res, {}, 'Logged out successfully');
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * POST /auth/logout/all
 * Revoke all tokens (all devices)
 */
exports.logoutAll = async (req, res) => {
  try {
    await RefreshTokenModel.revokeAll(req.user.id);
    return R.success(res, {}, 'Logged out from all devices');
  } catch (err) {
    return R.serverError(res, err);
  }
};
