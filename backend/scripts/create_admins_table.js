const db = require('../db');

async function createTable() {
  try {
    // Ensure DB connection is established
    if (db.connectDB) {
      await db.connectDB();
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        id_number VARCHAR(100) NOT NULL UNIQUE,
        location VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        reset_token_hash VARCHAR(255),
        reset_token_expire DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Admins table ensured.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admins table:', err);
    process.exit(1);
  }
}

createTable();
