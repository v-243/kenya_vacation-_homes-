const db = require('../db');
db.connectDB();

async function runMigration() {
  try {
    console.log('Running booking dates migration...');
    
    // Add checkin_date column if not exists
    await db.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS checkin_date DATE NULL AFTER nights
    `);
    
    // Add checkout_date column if not exists  
    await db.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS checkout_date DATE NULL AFTER checkin_date
    `);
    
    console.log('✅ Migration completed: Added checkin_date and checkout_date columns to bookings table');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();

