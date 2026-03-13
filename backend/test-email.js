const dotenv = require('dotenv');
const { sendBookingConfirmationEmail } = require('./services/mailService');

// Load environment variables
dotenv.config();

console.log('Environment variables loaded:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'undefined');

// Test email functionality
const testEmail = async () => {
  try {
    console.log('Testing email service...');

    // Test booking details
    const testBooking = {
      bookingId: 12345,
      houseName: 'Test Villa',
      location: 'Nairobi',
      nights: 3,
      amountPaid: 15000,
      customerName: 'Test Customer',
      customerPhone: '+254712345678',
      paymentMethod: 'M-Pesa',
      createdAt: new Date()
    };

    await sendBookingConfirmationEmail('test@example.com', testBooking);
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if EMAIL_USER and EMAIL_PASS are set in .env');
    console.log('2. For Gmail: Enable "Less secure app access" or use an App Password');
    console.log('3. Verify the email credentials are correct');
    console.log('4. Check if your network/firewall blocks SMTP');
  }
};

testEmail();