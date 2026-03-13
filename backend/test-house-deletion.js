const http = require('http');

// Test house deletion functionality
async function testHouseDeletion() {
  console.log('=== TESTING HOUSE DELETION ===');

  try {
    // First, get all houses
    console.log('\n1. Fetching houses...');
    const housesResponse = await makeRequest({
      path: '/api/houses',
      method: 'GET'
    });

    if (housesResponse.statusCode !== 200) {
      console.log('Failed to fetch houses:', housesResponse.statusCode, housesResponse.data);
      return;
    }

    const houses = JSON.parse(housesResponse.data);
    console.log(`Found ${houses.length} houses`);

    if (houses.length === 0) {
      console.log('No houses to delete. Test complete.');
      return;
    }

    // Try to delete the first house without auth (should fail)
    console.log('\n2. Testing deletion without auth...');
    const houseId = houses[0].id;
    const deleteResponse = await makeRequest({
      path: `/api/houses/${houseId}`,
      method: 'DELETE'
    });

    if (deleteResponse.statusCode === 401) {
      console.log('✓ Correctly rejected unauthorized deletion');
    } else {
      console.log('✗ Should have rejected unauthorized deletion, got:', deleteResponse.statusCode);
    }

    // Try to login as admin first
    console.log('\n3. Attempting admin login...');
    const loginResponse = await makeRequest({
      path: '/api/admin/login',
      method: 'POST',
      data: JSON.stringify({
        id_number: 'Nairobi', // from test-api.js
        password: 'test'
      })
    });

    if (loginResponse.statusCode !== 200) {
      console.log('Admin login failed:', loginResponse.statusCode, loginResponse.data);
      console.log('Cannot test authenticated deletion without valid admin credentials');
      return;
    }

    const loginData = JSON.parse(loginResponse.data);
    const token = loginData.token;
    console.log('✓ Admin login successful');

    // Now try to delete with auth
    console.log('\n4. Testing deletion with auth...');
    const authDeleteResponse = await makeRequest({
      path: `/api/houses/${houseId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (authDeleteResponse.statusCode === 200) {
      console.log('✓ House deletion successful');
    } else {
      console.log('✗ House deletion failed:', authDeleteResponse.statusCode, authDeleteResponse.data);
    }

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      hostname: 'localhost',
      port: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const reqOptions = { ...defaultOptions, ...options };
    if (options.data) {
      reqOptions.headers['Content-Length'] = Buffer.byteLength(options.data);
    }

    const req = http.request(reqOptions, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: body
        });
      });
    });

    req.on('error', reject);

    if (options.data) {
      req.write(options.data);
    }
    req.end();
  });
}

testHouseDeletion().then(() => {
  console.log('\n=== HOUSE DELETION TEST COMPLETE ===');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
