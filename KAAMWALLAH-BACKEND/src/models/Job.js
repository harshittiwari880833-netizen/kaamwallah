const { query, withTransaction } = require('../config/database');

// Valid status transitions: from -> [allowed_next]
const STATUS_TRANSITIONS = {
  requested:   ['accepted', 'rejected', 'cancelled'],
  accepted:    ['on_the_way', 'cancelled'],
  on_the_way:  ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed:   [],
  cancelled:   [],
  rejected:    [],
};

const JobModel = {
  /**
   * Create a new job
   */
  create: async (clientId, data) => {
    const { title, description, skill_required, city, address, worker_id,
      agreed_price, scheduled_at, latitude, longitude } = data;

    const { rows } = await query(
      `INSERT INTO jobs
         (client_id, worker_id, title, description, skill_required, city, address,
          agreed_price, scheduled_at, latitude, longitude)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [clientId, worker_id || null, title, description || null, skill_required,
       city || 'Lucknow', address || null, agreed_price || null,
       scheduled_at || null, latitude || null, longitude || null]
    );
    return rows[0];
  },

  /**
   * Find job by ID (with client and worker names joined)
   */
  findById: async (jobId) => {
    const { rows } = await query(
      `SELECT j.*,
              uc.name AS client_name, uc.phone AS client_phone,
              uw.name AS worker_name, uw.phone AS worker_phone,
              w.id AS worker_profile_id, w.avg_rating
       FROM jobs j
       JOIN users uc ON uc.id = j.client_id
       LEFT JOIN workers w ON w.id = j.worker_id
       LEFT JOIN users uw ON uw.id = w.user_id
       WHERE j.id = $1`,
      [jobId]
    );
    return rows[0] || null;
  },

  /**
   * Get jobs for a client
   */
  findByClientId: async (clientId, { status, page = 1, limit = 10 } = {}) => {
    const offset = (page - 1) * limit;
    const conditions = ['j.client_id = $1'];
    const params = [clientId];
    let i = 2;

    if (status) {
      conditions.push(`j.status = $${i++}`);
      params.push(status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const [countRes, dataRes] = await Promise.all([
      query(`SELECT COUNT(*) FROM jobs j ${where}`, params),
      query(
        `SELECT j.*, w.avg_rating, uw.name AS worker_name
         FROM jobs j
         LEFT JOIN workers w ON w.id = j.worker_id
         LEFT JOIN users uw ON uw.id = w.user_id
         ${where}
         ORDER BY j.created_at DESC
         LIMIT $${i} OFFSET $${i + 1}`,
        [...params, limit, offset]
      ),
    ]);
    return { jobs: dataRes.rows, total: parseInt(countRes.rows[0].count) };
  },

  /**
   * Get jobs for a worker
   */
  findByWorkerId: async (workerId, { status, page = 1, limit = 10 } = {}) => {
    const offset = (page - 1) * limit;
    const conditions = ['j.worker_id = $1'];
    const params = [workerId];
    let i = 2;

    if (status) {
      conditions.push(`j.status = $${i++}`);
      params.push(status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const [countRes, dataRes] = await Promise.all([
      query(`SELECT COUNT(*) FROM jobs j ${where}`, params),
      query(
        `SELECT j.*, uc.name AS client_name, uc.phone AS client_phone
         FROM jobs j
         JOIN users uc ON uc.id = j.client_id
         ${where}
         ORDER BY j.created_at DESC
         LIMIT $${i} OFFSET $${i + 1}`,
        [...params, limit, offset]
      ),
    ]);
    return { jobs: dataRes.rows, total: parseInt(countRes.rows[0].count) };
  },

  /**
   * Update job status with timestamp tracking and validation
   */
  updateStatus: async (jobId, newStatus, extra = {}) => {
    // Fetch current status
    const { rows: current } = await query('SELECT status FROM jobs WHERE id = $1', [jobId]);
    if (!current[0]) return null;

    const currentStatus = current[0].status;
    const allowed = STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition: ${currentStatus} → ${newStatus}`);
    }

    // Build timestamp field
    const timestampMap = {
      accepted:    'accepted_at',
      in_progress: 'started_at',
      completed:   'completed_at',
      cancelled:   'cancelled_at',
    };
    const tsField = timestampMap[newStatus];

    let updateSql = `UPDATE jobs SET status = $1, updated_at = NOW()`;
    const params = [newStatus];
    let i = 2;

    if (tsField) {
      updateSql += `, ${tsField} = NOW()`;
    }
    if (extra.worker_id) {
      updateSql += `, worker_id = $${i++}`;
      params.push(extra.worker_id);
    }
    if (extra.cancellation_reason) {
      updateSql += `, cancellation_reason = $${i++}`;
      params.push(extra.cancellation_reason);
    }

    updateSql += ` WHERE id = $${i} RETURNING *`;
    params.push(jobId);

    const { rows } = await query(updateSql, params);
    return rows[0];
  },
};

module.exports = { JobModel, STATUS_TRANSITIONS };
