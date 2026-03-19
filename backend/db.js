const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool;
let poolPromise;

const getPoolConfig = () => ({
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

const connectDB = async () => {
  if (pool) {
    return pool;
  }

  if (poolPromise) {
    return poolPromise;
  }

  const missingVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].filter(
    (key) => !process.env[key]
  );

  if (missingVars.length > 0) {
    throw new Error(`Missing database environment variables: ${missingVars.join(', ')}`);
  }

  poolPromise = (async () => {
    try {
      const createdPool = mysql.createPool(getPoolConfig());
      await createdPool.query('SELECT 1');
      pool = createdPool;
      console.log('MySQL pool created successfully');
      return pool;
    } finally {
      poolPromise = null;
    }
  })();

  return poolPromise;
};

const getConnection = async () => {
  if (!pool) {
    await connectDB();
  }

  return pool;
};

const query = async (sql, params) => {
  const conn = await getConnection();

  try {
    const result = await conn.query(sql, params);
    return result;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
};

module.exports = { connectDB, getConnection, query };
