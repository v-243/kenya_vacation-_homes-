const http = require('http');

// Test 1: Register admin
function testRegister() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      fullName: 'Test Admin',
      email: 'test-admin@example.com',
      idNumber: 'TEST12345',
      location: 'Nairobi',
      password: 's3cret123',
      confirmPassword: 's3cret123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    console.log('\n=== TEST 1: REGISTER ADMIN ===');
    const req = http.request(options, res => {
      console.log(`Status: ${res.statusCode}`);
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Response:', body);
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', err => {
      console.error('Request error:', err.message);
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

// Test 2: Forgot Password
function testForgotPassword() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      idNumber: 'TEST12345'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/forgot-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    console.log('\n=== TEST 2: FORGOT PASSWORD ===');
    const req = http.request(options, res => {
      console.log(`Status: ${res.statusCode}`);
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Response:', body);
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', err => {
      console.error('Request error:', err.message);
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

// Test 3: Check DB for reset token
function testCheckDB() {
  return new Promise((resolve, reject) => {
    const db = require('./db');
    db.connectDB().then(async () => {
      console.log('\n=== TEST 3: CHECK DATABASE ===');
      try {
        const [rows] = await db.query(
          'SELECT id, full_name, email, id_number, reset_token_hash, reset_token_expire FROM admins WHERE id_number = ?',
          ['TEST12345']
        );
        console.log('DB Row:', JSON.stringify(rows, null, 2));
        resolve(rows);
      } catch (err) {
        console.error('DB error:', err.message);
        reject(err);
      }
    }).catch(err => {
      console.error('DB connect error:', err.message);
      reject(err);
    });
  });
}

// Run tests sequentially
async function runTests() {
  try {
    await testRegister();
    await new Promise(r => setTimeout(r, 1000)); // wait 1s
    
    await testForgotPassword();
    await new Promise(r => setTimeout(r, 1000)); // wait 1s
    
    await testCheckDB();
    
    console.log('\n=== ALL TESTS COMPLETE ===');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
