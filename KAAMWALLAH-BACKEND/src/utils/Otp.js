const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const OTP_LENGTH = 6;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

/**
 * Generate a cryptographically secure OTP
 */
const generateOTP = () => {
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0);
  // Ensure exactly 6 digits
  return String(100000 + (num % 900000));
};

/**
 * Hash OTP for secure storage
 */
const hashOTP = async (otp) => {
  return bcrypt.hash(otp, BCRYPT_ROUNDS);
};

/**
 * Verify raw OTP against stored hash
 */
const verifyOTP = async (rawOtp, hash) => {
  return bcrypt.compare(rawOtp, hash);
};

/**
 * Compute expiry timestamp
 */
const getOTPExpiry = () => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES);
  return expiry;
};

/**
 * Mock OTP sender — replace with real MSG91/Twilio integration
 * In development, logs OTP to console
 */
const sendOTP = async (phone, otp) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📱 OTP for ${phone}: ${otp}\n`);
    return { success: true, messageId: 'dev-mock' };
  }

  // --- MSG91 Integration ---
  // const url = 'https://api.msg91.com/api/v5/otp';
  // const response = await fetch(url, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', authkey: process.env.MSG91_AUTH_KEY },
  //   body: JSON.stringify({
  //     template_id: process.env.MSG91_TEMPLATE_ID,
  //     mobile: `91${phone}`,
  //     otp,
  //   }),
  // });
  // return response.json();

  // --- Twilio Integration ---
  // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  // return client.messages.create({
  //   body: `Your Labour Marketplace OTP is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
  //   from: process.env.TWILIO_FROM,
  //   to: `+91${phone}`,
  // });

  throw new Error('OTP provider not configured for production');
};

module.exports = { generateOTP, hashOTP, verifyOTP, getOTPExpiry, sendOTP };