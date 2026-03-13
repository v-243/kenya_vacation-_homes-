const axios = require('axios');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000';

// Test house creation
async function testHouseCreation() {
  try {
    // Create a valid JWT token
    const token = jwt.sign(
      { adminId: 1, idNumber: 'test123' },
      'your-secret-key',  // Match the secret used in server
      { expiresIn: '24h' }
    );

    console.log('Generated token:', token);

    // Create a simple test image (1x1 PNG)
    const testImagePath = path.join(__dirname, 'test-image.png');
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImagePath, pngBuffer);

    // Prepare FormData
    const FormData = require('form-data');
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath));
    form.append('name', 'Test House');
    form.append('location', 'Nairobi');
    form.append('price', '5000');
    form.append('beds', '3');
    form.append('baths', '2');
    form.append('description', 'A beautiful test house');

    console.log('\nSending POST /api/houses request...');
    const response = await axios.post(`${BASE_URL}/api/houses`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n✅ Success! Response:');
    console.log(JSON.stringify(response.data, null, 2));

    // Clean up
    fs.unlinkSync(testImagePath);
  } catch (err) {
    console.error('\n❌ Error:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error('Message:', err.message);
    }
    process.exit(1);
  }
}

// Run test
testHouseCreation();
