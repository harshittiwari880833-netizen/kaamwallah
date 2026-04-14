require('dotenv').config();
const { pool } = require('../config/database');

const seed = async () => {
  console.log('🌱 Seeding database with sample data...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create sample client user
    const clientResult = await client.query(`
      INSERT INTO users (name, phone, role, language, phone_verified)
      VALUES ('Rajesh Kumar', '9876543210', 'client', 'hi', TRUE)
      ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `);
    const clientId = clientResult.rows[0].id;

    // Create sample labour users
    const labour1 = await client.query(`
      INSERT INTO users (name, phone, role, language, phone_verified)
      VALUES ('Suresh Plumber', '9876543211', 'labour', 'hi', TRUE)
      ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `);
    const labour2 = await client.query(`
      INSERT INTO users (name, phone, role, language, phone_verified)
      VALUES ('Ramesh Electrician', '9876543212', 'labour', 'en', TRUE)
      ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `);

    // Create worker profiles
    const worker1 = await client.query(`
      INSERT INTO workers (user_id, skills, price_per_day, price_per_job, pricing_type, city, bio, experience_years, avg_rating, total_reviews)
      VALUES ($1, ARRAY['plumber','pipe fitting','bathroom fitting'], 800.00, 300.00, 'both', 'Lucknow', 'Expert plumber with 8 years experience in residential and commercial work.', 8, 4.5, 12)
      ON CONFLICT (user_id) DO UPDATE SET skills = EXCLUDED.skills
      RETURNING id
    `, [labour1.rows[0].id]);

    await client.query(`
      INSERT INTO workers (user_id, skills, price_per_day, price_per_job, pricing_type, city, bio, experience_years, avg_rating, total_reviews)
      VALUES ($1, ARRAY['electrician','wiring','ac repair'], 1000.00, 400.00, 'both', 'Lucknow', 'Certified electrician. Handles domestic wiring, MCB panels, and AC installation.', 5, 4.2, 8)
      ON CONFLICT (user_id) DO UPDATE SET skills = EXCLUDED.skills
    `, [labour2.rows[0].id]);

    // Create sample job
    const job = await client.query(`
      INSERT INTO jobs (client_id, worker_id, title, description, skill_required, city, address, agreed_price, status, accepted_at)
      VALUES ($1, $2, 'Fix kitchen sink leakage', 'The kitchen sink pipe is leaking. Need urgent repair.', 'plumber', 'Lucknow', 'Sector 14, Indira Nagar, Lucknow', 350.00, 'completed', NOW() - INTERVAL '2 hours')
      RETURNING id
    `, [clientId, worker1.rows[0].id]);

    // Create a review for the job
    await client.query(`
      INSERT INTO reviews (job_id, client_id, worker_id, rating, comment)
      VALUES ($1, $2, $3, 5, 'Excellent work! Fixed the leak quickly and cleanly. Very professional.')
      ON CONFLICT (job_id) DO NOTHING
    `, [job.rows[0].id, clientId, worker1.rows[0].id]);

    // Record earnings
    await client.query(`
      INSERT INTO earnings (worker_id, job_id, amount, earned_at)
      VALUES ($1, $2, 350.00, CURRENT_DATE)
      ON CONFLICT DO NOTHING
    `, [worker1.rows[0].id, job.rows[0].id]);

    await client.query('COMMIT');
    console.log('✅ Seed completed successfully');
    console.log('\n📋 Sample Credentials:');
    console.log('   Client  → Phone: 9876543210 (OTP: check console)');
    console.log('   Labour1 → Phone: 9876543211 (plumber)');
    console.log('   Labour2 → Phone: 9876543212 (electrician)\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
