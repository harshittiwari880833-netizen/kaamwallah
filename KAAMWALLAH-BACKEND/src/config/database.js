// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 5000,
// });

// pool.on('connect', () => {
//   if (process.env.NODE_ENV === 'development') {
//     console.log('📦 Database connected');
//   }
// });

// pool.on('error', (err) => {
//   console.error('❌ Database pool error:', err.message);
// });

// /**
//  * Execute a query with automatic client release
//  */
// const query = async (text, params) => {
//   const start = Date.now();
//   try {
//     const result = await pool.query(text, params);
//     if (process.env.NODE_ENV === 'development') {
//       const duration = Date.now() - start;
//       console.log(`🔍 Query [${duration}ms]: ${text.substring(0, 80)}...`);
//     }
//     return result;
//   } catch (err) {
//     console.error('❌ Query error:', err.message);
//     throw err;
//   }
// };

// /**
//  * Transaction helper
//  */
// const withTransaction = async (callback) => {
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');
//     const result = await callback(client);
//     await client.query('COMMIT');
//     return result;
//   } catch (err) {
//     await client.query('ROLLBACK');
//     throw err;
//   } finally {
//     client.release();
//   }
// };

// module.exports = { pool, query, withTransaction };


const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📦 Database connected');
  }
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - start;
      console.log(`🔍 Query [${duration}ms]: ${text.substring(0, 80)}...`);
    }
    return result;
  } catch (err) {
    console.error('❌ Query error:', err.message);
    throw err;
  }
};

const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, query, withTransaction };
