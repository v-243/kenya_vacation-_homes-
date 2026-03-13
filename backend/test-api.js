const http = require('http');

// First, test login
const loginData = JSON.stringify({
  id_number: 'Nairobi',
  password: 'test'
});

console.log('Testing admin login with id_number: Nairobi, password: test');

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Login response status:', res.statusCode);
    console.log('Login response body:', data);
    
    if (res.statusCode === 200) {
      try {
        const json = JSON.parse(data);
        console.log('Token received:', json.token.substring(0, 20) + '...');
      } catch (e) {
        console.error('Error parsing response:', e.message);
      }
    }
  });
});

req.on('error', (e) => {
  console.error('Login request error:', e.message);
});

req.write(loginData);
req.end();
