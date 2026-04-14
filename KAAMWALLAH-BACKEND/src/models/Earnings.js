const { query } = require('../config/database');

const EarningsModel = {
  /**
   * Record earnings when a job is completed
   */
  record: async (workerId, jobId, amount) => {
    const { rows } = await query(
      `INSERT INTO earnings (worker_id, job_id, amount, earned_at)
       VALUES ($1, $2, $3, CURRENT_DATE)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [workerId, jobId, amount]
    );
    return rows[0];
  },

  /**
   * Get earnings dashboard for a worker
   * Returns daily/weekly/monthly totals
   */
  getDashboard: async (workerId) => {
    const { rows } = await query(
      `SELECT
         -- Today
         COALESCE(SUM(CASE WHEN earned_at = CURRENT_DATE THEN amount END), 0) AS today,
         -- This week (Mon–Sun)
         COALESCE(SUM(CASE WHEN earned_at >= DATE_TRUNC('week', CURRENT_DATE) THEN amount END), 0) AS this_week,
         -- This month
         COALESCE(SUM(CASE WHEN earned_at >= DATE_TRUNC('month', CURRENT_DATE) THEN amount END), 0) AS this_month,
         -- All time
         COALESCE(SUM(amount), 0) AS all_time,
         COUNT(*) AS total_jobs_paid
       FROM earnings
       WHERE worker_id = $1`,
      [workerId]
    );
    return rows[0];
  },

  /**
   * Get daily breakdown for last N days
   */
  getDailyBreakdown: async (workerId, days = 30) => {
    const { rows } = await query(
      `SELECT
         earned_at AS date,
         SUM(amount) AS total,
         COUNT(*) AS jobs
       FROM earnings
       WHERE worker_id = $1
         AND earned_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY earned_at
       ORDER BY earned_at DESC`,
      [workerId]
    );
    return rows;
  },
};

module.exports = EarningsModel;
