const db = require('../db');

async function columnExists(table, column) {
  const [rows] = await db.query('SHOW COLUMNS FROM ?? LIKE ?', [table, column]);
  return rows.length > 0;
}

async function run() {
  try {
    await db.connectDB();
    const table = 'bookings';
    const cols = [
      { name: 'customer_name', sql: "ALTER TABLE bookings ADD COLUMN customer_name VARCHAR(255)" },
      { name: 'customer_id_number', sql: "ALTER TABLE bookings ADD COLUMN customer_id_number VARCHAR(50)" }
    ];

    for (const c of cols) {
      const exists = await columnExists(table, c.name);
      if (exists) {
        console.log(`Column ${c.name} already exists — skipping.`);
      } else {
        console.log(`Adding column ${c.name} ...`);
        await db.query(c.sql);
        console.log(`Added ${c.name}`);
      }
    }

    console.log('Migration completed.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
