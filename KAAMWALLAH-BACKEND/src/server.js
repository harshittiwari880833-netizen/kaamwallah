require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/database');

const PORT = parseInt(process.env.PORT) || 3000;

const start = async () => {
  try {
    // Verify DB connection on startup
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified');

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Labour Marketplace API`);
      console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Port        : ${PORT}`);
      console.log(`   Health      : http://localhost:${PORT}/health\n`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await pool.end();
        console.log('✅ Database pool closed. Goodbye!\n');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    // Unhandled errors
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err);
      shutdown('UNHANDLED_REJECTION');
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
