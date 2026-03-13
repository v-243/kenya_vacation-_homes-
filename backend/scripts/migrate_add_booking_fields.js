const db = require('../db');

async function columnExists(table, column) {
  const [rows] = await db.query('SHOW COLUMNS FROM ?? LIKE ?', [table, column]);
  return rows.length > 0;
}

async function run() {
  try {
    const table = 'bookings';
    const cols = [
      { name: 'email', sql: "ALTER TABLE bookings ADD COLUMN email VARCHAR(255) NULL" },
      { name: 'payment_method', sql: "ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(100) NULL" },
      { name: 'nights', sql: "ALTER TABLE bookings ADD COLUMN nights INT DEFAULT 1" },
      { name: 'payment_status', sql: "ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'" },
      { name: 'mpesa_checkout_request_id', sql: "ALTER TABLE bookings ADD COLUMN mpesa_checkout_request_id VARCHAR(255) NULL" },
      { name: 'mpesa_receipt_number', sql: "ALTER TABLE bookings ADD COLUMN mpesa_receipt_number VARCHAR(255) NULL" }
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
