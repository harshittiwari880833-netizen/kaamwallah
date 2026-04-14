const router = require('express').Router();
const jobController = require('../controllers/jobController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createJobRules, updateJobStatusRules, createReviewRules, validate,
} = require('../middleware/validators');

/**
 * @route  POST /api/jobs
 * @desc   Create a new job
 * @access Private (client)
 */
router.post(
  '/',
  authenticate,
  authorize('client'),
  createJobRules(),
  validate,
  jobController.createJob
);

/**
 * @route  GET /api/jobs
 * @desc   Get my jobs (client: their postings | labour: assigned jobs)
 * @access Private
 */
router.get('/', authenticate, jobController.getMyJobs);

/**
 * @route  GET /api/jobs/:id
 * @desc   Get single job detail
 * @access Private (client owner or assigned worker)
 */
router.get('/:id', authenticate, jobController.getJobById);

/**
 * @route  PATCH /api/jobs/:id/status
 * @desc   Update job status
 * @access Private
 */
router.patch(
  '/:id/status',
  authenticate,
  updateJobStatusRules(),
  validate,
  jobController.updateJobStatus
);

/**
 * @route  POST /api/jobs/:jobId/review
 * @desc   Submit a review for a completed job
 * @access Private (client)
 */
router.post(
  '/:jobId/review',
  authenticate,
  authorize('client'),
  createReviewRules(),
  validate,
  jobController.submitReview
);

module.exports = router;
