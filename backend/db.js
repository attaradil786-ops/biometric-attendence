const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'attendance_system',
  password: 'adilattar@07', // Replace with the password you set during installation
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Connection error:', err.stack);
  }
  console.log('Connected to PostgreSQL successfully!');
  release();
});

module.exports = pool;

