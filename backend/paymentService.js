const axios = require('axios');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || 'AyMXF9kEyQ64nPXjzchhEEzejz5DVtgN1BXyIBZxyAoZWbUa';
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || 'Y8RUvtcOrAfG8cMY8wjzYpCjF3yM6thGkBQvvsgO4BLJ2iNVYZvrbOgISEd2jCft';
    this.shortcode = process.env.MPESA_SHORTCODE || '174379'; // STK Push shortcode
    this.passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'; // Default sandbox passkey
    this.baseUrl = process.env.MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
    
    // For callback URL, prioritize explicit setting, then use environment variable, then fallback
    // For sandbox/development, using ngrok URL or public server is recommended
    // Format: https://yourdomain.com/api/mpesa/callback or http://ngrok-url/api/mpesa/callback
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!this.callbackUrl) {
      // If no callback URL is set, log a warning for development
      const isDevelopment = process.env.MPESA_ENV !== 'production' && !process.env.BASE_URL;
      if (isDevelopment) {
        console.warn('[M-Pesa] ⚠️ WARNING: MPESA_CALLBACK_URL not set!');
        console.warn('[M-Pesa] M-Pesa integration will not work until you set up ngrok or a public tunnel.');
        console.warn('[M-Pesa] Please set MPESA_CALLBACK_URL in your .env file to enable payments.');
      } else {
        // For production with BASE_URL
        this.callbackUrl = `${process.env.BASE_URL}/api/mpesa/callback`;
      }
    }
  }

  async getAccessToken() {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    try {
      console.log(`[M-Pesa] Requesting access token from ${this.baseUrl}/oauth/v1/generate`);
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });
      console.log(`[M-Pesa] Access token received successfully`);
      return response.data.access_token;
    } catch (error) {
      console.error('[M-Pesa] Error getting access token:', error.response?.data || error.message);
      console.error('[M-Pesa] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(`Failed to get M-Pesa access token: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc = 'House Booking Payment') {
    if (!this.callbackUrl) {
      console.error('[M-Pesa] Cannot initiate STK Push: MPESA_CALLBACK_URL is missing.');
      return {
        success: false,
        error: { message: 'Server configuration error: MPESA_CALLBACK_URL is missing.' }
      };
    }

    try {
      console.log(`[M-Pesa] Initiating STK Push: phone=${phoneNumber}, amount=${amount}`);
      const accessToken = await this.getAccessToken();
      console.log(`[M-Pesa] Access token obtained successfully`);
      
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: phoneNumber,
        PartyB: this.shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };

      console.log(`[M-Pesa] Sending STK Push request to ${this.baseUrl}/mpesa/stkpush/v1/processrequest`);
      console.log(`[M-Pesa] Callback URL: ${this.callbackUrl}`);
      console.log(`[M-Pesa] Payload:`, payload);
      const response = await axios.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`[M-Pesa] STK Push response:`, response.data);
      return {
        success: true,
        checkoutRequestId: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage
      };
    } catch (error) {
      console.error('[M-Pesa] Error initiating STK Push:', error.response?.data || error.message);
      console.error('[M-Pesa] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  async checkSTKPushStatus(checkoutRequestId) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await axios.post(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc
      };
    } catch (error) {
      console.error('Error checking STK Push status:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

module.exports = new MpesaService();
