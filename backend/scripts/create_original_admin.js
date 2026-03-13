const db = require('../db');
const bcrypt = require('bcryptjs');

async function createOriginalAdmin() {
  try {
    // Ensure DB connection is established
    if (db.connectDB) {
      await db.connectDB();
    }

    const connection = db.getConnection();

    // First, check if the admins table has the new columns
    const [columns] = await connection.execute("DESCRIBE admins");
    const columnNames = columns.map(col => col.Field);

    // Add missing columns if they don't exist
    if (!columnNames.includes('email')) {
      await connection.execute('ALTER TABLE admins ADD COLUMN email VARCHAR(255) NOT NULL UNIQUE AFTER id_number');
      console.log('Added email column');
    }

    if (!columnNames.includes('is_approved')) {
      await connection.execute('ALTER TABLE admins ADD COLUMN is_approved TINYINT(1) NOT NULL DEFAULT 1 AFTER email');
      console.log('Added is_approved column');
    }

    if (!columnNames.includes('approved_by')) {
      await connection.execute('ALTER TABLE admins ADD COLUMN approved_by INT DEFAULT NULL AFTER is_approved');
      console.log('Added approved_by column');
    }

    if (!columnNames.includes('approval_token')) {
      await connection.execute('ALTER TABLE admins ADD COLUMN approval_token VARCHAR(255) DEFAULT NULL AFTER approved_by');
      console.log('Added approval_token column');
    }

    if (!columnNames.includes('username')) {
      await connection.execute('ALTER TABLE admins ADD COLUMN username VARCHAR(255) DEFAULT NULL AFTER id');
      console.log('Added username column');
    }

    if (!columnNames.includes('fullName')) {
      await connection.execute('ALTER TABLE admins ADD COLUMN fullName VARCHAR(255) DEFAULT NULL AFTER username');
      console.log('Added fullName column');
    }

    if (!columnNames.includes('idNumber')) {
      await connection.execute('ALTER TABLE admins ADD COLUMN idNumber VARCHAR(100) DEFAULT NULL AFTER fullName');
      console.log('Added idNumber column');
    }

    if (!columnNames.includes('location')) {
      await connection.execute('ALTER TABLE admins ADD COLUMN location VARCHAR(255) DEFAULT NULL AFTER idNumber');
      console.log('Added location column');
    }

    // Check if original admin exists
    const [existingAdmin] = await connection.execute("SELECT * FROM admins WHERE id = 1");

    if (existingAdmin.length === 0) {
      // Create original admin
      const adminData = {
        full_name: 'Main Admin',
        id_number: '00000001',
        email: 'admin@housekenya.com',
        location: 'Nairobi',
        password: 'Admin@123', // This will be hashed
        is_approved: 1,
        created_at: new Date()
      };

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminData.password, salt);

      // Insert original admin
      await connection.execute(
        'INSERT INTO admins (full_name, id_number, email, location, password, is_approved, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          adminData.full_name,
          adminData.id_number,
          adminData.email,
          adminData.location,
          hashedPassword,
          adminData.is_approved,
          adminData.created_at
        ]
      );

      console.log('✅ Original admin created successfully');
      console.log('Email: admin@housekenya.com');
      console.log('Password: Admin@123');
      console.log('⚠️  IMPORTANT: Change this password immediately after first login!');
    } else {
      console.log('✅ Original admin already exists');
    }

    console.log('Database schema updated successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createOriginalAdmin();
