const { getConnection } = require('../db');

async function createAdminTable() {
  const connection = getConnection();

  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        idNumber VARCHAR(255) NOT NULL UNIQUE,
        location VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createTableQuery);
    console.log('Admin table created successfully');
  } catch (error) {
    console.error('Error creating admin table:', error);
  } finally {
    await connection.end();
  }
}

createAdminTable();
