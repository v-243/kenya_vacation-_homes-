const http = require('http');
const fs = require('fs');
const path = require('path');

// Test video API endpoints
console.log('Testing Video API endpoints...\n');

// First, login to get token
const loginData = JSON.stringify({
  email: 'admin@housekenya.com', // Assuming this admin exists
  password: 'admin123'
});

console.log('1. Testing admin login...');

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

const loginReq = http.request(loginOptions, (res) => {
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
        const token = json.token;
        console.log('Token received successfully\n');

        // Now test video endpoints
        testVideoEndpoints(token);
      } catch (e) {
        console.error('Error parsing login response:', e.message);
      }
    } else {
      console.log('Login failed, trying alternative credentials...\n');
      // Try alternative login
      const altLoginData = JSON.stringify({
        id_number: 'Nairobi',
        password: 'test'
      });

      const altLoginOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': altLoginData.length
        }
      };

      const altReq = http.request(altLoginOptions, (altRes) => {
        let altData = '';
        altRes.on('data', (chunk) => {
          altData += chunk;
        });
        altRes.on('end', () => {
          console.log('Alternative login response status:', altRes.statusCode);
          console.log('Alternative login response body:', altData);

          if (altRes.statusCode === 200) {
            try {
              const altJson = JSON.parse(altData);
              const token = altJson.token;
              console.log('Token received successfully\n');
              testVideoEndpoints(token);
            } catch (e) {
              console.error('Error parsing alternative login response:', e.message);
            }
          } else {
            console.log('Both login attempts failed. Please ensure an admin user exists.\n');
          }
        });
      });

      altReq.on('error', (e) => {
        console.error('Alternative login request error:', e.message);
      });

      altReq.write(altLoginData);
      altReq.end();
    }
  });
});

loginReq.on('error', (e) => {
  console.error('Login request error:', e.message);
});

loginReq.write(loginData);
loginReq.end();

function testVideoEndpoints(token) {
  console.log('2. Testing GET /api/videos (fetch videos)...');

  const getVideosOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/videos',
    method: 'GET'
  };

  const getReq = http.request(getVideosOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('GET videos response status:', res.statusCode);
      console.log('GET videos response body:', data);
      console.log('');

      // Test video upload (we'll use a dummy file)
      testVideoUpload(token);
    });
  });

  getReq.on('error', (e) => {
    console.error('GET videos request error:', e.message);
  });

  getReq.end();
}

function testVideoUpload(token) {
  console.log('3. Testing POST /api/videos (upload video)...');

  // Create a dummy video file for testing
  const dummyVideoPath = path.join(__dirname, 'test-video.mp4');
  const dummyContent = 'dummy video content'; // This is not a real video, just for testing

  fs.writeFileSync(dummyVideoPath, dummyContent);

  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const postData = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="video"; filename="test-video.mp4"',
    'Content-Type: video/mp4',
    '',
    dummyContent,
    `--${boundary}--`
  ].join('\r\n');

  const uploadOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/videos',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const uploadReq = http.request(uploadOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Upload video response status:', res.statusCode);
      console.log('Upload video response body:', data);

      // Clean up dummy file
      if (fs.existsSync(dummyVideoPath)) {
        fs.unlinkSync(dummyVideoPath);
      }

      if (res.statusCode === 201) {
        console.log('Video upload successful\n');
        // Test delete if upload was successful
        try {
          const response = JSON.parse(data);
          if (response.video && response.video.filename) {
            testVideoDelete(token, response.video.filename);
          } else {
            console.log('Could not extract filename from upload response\n');
          }
        } catch (e) {
          console.log('Could not parse upload response\n');
        }
      } else {
        console.log('Video upload failed\n');
      }
    });
  });

  uploadReq.on('error', (e) => {
    console.error('Upload video request error:', e.message);
    // Clean up dummy file
    if (fs.existsSync(dummyVideoPath)) {
      fs.unlinkSync(dummyVideoPath);
    }
  });

  uploadReq.write(postData);
  uploadReq.end();
}

function testVideoDelete(token, filename) {
  console.log('4. Testing DELETE /api/videos/:filename (delete video)...');

  const deleteOptions = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/videos/${filename}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const deleteReq = http.request(deleteOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Delete video response status:', res.statusCode);
      console.log('Delete video response body:', data);
      console.log('');

      console.log('Video API testing completed.');
    });
  });

  deleteReq.on('error', (e) => {
    console.error('Delete video request error:', e.message);
  });

  deleteReq.end();
}
