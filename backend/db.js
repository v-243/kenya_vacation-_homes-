const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool;

const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    console.log('MySQL pool created successfully');
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
  try {
    const result = await conn.query(sql, params);
    return result;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
};

module.exports = { connectDB, getConnection, query };
