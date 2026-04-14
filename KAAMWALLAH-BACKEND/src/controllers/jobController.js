const { JobModel } = require('../models/Job');
const WorkerModel = require('../models/Worker');
const ReviewModel = require('../models/Review');
const EarningsModel = require('../models/Earnings');
const { getMessage, translateStatus } = require('../config/i18n');
const R = require('../utils/response');

/**
 * POST /jobs
 * Client creates a job (optionally targeting a specific worker)
 */
exports.createJob = async (req, res) => {
  try {
    const lang = req.user.language || 'en';

    // If targeting a specific worker, verify they exist
    if (req.body.worker_id) {
      const worker = await WorkerModel.findById(req.body.worker_id);
      if (!worker) return R.notFound(res, getMessage('workerNotFound', lang));
      if (!worker.is_available) {
        return R.error(res, 'This worker is currently unavailable', 400);
      }
    }

    const job = await JobModel.create(req.user.id, req.body);
    return R.created(res, { job }, getMessage('jobCreated', lang));
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * GET /jobs
 * Client: get their own jobs | Labour: get jobs assigned to them
 */
exports.getMyJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const lang = req.user.language || 'en';

    let result;
    if (req.user.role === 'client') {
      result = await JobModel.findByClientId(req.user.id, {
        status, page: parseInt(page), limit: parseInt(limit),
      });
    } else {
      // Labour: find their worker profile first
      const worker = await WorkerModel.findByUserId(req.user.id);
      if (!worker) return R.notFound(res, 'Worker profile not found');
      result = await JobModel.findByWorkerId(worker.id, {
        status, page: parseInt(page), limit: parseInt(limit),
      });
    }

    // Translate statuses
    const jobs = result.jobs.map(job => ({
      ...job,
      status_label: translateStatus(job.status, lang),
    }));

    return R.paginated(res, jobs, {
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * GET /jobs/:id
 * Get a single job by ID
 */
exports.getJobById = async (req, res) => {
  try {
    const lang = req.user.language || 'en';
    const job = await JobModel.findById(req.params.id);
    if (!job) return R.notFound(res, getMessage('jobNotFound', lang));

    // Verify access: client owns it OR assigned worker
    const isClient = req.user.role === 'client' && job.client_id === req.user.id;
    const workerProfile = req.user.role === 'labour'
      ? await WorkerModel.findByUserId(req.user.id)
      : null;
    const isWorker = workerProfile && job.worker_id === workerProfile.id;

    if (!isClient && !isWorker) {
      return R.forbidden(res, 'You do not have access to this job');
    }

    return R.success(res, {
      job: {
        ...job,
        status_label: translateStatus(job.status, lang),
      },
    });
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * PATCH /jobs/:id/status
 * Update job status with role-based rules
 *
 * Client can: cancel
 * Labour can: accept, reject, on_the_way, in_progress, completed
 */
exports.updateJobStatus = async (req, res) => {
  try {
    const { status, cancellation_reason } = req.body;
    const lang = req.user.language || 'en';

    const job = await JobModel.findById(req.params.id);
    if (!job) return R.notFound(res, getMessage('jobNotFound', lang));

    // Role-based permission check
    if (req.user.role === 'client') {
      if (job.client_id !== req.user.id) return R.forbidden(res);
      if (status !== 'cancelled') {
        return R.forbidden(res, 'Clients can only cancel jobs');
      }
    } else {
      // Labour
      const worker = await WorkerModel.findByUserId(req.user.id);
      if (!worker || job.worker_id !== worker.id) {
        // Allow labour to accept an unassigned job
        if (status === 'accepted' && !job.worker_id) {
          try {
            const updated = await JobModel.updateStatus(job.id, 'accepted', {
              worker_id: worker.id,
            });
            return R.success(res, {
              job: { ...updated, status_label: translateStatus(updated.status, lang) },
            }, getMessage('jobAccepted', lang));
          } catch (e) {
            return R.error(res, e.message, 400);
          }
        }
        return R.forbidden(res, 'You are not assigned to this job');
      }
    }

    // Execute transition
    let updated;
    try {
      updated = await JobModel.updateStatus(job.id, status, { cancellation_reason });
    } catch (e) {
      return R.error(res, e.message, 400);
    }

    // On completion — record earnings
    if (status === 'completed' && job.agreed_price) {
      const worker = await WorkerModel.findByUserId(req.user.id);
      if (worker) {
        await EarningsModel.record(worker.id, job.id, job.agreed_price);
      }
    }

    const msgKey = status === 'accepted' ? 'jobAccepted'
      : status === 'rejected' ? 'jobRejected'
      : status === 'completed' ? 'jobCompleted'
      : 'profileUpdated';

    return R.success(res, {
      job: { ...updated, status_label: translateStatus(updated.status, lang) },
    }, getMessage(msgKey, lang));
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * POST /jobs/:jobId/review
 * Client submits a review for a completed job
 */
exports.submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const lang = req.user.language || 'en';

    const job = await JobModel.findById(req.params.jobId);
    if (!job) return R.notFound(res, getMessage('jobNotFound', lang));
    if (job.client_id !== req.user.id) return R.forbidden(res);
    if (job.status !== 'completed') {
      return R.error(res, 'Can only review completed jobs', 400);
    }

    const alreadyReviewed = await ReviewModel.existsForJob(job.id);
    if (alreadyReviewed) {
      return R.error(res, getMessage('alreadyReviewed', lang), 409);
    }

    const review = await ReviewModel.create({
      jobId: job.id,
      clientId: req.user.id,
      workerId: job.worker_id,
      rating,
      comment,
    });

    return R.created(res, { review }, getMessage('reviewSubmitted', lang));
  } catch (err) {
    return R.serverError(res, err);
  }
};
