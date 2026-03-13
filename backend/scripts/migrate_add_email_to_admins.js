const { connectDB, query } = require('../db');

async function addEmailColumn() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Check if email column exists
    const [columns] = await query("SHOW COLUMNS FROM admins WHERE Field = 'email'");
    
    if (columns.length > 0) {
      console.log('Email column already exists');
      process.exit(0);
    }

    // Add email column
    await query(`ALTER TABLE admins ADD COLUMN email VARCHAR(255) UNIQUE AFTER full_name`);
    console.log('Successfully added email column to admins table');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addEmailColumn();
