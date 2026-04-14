// const { body, param, query, validationResult } = require('express-validator');
// const { error } = require('../utils/response');

// /**
//  * Run validation result check — call after validator chains
//  */
// const validate = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return error(res, 'Validation failed', 422, errors.array().map(e => ({
//       field: e.path,
//       message: e.msg,
//     })));
//   }
//   next();
// };

// // ── Auth Validators ─────────────────────────────────────────

// const sendOtpRules = () => [
//   body('phone')
//     .trim()
//     .matches(/^[6-9]\d{9}$/)
//     .withMessage('Invalid Indian mobile number (10 digits, starts with 6-9)'),
//   body('purpose')
//     .optional()
//     .isIn(['signup', 'login', 'verify'])
//     .withMessage('purpose must be signup, login, or verify'),
// ];

// const verifyOtpRules = () => [
//   body('phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number'),
//   body('otp').trim().isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
//   body('role').optional().isIn(['client', 'labour']).withMessage('role must be client or labour'),
//   body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 chars'),
//   body('language').optional().isIn(['en', 'hi']).withMessage('language must be en or hi'),
// ];

// // ── Worker Validators ────────────────────────────────────────

// const createWorkerProfileRules = () => [
//   body('skills')
//     .isArray({ min: 1 })
//     .withMessage('skills must be a non-empty array'),
//   body('skills.*')
//     .isString().trim().notEmpty()
//     .withMessage('Each skill must be a non-empty string'),
//   body('city').trim().notEmpty().withMessage('City is required'),
//   body('price_per_day')
//     .optional()
//     .isFloat({ min: 0 })
//     .withMessage('price_per_day must be a positive number'),
//   body('price_per_job')
//     .optional()
//     .isFloat({ min: 0 })
//     .withMessage('price_per_job must be a positive number'),
//   body('pricing_type')
//     .optional()
//     .isIn(['day', 'job', 'both'])
//     .withMessage('pricing_type must be day, job, or both'),
//   body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio max 500 chars'),
//   body('experience_years').optional().isInt({ min: 0 }).withMessage('Invalid experience_years'),
// ];

// // ── Job Validators ───────────────────────────────────────────

// const createJobRules = () => [
//   body('title').trim().notEmpty().isLength({ max: 200 }).withMessage('Title required, max 200 chars'),
//   body('skill_required').trim().notEmpty().withMessage('skill_required is required'),
//   body('city').trim().notEmpty().withMessage('City is required'),
//   body('worker_id').optional().isUUID().withMessage('worker_id must be a valid UUID'),
//   body('agreed_price').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
//   body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description max 1000 chars'),
// ];

// const updateJobStatusRules = () => [
//   param('id').isUUID().withMessage('Invalid job ID'),
//   body('status')
//     .isIn(['accepted', 'rejected', 'on_the_way', 'in_progress', 'completed', 'cancelled'])
//     .withMessage('Invalid status'),
//   body('cancellation_reason').optional().trim().isLength({ max: 500 }),
// ];

// // ── Search/Query Validators ──────────────────────────────────

// const searchWorkersRules = () => [
//   query('skill').optional().trim(),
//   query('city').optional().trim(),
//   query('min_price').optional().isFloat({ min: 0 }).withMessage('min_price must be positive'),
//   query('max_price').optional().isFloat({ min: 0 }).withMessage('max_price must be positive'),
//   query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
//   query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1–50'),
//   query('sort_by').optional().isIn(['rating', 'price', 'jobs']).withMessage('Invalid sort_by'),
// ];

// // ── Review Validators ────────────────────────────────────────

// const createReviewRules = () => [
//   param('jobId').isUUID().withMessage('Invalid job ID'),
//   body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
//   body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment max 1000 chars'),
// ];

// module.exports = {
//   validate,
//   sendOtpRules,
//   verifyOtpRules,
//   createWorkerProfileRules,
//   createJobRules,
//   updateJobStatusRules,
//   searchWorkersRules,
//   createReviewRules,
// };

const { body, param, query, validationResult } = require('express-validator');
const { error } = require('../utils/response');

/**
 * Run validation result check
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(
      res,
      'Validation failed',
      422,
      errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      }))
    );
  }
  next();
};

// ── Auth Validators (🔥 FIXED PHONE ISSUE) ─────────────────────

const sendOtpRules = () => [
  body('phone')
    .trim()
    .matches(/^(\+91)?[6-9]\d{9}$/)
    .withMessage('Invalid Indian phone number'),
  body('purpose')
    .optional()
    .isIn(['signup', 'login', 'verify'])
    .withMessage('purpose must be signup, login, or verify'),
];

const verifyOtpRules = () => [
  body('phone')
    .trim()
    .matches(/^(\+91)?[6-9]\d{9}$/)
    .withMessage('Invalid phone number'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
  body('role')
    .optional()
    .isIn(['client', 'labour'])
    .withMessage('role must be client or labour'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2–100 chars'),
  body('language')
    .optional()
    .isIn(['en', 'hi'])
    .withMessage('language must be en or hi'),
];

// ── Worker Validators ────────────────────────────────────────

const createWorkerProfileRules = () => [
  body('skills')
    .isArray({ min: 1 })
    .withMessage('skills must be a non-empty array'),
  body('skills.*')
    .isString().trim().notEmpty()
    .withMessage('Each skill must be a non-empty string'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('price_per_day')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('price_per_day must be a positive number'),
  body('price_per_job')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('price_per_job must be a positive number'),
  body('pricing_type')
    .optional()
    .isIn(['day', 'job', 'both'])
    .withMessage('pricing_type must be day, job, or both'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio max 500 chars'),
  body('experience_years')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Invalid experience_years'),
];

// ── Job Validators ───────────────────────────────────────────

const createJobRules = () => [
  body('title')
    .trim()
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage('Title required, max 200 chars'),
  body('skill_required')
    .trim()
    .notEmpty()
    .withMessage('skill_required is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('worker_id')
    .optional()
    .isUUID()
    .withMessage('worker_id must be a valid UUID'),
  body('agreed_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be positive'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description max 1000 chars'),
];

const updateJobStatusRules = () => [
  param('id').isUUID().withMessage('Invalid job ID'),
  body('status')
    .isIn([
      'accepted',
      'rejected',
      'on_the_way',
      'in_progress',
      'completed',
      'cancelled',
    ])
    .withMessage('Invalid status'),
  body('cancellation_reason')
    .optional()
    .trim()
    .isLength({ max: 500 }),
];

// ── Search Validators ─────────────────────────────────────────

const searchWorkersRules = () => [
  query('skill').optional().trim(),
  query('city').optional().trim(),
  query('min_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('min_price must be positive'),
  query('max_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('max_price must be positive'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be 1–50'),
  query('sort_by')
    .optional()
    .isIn(['rating', 'price', 'jobs'])
    .withMessage('Invalid sort_by'),
];

// ── Review Validators ────────────────────────────────────────

const createReviewRules = () => [
  param('jobId').isUUID().withMessage('Invalid job ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be 1–5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment max 1000 chars'),
];

module.exports = {
  validate,
  sendOtpRules,
  verifyOtpRules,
  createWorkerProfileRules,
  createJobRules,
  updateJobStatusRules,
  searchWorkersRules,
  createReviewRules,
};
