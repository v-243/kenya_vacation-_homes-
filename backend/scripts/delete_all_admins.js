const db = require('../db');

async function deleteAllAdmins() {
  try {
    // Ensure DB connection is established
    if (db.connectDB) {
      await db.connectDB();
    }

    const connection = db.getConnection();

    // Check if admins table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'admins'");
    if (tables.length === 0) {
      console.log('✅ Admins table does not exist. Database is already clean.');
      process.exit(0);
    }

    // Get count of admins before deletion
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM admins');
    const adminCount = countResult[0].count;

    console.log(`Found ${adminCount} admin(s) in the database.`);

    if (adminCount === 0) {
      console.log('✅ No admin records to delete. Database is already clean.');
      process.exit(0);
    }

    // Delete all admin records
    await connection.execute('DELETE FROM admins');

    console.log(`✅ Successfully deleted ${adminCount} admin record(s).`);
    console.log('✅ Database is now clean and ready for new admin creation.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error deleting admins:', err.message);
    process.exit(1);
  }
}

deleteAllAdmins();
