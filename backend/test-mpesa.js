// backend/test-mpesa.js
require('dotenv').config();
const paymentService = require('./paymentService');

async function testMpesa() {
  console.log('--- Running M-Pesa STK Push Test ---');

  const testPhoneNumber = '254708374149'; // Replace with a valid Safaricom number for testing
  const testAmount = 1; // Test with a small amount
  const testAccountRef = 'HK-TEST-001';
  const testTransactionDesc = 'M-Pesa Test';

  if (!process.env.MPESA_CALLBACK_URL || process.env.MPESA_CALLBACK_URL.includes('your-ngrok-url')) {
    console.error('\x1b[31m%s\x1b[0m', 'ERROR: MPESA_CALLBACK_URL is not configured.');
    console.error('Please complete the following steps:');
    console.error('1. Run `ngrok http 5000` in a new terminal.');
    console.error('2. Copy the HTTPS URL provided by ngrok.');
    console.error('3. Update the MPESA_CALLBACK_URL in your backend/.env file.');
    console.error('   Example: MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback');
    console.error('4. Restart your backend server.');
    console.log('----------------------------------------');
    return;
  }

  console.log(`Using Callback URL: ${process.env.MPESA_CALLBACK_URL}`);
  console.log(`Initiating STK push for ${testPhoneNumber} with amount ${testAmount}`);
  console.log('----------------------------------------');

  try {
    const result = await paymentService.initiateSTKPush(
      testPhoneNumber,
      testAmount,
      testAccountRef,
      testTransactionDesc
    );

    console.log('--- STK Push Initiation Result ---');
    if (result.success) {
      console.log('\x1b[32m%s\x1b[0m', '✅ STK Push initiated successfully!');
      console.log('CheckoutRequestID:', result.checkoutRequestId);
      console.log('Customer Message:', result.customerMessage);
      console.log('\n >> Check your phone for a prompt to enter your M-Pesa PIN. <<');
    } else {
      console.error('\x1b[31m%s\x1b[0m', '❌ Failed to initiate STK Push.');
      console.error('Error:', result.error?.message || 'Unknown error');
      if (result.error?.errorMessage) {
        console.error('Safaricom Error:', result.error.errorMessage);
      }
    }
    console.log('------------------------------------');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '--- An unexpected error occurred ---');
    console.error(error);
    console.log('------------------------------------');
  }
}

testMpesa();