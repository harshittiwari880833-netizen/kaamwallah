const router = require('express').Router();
const workerController = require('../controllers/workerController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createWorkerProfileRules, searchWorkersRules, validate,
} = require('../middleware/validators');

/**
 * @route  GET /api/workers/search
 * @desc   Search workers by skill, city, price
 * @access Public
 */
router.get('/search', searchWorkersRules(), validate, workerController.search);

/**
 * @route  GET /api/workers/profile
 * @desc   Get own worker profile
 * @access Private (labour)
 */
router.get('/profile', authenticate, authorize('labour'), workerController.getMyProfile);

/**
 * @route  POST /api/workers/profile
 * @desc   Create worker profile
 * @access Private (labour)
 */
router.post(
  '/profile',
  authenticate,
  authorize('labour'),
  createWorkerProfileRules(),
  validate,
  workerController.createProfile
);

/**
 * @route  PATCH /api/workers/profile
 * @desc   Update worker profile
 * @access Private (labour)
 */
router.patch('/profile', authenticate, authorize('labour'), workerController.updateProfile);

/**
 * @route  GET /api/workers/earnings
 * @desc   Earnings dashboard (daily/weekly/monthly)
 * @access Private (labour)
 */
router.get('/earnings', authenticate, authorize('labour'), workerController.getEarnings);

/**
 * @route  GET /api/workers/:id
 * @desc   Get public worker profile
 * @access Public
 */
router.get('/:id', workerController.getWorkerById);

/**
 * @route  GET /api/workers/:id/reviews
 * @desc   Get reviews for a worker
 * @access Public
 */
router.get('/:id/reviews', workerController.getWorkerReviews);

module.exports = router;
