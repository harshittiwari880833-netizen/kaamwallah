// const { query, withTransaction } = require('../config/database');

// const WorkerModel = {
//   /**
//    * Create worker profile (linked to user)
//    */
//   create: async (userId, data) => {
//     const { skills, price_per_day, price_per_job, pricing_type, city, state,
//       bio, latitude, longitude, experience_years } = data;

//     const { rows } = await query(
//       `INSERT INTO workers
//          (user_id, skills, price_per_day, price_per_job, pricing_type, city, state,
//           bio, latitude, longitude, experience_years)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
//        RETURNING *`,
//       [userId, skills, price_per_day || null, price_per_job || null,
//        pricing_type || 'day', city || 'Lucknow', state || 'Uttar Pradesh',
//        bio || null, latitude || null, longitude || null, experience_years || 0]
//     );
//     return rows[0];
//   },

//   /**
//    * Get worker profile by user_id (with user details joined)
//    */
//   findByUserId: async (userId) => {
//     const { rows } = await query(
//       `SELECT w.*, u.name, u.phone, u.language
//        FROM workers w JOIN users u ON u.id = w.user_id
//        WHERE w.user_id = $1`,
//       [userId]
//     );
//     return rows[0] || null;
//   },

//   /**
//    * Get worker profile by worker id
//    */
//   findById: async (workerId) => {
//     const { rows } = await query(
//       `SELECT w.*, u.name, u.phone, u.language
//        FROM workers w JOIN users u ON u.id = w.user_id
//        WHERE w.id = $1`,
//       [workerId]
//     );
//     return rows[0] || null;
//   },

//   /**
//    * Search workers with filters
//    */
//   search: async ({ skill, city, minPrice, maxPrice, page = 1, limit = 10, sortBy = 'rating' }) => {
//     const offset = (page - 1) * limit;
//     const params = [];
//     const conditions = ['w.is_available = TRUE'];
//     let i = 1;

//     if (skill) {
//       conditions.push(`$${i} = ANY(w.skills)`);
//       params.push(skill.toLowerCase());
//       i++;
//     }
//     if (city) {
//       conditions.push(`LOWER(w.city) = LOWER($${i})`);
//       params.push(city);
//       i++;
//     }
//     if (minPrice !== undefined) {
//       conditions.push(`(w.price_per_day >= $${i} OR w.price_per_job >= $${i})`);
//       params.push(minPrice);
//       i++;
//     }
//     if (maxPrice !== undefined) {
//       conditions.push(`(w.price_per_day <= $${i} OR w.price_per_job <= $${i})`);
//       params.push(maxPrice);
//       i++;
//     }

//     const orderMap = {
//       rating: 'w.avg_rating DESC, w.total_reviews DESC',
//       price:  'w.price_per_day ASC NULLS LAST',
//       jobs:   'w.total_jobs DESC',
//     };
//     const orderClause = orderMap[sortBy] || orderMap.rating;
//     const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

//     const countQuery = `SELECT COUNT(*) FROM workers w ${whereClause}`;
//     const dataQuery = `
//       SELECT w.id, w.skills, w.city, w.price_per_day, w.price_per_job,
//              w.pricing_type, w.avg_rating, w.total_reviews, w.total_jobs,
//              w.is_available, w.experience_years, w.profile_photo,
//              u.name, u.phone
//       FROM workers w JOIN users u ON u.id = w.user_id
//       ${whereClause}
//       ORDER BY ${orderClause}
//       LIMIT $${i} OFFSET $${i + 1}
//     `;

//     const [countResult, dataResult] = await Promise.all([
//       query(countQuery, params),
//       query(dataQuery, [...params, limit, offset]),
//     ]);

//     return {
//       workers: dataResult.rows,
//       total: parseInt(countResult.rows[0].count),
//     };
//   },

//   /**
//    * Update worker profile
//    */
//   update: async (workerId, fields) => {
//     const allowed = ['skills', 'price_per_day', 'price_per_job', 'pricing_type',
//                      'city', 'bio', 'is_available', 'experience_years', 'profile_photo',
//                      'latitude', 'longitude'];
//     const updates = [];
//     const values = [];
//     let i = 1;

//     for (const key of allowed) {
//       if (fields[key] !== undefined) {
//         updates.push(`${key} = $${i}`);
//         values.push(fields[key]);
//         i++;
//       }
//     }
//     if (updates.length === 0) return null;
//     values.push(workerId);

//     const { rows } = await query(
//       `UPDATE workers SET ${updates.join(', ')}, updated_at = NOW()
//        WHERE id = $${i} RETURNING *`,
//       values
//     );
//     return rows[0];
//   },
// };

// module.exports = WorkerModel;

const { query } = require('../config/database');

const WorkerModel = {

  // ✅ CREATE WORKER
  create: async (userId, data) => {
    try {
      const {
        skills,
        price_per_day,
        price_per_job,
        pricing_type,
        city,
        state,
        bio,
        latitude,
        longitude,
        experience_years,
      } = data;

      const { rows } = await query(
        `INSERT INTO workers
         (user_id, skills, price_per_day, price_per_job, pricing_type, city, state,
          bio, latitude, longitude, experience_years)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [
          userId,
          skills || [],
          price_per_day || 0,
          price_per_job || 0,
          pricing_type || 'per_job', // ✅ FIXED
          city || 'Lucknow',
          state || 'Uttar Pradesh',
          bio || '',
          latitude || null,
          longitude || null,
          experience_years || 0,
        ]
      );

      return rows[0];
    } catch (err) {
      console.error('❌ Worker Create Error:', err.message);
      throw err;
    }
  },

  // ✅ FIND BY USER
  findByUserId: async (userId) => {
    const { rows } = await query(
      `SELECT w.*, u.name, u.phone, u.language
       FROM workers w
       JOIN users u ON u.id = w.user_id
       WHERE w.user_id = $1`,
      [userId]
    );
    return rows[0] || null;
  },

  // ✅ FIND BY ID
  findById: async (workerId) => {
    const { rows } = await query(
      `SELECT w.*, u.name, u.phone, u.language
       FROM workers w
       JOIN users u ON u.id = w.user_id
       WHERE w.id = $1`,
      [workerId]
    );
    return rows[0] || null;
  },

  // 🔥 FIXED SEARCH
  search: async ({
    skill,
    city,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sortBy = 'rating',
  }) => {
    try {
      const offset = (page - 1) * limit;
      const params = [];
      const conditions = ['w.is_available = TRUE'];
      let i = 1;

      // ✅ SAFE SKILL FILTER
      if (skill) {
        conditions.push(`LOWER($${i}) = ANY(w.skills)`);
        params.push(skill.toLowerCase());
        i++;
      }

      if (city) {
        conditions.push(`LOWER(w.city) = LOWER($${i})`);
        params.push(city);
        i++;
      }

      if (minPrice !== undefined) {
        conditions.push(`(w.price_per_day >= $${i} OR w.price_per_job >= $${i})`);
        params.push(minPrice);
        i++;
      }

      if (maxPrice !== undefined) {
        conditions.push(`(w.price_per_day <= $${i} OR w.price_per_job <= $${i})`);
        params.push(maxPrice);
        i++;
      }

      const orderMap = {
        rating: 'COALESCE(w.avg_rating,0) DESC',
        price: 'COALESCE(w.price_per_day,0) ASC',
        jobs: 'COALESCE(w.total_jobs,0) DESC',
      };

      const orderClause = orderMap[sortBy] || orderMap.rating;
      const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

      const countQuery = `SELECT COUNT(*) FROM workers w ${whereClause}`;

      const dataQuery = `
        SELECT 
          w.id,
          w.skills,
          w.city,
          COALESCE(w.price_per_day,0) as price_per_day,
          COALESCE(w.price_per_job,0) as price_per_job,
          COALESCE(w.pricing_type,'per_job') as pricing_type,
          COALESCE(w.avg_rating,0) as avg_rating,
          COALESCE(w.total_reviews,0) as total_reviews,
          COALESCE(w.total_jobs,0) as total_jobs,
          w.is_available,
          COALESCE(w.experience_years,0) as experience_years,
          w.profile_photo,
          u.name,
          u.phone
        FROM workers w
        JOIN users u ON u.id = w.user_id
        ${whereClause}
        ORDER BY ${orderClause}
        LIMIT $${i} OFFSET $${i + 1}
      `;

      const [countResult, dataResult] = await Promise.all([
        query(countQuery, params),
        query(dataQuery, [...params, limit, offset]),
      ]);

      return {
        workers: dataResult.rows,
        total: parseInt(countResult.rows[0].count),
      };
    } catch (err) {
      console.error('❌ Worker Search Error:', err.message);
      throw err;
    }
  },

  // ✅ UPDATE
  update: async (workerId, fields) => {
    const allowed = [
      'skills',
      'price_per_day',
      'price_per_job',
      'pricing_type',
      'city',
      'bio',
      'is_available',
      'experience_years',
      'profile_photo',
      'latitude',
      'longitude',
    ];

    const updates = [];
    const values = [];
    let i = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${i}`);
        values.push(fields[key]);
        i++;
      }
    }

    if (updates.length === 0) return null;

    values.push(workerId);

    const { rows } = await query(
      `UPDATE workers
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${i}
       RETURNING *`,
      values
    );

    return rows[0];
  },
};

module.exports = WorkerModel;