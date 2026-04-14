require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const migrate = async () => {
  const schemaPath = path.join(__dirname, '../../docs/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('🔄 Running database migrations...');
  try {
    await pool.query(sql);
    console.log('✅ Migrations completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

migrate();
