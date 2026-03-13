const { connectDB, query } = require('./db');

async function checkVideoTable() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Check if advertisement_videos table exists
    const [tables] = await query('SHOW TABLES LIKE ?', ['advertisement_videos']);
    if (tables.length === 0) {
      console.log('advertisement_videos table does NOT exist');
      console.log('Creating advertisement_videos table...');

      const createTableQuery = `
        CREATE TABLE advertisement_videos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          path VARCHAR(500) NOT NULL,
          size BIGINT NOT NULL,
          mimetype VARCHAR(100) NOT NULL,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await query(createTableQuery);
      console.log('advertisement_videos table created successfully');
    } else {
      console.log('advertisement_videos table exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkVideoTable();
