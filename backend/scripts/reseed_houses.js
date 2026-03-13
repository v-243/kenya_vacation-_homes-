const db = require('../db');
const dotenv = require('dotenv');

dotenv.config();

async function reseedHouses() {
  try {
    console.log('Starting reseed of houses table...');

    // Delete all existing houses
    console.log('Clearing houses table...');
    await db.query('DELETE FROM houses');

    // Insert sample houses
    console.log('Inserting sample houses...');
    const sampleHouses = [
      {
        name: 'Cozy Nairobi Studio',
        location: 'Nairobi',
        price: 3500,
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
        beds: 1,
        baths: 1,
        description: 'A comfortable studio in the heart of Nairobi, close to restaurants and transport.'
      },
      {
        name: 'Beachside Mombasa Villa',
        location: 'Mombasa',
        price: 8500,
        imageUrl: 'https://images.unsplash.com/photo-1505691723518-36a6b7737cc6?w=1200&q=80',
        beds: 3,
        baths: 2,
        description: 'Spacious villa with sea views and private access to the beach.'
      },
      {
        name: 'Lakeview Kisumu Apartment',
        location: 'Kisumu',
        price: 4200,
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
        beds: 2,
        baths: 1,
        description: 'Modern apartment overlooking the lake; ideal for weekend getaways.'
      },
      {
        name: 'Thika Family House',
        location: 'Thika',
        price: 5000,
        imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
        beds: 3,
        baths: 2,
        description: 'Family-friendly house with garden and secure parking.'
      },
      {
        name: 'Tsavo Safari Lodge',
        location: 'Tsavo',
        price: 12000,
        imageUrl: 'https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?w=1200&q=80',
        beds: 4,
        baths: 3,
        description: 'Rustic lodge near Tsavo National Park, great for safari lovers.'
      }
    ];

    for (const house of sampleHouses) {
      await db.query(
        'INSERT INTO houses (name, location, price, imageUrl, beds, baths, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [house.name, house.location, house.price, house.imageUrl, house.beds, house.baths, house.description]
      );
      console.log(`✓ Inserted: ${house.name}`);
    }

    // Verify
    const [rows] = await db.query('SELECT COUNT(*) as count FROM houses');
    console.log(`\nReseed completed! Total houses: ${rows[0].count}`);

    // Show all houses
    const [allHouses] = await db.query('SELECT id, name, location, price, beds, baths FROM houses');
    console.log('\nAll houses:');
    console.table(allHouses);

    process.exit(0);
  } catch (err) {
    console.error('Reseed failed:', err);
    process.exit(1);
  }
}

reseedHouses();
