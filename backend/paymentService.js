const axios = require('axios');

const getRequiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

class MpesaService {
  constructor() {
    this.consumerKey = getRequiredEnv('MPESA_CONSUMER_KEY');
    this.consumerSecret = getRequiredEnv('MPESA_CONSUMER_SECRET');
    this.shortcode = getRequiredEnv('MPESA_SHORTCODE');
    this.passkey = getRequiredEnv('MPESA_PASSKEY');
    this.callbackUrl = getRequiredEnv('MPESA_CALLBACK_URL');
    this.baseUrl =
      process.env.MPESA_ENV === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
  }

  async getAccessToken() {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

    try {
      console.log(`[M-Pesa] Requesting access token from ${this.baseUrl}/oauth/v1/generate`);
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      console.log('[M-Pesa] Access token received successfully');
      return response.data.access_token;
    } catch (error) {
      console.error('[M-Pesa] Error getting access token:', error.response?.data || error.message);
      console.error('[M-Pesa] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw new Error(
        `Failed to get M-Pesa access token: ${error.response?.data?.error_description || error.message}`
      );
    }
  }

  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc = 'House Booking Payment') {
    try {
      console.log(`[M-Pesa] Initiating STK Push: phone=${phoneNumber}, amount=${amount}`);
      const accessToken = await this.getAccessToken();
      console.log('[M-Pesa] Access token obtained successfully');

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
        TransactionDesc: transactionDesc,
      };

      console.log(`[M-Pesa] Sending STK Push request to ${this.baseUrl}/mpesa/stkpush/v1/processrequest`);
      console.log(`[M-Pesa] Callback URL: ${this.callbackUrl}`);
      console.log('[M-Pesa] Payload:', payload);
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[M-Pesa] STK Push response:', response.data);
      return {
        success: true,
        checkoutRequestId: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage,
      };
    } catch (error) {
      console.error('[M-Pesa] Error initiating STK Push:', error.response?.data || error.message);
      console.error('[M-Pesa] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      return {
        success: false,
        error: error.response?.data || { message: error.message },
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
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await axios.post(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
      };
    } catch (error) {
      console.error('Error checking STK Push status:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }
}

module.exports = new MpesaService();
