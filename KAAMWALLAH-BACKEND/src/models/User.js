const { query } = require('../config/database');

const UserModel = {
  /**
   * Find user by phone number
   */
  findByPhone: async (phone) => {
    const { rows } = await query(
      'SELECT * FROM users WHERE phone = $1 AND is_active = TRUE LIMIT 1',
      [phone]
    );
    return rows[0] || null;
  },

  /**
   * Find user by ID
   */
  findById: async (id) => {
    const { rows } = await query(
      'SELECT id, name, phone, role, language, phone_verified, last_login, created_at FROM users WHERE id = $1 AND is_active = TRUE',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user
   */
  create: async ({ name, phone, role, language = 'en' }) => {
    const { rows } = await query(
      `INSERT INTO users (name, phone, role, language)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, phone, role, language, phone_verified, created_at`,
      [name, phone, role, language]
    );
    return rows[0];
  },

  /**
   * Update phone_verified flag
   */
  markPhoneVerified: async (phone) => {
    const { rows } = await query(
      `UPDATE users SET phone_verified = TRUE, updated_at = NOW()
       WHERE phone = $1 RETURNING id, name, phone, role, language`,
      [phone]
    );
    return rows[0];
  },

  /**
   * Update last login timestamp
   */
  updateLastLogin: async (id) => {
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [id]);
  },

  /**
   * Update user profile
   */
  update: async (id, fields) => {
    const allowedFields = ['name', 'language'];
    const updates = [];
    const values = [];
    let i = 1;
    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${i}`);
        values.push(fields[key]);
        i++;
      }
    }
    if (updates.length === 0) return null;
    values.push(id);
    const { rows } = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${i} RETURNING id, name, phone, role, language`,
      values
    );
    return rows[0];
  },
};

module.exports = UserModel;
