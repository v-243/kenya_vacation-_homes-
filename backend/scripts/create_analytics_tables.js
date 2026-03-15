const db = require('../db');

async function createNewsletterTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    console.log('Newsletter subscribers table created successfully');
  } catch (error) {
    console.error('Error creating newsletter subscribers table:', error);
  }
}

async function createHouseLikesTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS house_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        house_id INT NOT NULL,
        user_ip VARCHAR(45),
        user_agent TEXT,
        liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_house_user (house_id, user_ip)
      )
    `);
    console.log('House likes table created successfully');
  } catch (error) {
    console.error('Error creating house likes table:', error);
  }
}

async function runMigrations() {
  await createNewsletterTable();
  await createHouseLikesTable();
  console.log('All migrations completed');
}

runMigrations().catch(console.error);