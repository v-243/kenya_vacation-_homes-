const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool;

const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'houseskenya',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('MySQL pool created');
  } catch (err) {
    console.error('MySQL connection error:', err.message);
    process.exit(1);
  }
};

const getConnection = () => {
  if (!pool) {
    throw new Error('Database not connected');
  }
  return pool;
};

// Convenience query wrapper so other modules can call db.query(sql, params)
const query = async (sql, params) => {
  const conn = getConnection();
  return conn.query(sql, params);
};

module.exports = { connectDB, getConnection, query };
