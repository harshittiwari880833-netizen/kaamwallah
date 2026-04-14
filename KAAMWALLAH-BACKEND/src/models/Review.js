const { query } = require('../config/database');

const ReviewModel = {
  /**
   * Create a review for a completed job
   */
  create: async ({ jobId, clientId, workerId, rating, comment }) => {
    const { rows } = await query(
      `INSERT INTO reviews (job_id, client_id, worker_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [jobId, clientId, workerId, rating, comment || null]
    );
    return rows[0];
  },

  /**
   * Check if a review exists for a job
   */
  existsForJob: async (jobId) => {
    const { rows } = await query(
      'SELECT id FROM reviews WHERE job_id = $1 LIMIT 1',
      [jobId]
    );
    return rows.length > 0;
  },

  /**
   * Get reviews for a worker (paginated)
   */
  findByWorkerId: async (workerId, { page = 1, limit = 10 } = {}) => {
    const offset = (page - 1) * limit;
    const [countRes, dataRes] = await Promise.all([
      query('SELECT COUNT(*) FROM reviews WHERE worker_id = $1', [workerId]),
      query(
        `SELECT r.*, u.name AS client_name
         FROM reviews r JOIN users u ON u.id = r.client_id
         WHERE r.worker_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [workerId, limit, offset]
      ),
    ]);
    return {
      reviews: dataRes.rows,
      total: parseInt(countRes.rows[0].count),
    };
  },
};

module.exports = ReviewModel;
