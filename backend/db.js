const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Connection error:', err.message);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

module.exports = pool;