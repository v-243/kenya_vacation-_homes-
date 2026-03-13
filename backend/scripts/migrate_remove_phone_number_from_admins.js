
const db = require('../db');

async function removeColumn() {
  try {
    // Ensure DB connection is established
    if (db.connectDB) {
      await db.connectDB();
    }

    await db.query(`
      ALTER TABLE admins DROP COLUMN phone_number;
    `);
    console.log('Successfully removed phone_number column from admins table.');
    process.exit(0);
  } catch (err) {
    // Ignore if the column doesn't exist
    if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log('phone_number column does not exist, skipping.');
      process.exit(0);
    }
    console.error('Failed to remove phone_number column:', err);
    process.exit(1);
  }
}

removeColumn();
