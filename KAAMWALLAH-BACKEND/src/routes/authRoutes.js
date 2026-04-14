const router = require('express').Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  sendOtpRules, verifyOtpRules, validate,
} = require('../middleware/validators');

/**
 * @route  POST /api/auth/otp/send
 * @desc   Send OTP to phone
 * @access Public
 */
router.post('/otp/send', sendOtpRules(), validate, authController.sendOtp);

/**
 * @route  POST /api/auth/otp/verify
 * @desc   Verify OTP → signup or login
 * @access Public
 */
router.post('/otp/verify', verifyOtpRules(), validate, authController.verifyOtp);

/**
 * @route  POST /api/auth/token/refresh
 * @desc   Get new access token using refresh token
 * @access Public
 */
router.post('/token/refresh', authController.refreshToken);

/**
 * @route  POST /api/auth/logout
 * @desc   Logout (revoke current refresh token)
 * @access Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route  POST /api/auth/logout/all
 * @desc   Logout all devices
 * @access Private
 */
router.post('/logout/all', authenticate, authController.logoutAll);

module.exports = router;
