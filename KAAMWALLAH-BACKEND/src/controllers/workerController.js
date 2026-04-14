const WorkerModel = require('../models/Worker');
const ReviewModel = require('../models/Review');
const EarningsModel = require('../models/Earnings');
const { getMessage, translateStatus } = require('../config/i18n');
const R = require('../utils/response');

/**
 * POST /workers/profile
 * Create worker profile (labour only)
 */
exports.createProfile = async (req, res) => {
  try {
    const lang = req.user.language || 'en';
    const existing = await WorkerModel.findByUserId(req.user.id);
    if (existing) {
      return R.error(res, 'Worker profile already exists. Use PATCH to update.', 409);
    }

    // Normalize skills to lowercase
    const data = {
      ...req.body,
      skills: req.body.skills.map(s => s.toLowerCase().trim()),
    };

    const worker = await WorkerModel.create(req.user.id, data);
    return R.created(res, { worker }, getMessage('profileUpdated', lang));
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * GET /workers/profile
 * Get own worker profile
 */
exports.getMyProfile = async (req, res) => {
  try {
    const worker = await WorkerModel.findByUserId(req.user.id);
    if (!worker) return R.notFound(res, 'Worker profile not found. Please create one.');
    return R.success(res, { worker });
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * PATCH /workers/profile
 * Update own worker profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const lang = req.user.language || 'en';
    const existing = await WorkerModel.findByUserId(req.user.id);
    if (!existing) return R.notFound(res, getMessage('workerNotFound', lang));

    if (req.body.skills) {
      req.body.skills = req.body.skills.map(s => s.toLowerCase().trim());
    }

    const updated = await WorkerModel.update(existing.id, req.body);
    return R.success(res, { worker: updated }, getMessage('profileUpdated', lang));
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * GET /workers/search
 * Search workers by skill, city, price (client facing)
 */
exports.search = async (req, res) => {
  try {
    const {
      skill, city = 'Lucknow',
      min_price, max_price,
      page = 1, limit = 10,
      sort_by = 'rating',
    } = req.query;

    const lang = req.headers['accept-language'] === 'hi' ? 'hi' : 'en';

    const { workers, total } = await WorkerModel.search({
      skill: skill?.toLowerCase(),
      city,
      minPrice: min_price ? parseFloat(min_price) : undefined,
      maxPrice: max_price ? parseFloat(max_price) : undefined,
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 50),
      sortBy: sort_by,
    });

    return R.paginated(
      res,
      workers,
      { total, page: parseInt(page), limit: parseInt(limit) },
      `Found ${total} workers`
    );
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * GET /workers/:id
 * Get public worker profile
 */
exports.getWorkerById = async (req, res) => {
  try {
    const lang = req.headers['accept-language'] === 'hi' ? 'hi' : 'en';
    const worker = await WorkerModel.findById(req.params.id);
    if (!worker) return R.notFound(res, getMessage('workerNotFound', lang));

    const { reviews } = await ReviewModel.findByWorkerId(worker.id, { limit: 5 });

    return R.success(res, {
      worker: {
        id: worker.id,
        name: worker.name,
        skills: worker.skills,
        city: worker.city,
        price_per_day: worker.price_per_day,
        price_per_job: worker.price_per_job,
        pricing_type: worker.pricing_type,
        avg_rating: worker.avg_rating,
        total_reviews: worker.total_reviews,
        total_jobs: worker.total_jobs,
        experience_years: worker.experience_years,
        is_available: worker.is_available,
        aadhaar_verified: worker.aadhaar_verified,
        profile_photo: worker.profile_photo,
        bio: worker.bio,
      },
      recent_reviews: reviews,
    });
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * GET /workers/earnings
 * Earnings dashboard for authenticated labour
 */
exports.getEarnings = async (req, res) => {
  try {
    const worker = await WorkerModel.findByUserId(req.user.id);
    if (!worker) return R.notFound(res, 'Worker profile not found');

    const [dashboard, daily] = await Promise.all([
      EarningsModel.getDashboard(worker.id),
      EarningsModel.getDailyBreakdown(worker.id, 30),
    ]);

    return R.success(res, {
      summary: {
        today:          parseFloat(dashboard.today),
        this_week:      parseFloat(dashboard.this_week),
        this_month:     parseFloat(dashboard.this_month),
        all_time:       parseFloat(dashboard.all_time),
        total_jobs_paid: parseInt(dashboard.total_jobs_paid),
      },
      daily_breakdown: daily.map(d => ({
        date:  d.date,
        total: parseFloat(d.total),
        jobs:  parseInt(d.jobs),
      })),
    });
  } catch (err) {
    return R.serverError(res, err);
  }
};

/**
 * GET /workers/:id/reviews
 * Get reviews for a worker (public)
 */
exports.getWorkerReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const worker = await WorkerModel.findById(req.params.id);
    if (!worker) return R.notFound(res, 'Worker not found');

    const { reviews, total } = await ReviewModel.findByWorkerId(worker.id, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return R.paginated(res, reviews, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return R.serverError(res, err);
  }
};
