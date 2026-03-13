const { connectDB, getConnection } = require('../db');

const readHouses = async () => {
  try {
    await connectDB();
    const connection = getConnection();
    const [rows] = await connection.query('SELECT * FROM houses');
    console.log(rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

readHouses();
