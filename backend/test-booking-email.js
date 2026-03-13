const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test booking creation with email
async function testBookingWithEmail() {
  try {
    console.log('🧪 Testing booking creation with email confirmation...');

    // Test booking data (matching API expectations)
    const bookingData = {
      house_id: 3, // Using house ID 3 which should be available
      customer_name: 'Test Customer',
      customer_id_number: 'TEST123456',
      customer_phone: '+254712345678',
      total_cost: 15000,
      email: 'test@example.com',
      payment_method: 'M-Pesa',
      nights: 3
    };

    console.log('📝 Booking data:', bookingData);

    const response = await axios.post(`${BASE_URL}/api/bookings`, bookingData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Booking created successfully!');
    console.log('📧 Email should have been sent to:', bookingData.customerEmail);
    console.log('📄 Response:', response.data);

  } catch (error) {
    console.error('❌ Booking test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testBookingWithEmail();