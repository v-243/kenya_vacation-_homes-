const http = require('http');
const data = JSON.stringify({ fullName: 'Test Admin', email: 'test-admin@example.com', location: 'Nairobi', password: 's3cret123', confirmPassword: 's3cret123' });

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

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('BODY:', body);
  });
});

req.on('error', e => {
  console.error('Request error:', e.message);
});

req.write(data);
req.end();
