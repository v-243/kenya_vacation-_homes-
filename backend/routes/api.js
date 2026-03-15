const express = require('express');
// require the db helper which exports a `query` wrapper. Avoid calling getConnection at module load time.
const db = require('../db');
const mpesaService = require('../paymentService');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/multerConfig');
const crypto = require('crypto');
const Video = require('../models/Video');
const router = express.Router();
const { updateHouse, deleteHouse } = require('../houseController');

// GET /api/houses - Fetch all houses, with optional search and pagination
router.get('/houses', async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM houses';
    const params = [];
    if (search) {
      query += ' WHERE location ILIKE $1 OR name ILIKE $2';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);

// POST /api/houses - Create a new house (admin only)
router.post('/houses', adminAuth, (req, res, next) => {
  // Wrap multer.single() to handle errors
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Received POST /api/houses request');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    
    const { name, location, price, beds, baths, description } = req.body;

    // Validate required fields
    if (!name || !location || !price || !beds || !baths || !description) {
      console.error('Missing required fields:', { name, location, price, beds, baths, description });
      return res.status(400).json({ error: 'Missing required fields: ' + JSON.stringify({ name: !!name, location: !!location, price: !!price, beds: !!beds, baths: !!baths, description: !!description }) });
    }

    if (!req.file) {
      console.error('No image file uploaded');
      return res.status(400).json({ error: 'House image is required' });
    }

    // Generate image URL (relative path to the uploaded image)
    const imageUrl = `/uploads/${req.file.filename}`;

    // Insert house into database
    const insertQuery = `INSERT INTO houses (name, location, price, beds, baths, description, imageUrl)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;

    const [result] = await db.query(insertQuery, [
      name.trim(),
      location.trim(),
      parseFloat(price),
      parseInt(beds),
      parseInt(baths),
      description.trim(),
      imageUrl
    ]);

    // Fetch the newly created house
    const [houses] = await db.query('SELECT * FROM houses WHERE id = $1', [result[0].id]);
    res.status(201).json({
      message: 'House added successfully',
      house: newHouse
    });
  } catch (err) {
    console.error('Error creating house:', err.message, err.stack);
    // Clean up uploaded file if there's an error
    if (req.file) {
      const fs = require('fs');
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    }
    res.status(500).json({ error: 'Failed to add house. Please try again.' });
  }
});

// PUT /api/houses/:id - Update a house (admin only)
router.put('/houses/:id', adminAuth, updateHouse);

// DELETE /api/houses/:id - Delete a house (admin only)
router.delete('/houses/:id', adminAuth, deleteHouse);



// POST /api/bookings - Initiate booking with payment
router.post('/bookings', async (req, res) => {
  const { house_id, customer_name, customer_id_number, customer_phone, total_cost, email, payment_method, nights } = req.body;

  if (!house_id || !customer_name || !customer_id_number || !customer_phone || !total_cost || !payment_method) {
    return res.status(400).json({ error: 'Missing required booking information.' });
  }

  try {
    // Check if the house is already booked and not checked out
    const checkQuery = 'SELECT id FROM bookings WHERE house_id = $1 AND checked_out = 0';
    const [existingBookings] = await db.query(checkQuery, [house_id]);

    if (existingBookings.length > 0) {
      return res.status(409).json({ error: 'House is already booked. Cannot create a new booking until the current one is checked out.' });
    }

    // Fetch house details
    const [houses] = await db.query('SELECT id, name, location FROM houses WHERE id = $1', [house_id]);
    const house = houses && houses[0] ? houses[0] : { id: house_id, name: 'Unknown', location: '' };

    if (payment_method === 'M-Pesa') {
      // Validate M-Pesa phone number is provided
      if (!customer_phone) {
        return res.status(400).json({ error: 'Phone number is required for M-Pesa payment.' });
      }

      // Validate and format phone number for M-Pesa
      let formattedPhone = customer_phone.replace(/\s+/g, ''); // Remove spaces

      // Convert +254 to 254 format
      if (formattedPhone.startsWith('+254')) {
        formattedPhone = '254' + formattedPhone.substring(4);
      } else if (formattedPhone.startsWith('254')) {
        // Already in correct format
      } else if (formattedPhone.startsWith('0')) {
        // Convert 0712345678 to 254712345678
        formattedPhone = '254' + formattedPhone.substring(1);
      } else {
        return res.status(400).json({ error: 'Invalid phone number format. Please use format: +254XXXXXXXXX or 254XXXXXXXXX or 0XXXXXXXXX' });
      }

      // Validate the final format (should be 254 followed by 9 digits)
      if (!/^254\d{9}$/.test(formattedPhone)) {
        return res.status(400).json({ error: 'Invalid Kenyan phone number. Please check the number and try again.' });
      }

      // Initiate M-Pesa STK Push
      console.log(`Initiating M-Pesa STK Push for phone: ${formattedPhone}, amount: ${total_cost}`);
      const stkResult = await mpesaService.initiateSTKPush(
        formattedPhone,
        total_cost,
        `Booking-${house_id}-${Date.now()}`,
        `Payment for ${house.name} booking`
      );

      if (!stkResult.success) {
        console.error('M-Pesa STK Push failed:', stkResult.error);
        const errorMessage = stkResult.error?.message || stkResult.error?.errorMessage || JSON.stringify(stkResult.error) || 'Failed to initiate payment';
        return res.status(400).json({ error: `Payment initiation failed: ${errorMessage}. Please check your phone number and try again.` });
      }

      console.log(`M-Pesa STK Push initiated successfully. CheckoutRequestID: ${stkResult.checkoutRequestId}`);

      // Create pending booking record
      const insertQuery = `INSERT INTO bookings
        (house_id, customer_name, customer_id_number, customer_phone, total_cost, email, payment_method, nights, checked_out, payment_status, mpesa_checkout_request_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 'pending', $9) RETURNING id`;
      const [result] = await db.query(insertQuery, [
        house_id, customer_name, customer_id_number, customer_phone, total_cost, email || null, payment_method, nights || 1, stkResult.checkoutRequestId
      ]);

      const receipt = {
        bookingId: result[0].id,
        houseId: house_id,
        houseName: house.name,
        apartmentName: house.name,
        location: house.location,
        nights: nights || 1,
        total_cost: total_cost,
        amountPaid: total_cost,
        customerName: customer_name,
        customerIdNumber: customer_id_number,
        customerPhone: customer_phone,
        paymentMethod: payment_method,
        email: email || null,
        createdAt: new Date(),
        checkedOut: false,
        paymentStatus: 'pending'
      };

      // Set up a timeout to check payment status if callback isn't received
      setTimeout(async () => {
        try {
          const statusResult = await mpesaService.checkSTKPushStatus(stkResult.checkoutRequestId);
          if (statusResult.success && statusResult.resultCode === '0') {
            // Payment was successful but callback wasn't received
            const updateQuery = `
              UPDATE bookings
              SET payment_status = 'completed'
              WHERE mpesa_checkout_request_id = $1 AND payment_status = 'pending'
            `;
            await db.query(updateQuery, [stkResult.checkoutRequestId]);
            console.log(`Payment completed via status check for CheckoutRequestID: ${stkResult.checkoutRequestId}`);
          } else if (statusResult.success && statusResult.resultCode !== '0') {
            // Payment failed
            const updateQuery = `
              UPDATE bookings
              SET payment_status = 'failed'
              WHERE mpesa_checkout_request_id = $1 AND payment_status = 'pending'
            `;
            await db.query(updateQuery, [stkResult.checkoutRequestId]);
            console.log(`Payment failed via status check for CheckoutRequestID: ${stkResult.checkoutRequestId}`);
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 60000); // Check after 1 minute

      return res.status(200).json({
        message: 'Payment initiated. Please complete the payment on your phone.',
        bookingId: result.insertId,
        checkoutRequestId: stkResult.checkoutRequestId,
        customerMessage: stkResult.customerMessage,
        receipt,
        status: 'payment_pending'
      });
    } else if (payment_method === 'PayPal') {
      // TODO: Implement PayPal integration
      return res.status(400).json({ error: 'PayPal payment not yet implemented.' });
    } else {
      // For other payment methods (like Card), assume payment is completed
      const insertQuery = 'INSERT INTO bookings (house_id, customer_name, customer_id_number, customer_phone, total_cost, email, payment_method, nights, checked_out, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9) RETURNING id';
      const [result] = await db.query(insertQuery, [house_id, customer_name, customer_id_number, customer_phone, total_cost, email || null, payment_method, nights || 1, 'completed']);

      const receipt = {
        bookingId: result[0].id,
        houseId: house_id,
        houseName: house.name,
        apartmentName: house.name,
        location: house.location,
        nights: nights || 1,
        total_cost: total_cost,
        amountPaid: total_cost,
        customerName: customer_name,
        customerIdNumber: customer_id_number,
        customerPhone: customer_phone,
        paymentMethod: payment_method,
        email: email || null,
        createdAt: new Date(),
        checkedOut: false
      };

      // Send confirmation email if email is provided
      if (email) {
        try {
          const { sendBookingConfirmationEmail } = require('../services/mailService');
          await sendBookingConfirmationEmail(email, {
            bookingId: receipt.bookingId,
            houseName: receipt.houseName,
            location: receipt.location,
            nights: receipt.nights,
            amountPaid: receipt.amountPaid,
            customerName: receipt.customerName,
            customerPhone: receipt.customerPhone,
            paymentMethod: receipt.paymentMethod,
            createdAt: receipt.createdAt
          });
        } catch (mailErr) {
          console.error('Failed to send confirmation email:', mailErr);
        }
      }

      return res.status(201).json({
        message: `Booking created successfully! Your booking ID is ${receipt.bookingId}.`,
        bookingId: receipt.bookingId,
        receipt,
        status: 'completed'
      });
    }
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/bookings/:id/checkout - Checkout a booking (requires admin auth)
router.put('/bookings/:id/checkout', adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // First, verify the booking exists and get its details
    const [bookings] = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookings[0];
    
    // Update the booking to mark as checked out
    const updateQuery = 'UPDATE bookings SET checked_out = 1 WHERE id = $1';
    const [result] = await db.query(updateQuery, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Failed to checkout booking' });
    }

    res.json({ 
      message: 'Booking checked out successfully', 
      bookingId: id,
      houseId: booking.house_id,
      customerPhone: booking.customer_phone,
      checkedOut: true
    });
  } catch (err) {
    console.error('Error checking out booking:', err.message, err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// GET /api/bookings/:id/status - Check booking payment status (public endpoint)
router.get('/bookings/:id/status', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = rows[0];

    // If payment is completed, include the full receipt
    if (booking.payment_status === 'completed') {
      const [houses] = await db.query('SELECT id, name, location FROM houses WHERE id = $1', [booking.house_id]);
      const house = houses && houses[0] ? houses[0] : { id: booking.house_id, name: 'Unknown', location: '' };

      const receipt = {
        bookingId: booking.id,
        houseId: booking.house_id,
        houseName: house.name,
        apartmentName: house.name,
        location: house.location,
        nights: booking.nights || 1,
        amountPaid: booking.total_cost,
        customerName: booking.customer_name,
        customerIdNumber: booking.customer_id_number,
        customerPhone: booking.customer_phone,
        paymentMethod: booking.payment_method || 'Unknown',
        email: booking.email || null,
        checkedOut: !!booking.checked_out,
        createdAt: booking.created_at
      };

      res.json({
        bookingId: booking.id,
        paymentStatus: booking.payment_status,
        receiptNumber: booking.mpesa_receipt_number,
        receipt
      });
    } else {
      res.json({
        bookingId: booking.id,
        paymentStatus: booking.payment_status,
        receiptNumber: booking.mpesa_receipt_number
      });
    }
  } catch (err) {
    console.error('Error checking booking status:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/mpesa/callback', async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    // Extract relevant data from callback
    const { Body: { stkCallback: { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } } } = callbackData;

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata.Item;
      const receiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber')?.Value;

      // Update booking status to completed
      await db.query('UPDATE bookings SET payment_status = $1, mpesa_receipt_number = $2 WHERE mpesa_checkout_request_id = $3', ['completed', receiptNumber, CheckoutRequestID]);

      res.status(200).json({ success: true });
    } else {
      // Payment failed
      await db.query('UPDATE bookings SET payment_status = $1 WHERE mpesa_checkout_request_id = $2', ['failed', CheckoutRequestID]);
      res.status(200).json({ success: false, message: ResultDesc });
    }
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ===== ADMIN AUTHENTICATION ENDPOINTS =====

// POST /api/admin/register - Register a new admin
router.post('/admin/register', async (req, res) => {
  const { fullName, email, location, password, confirmPassword } = req.body;

  // Validation
  if (!fullName || !email || !location || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  try {
    // Check if email already exists
    const [existingByEmail] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (existingByEmail.length > 0) {
      return res.status(409).json({ error: 'Email address already registered' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a random id_number
    const id_number = crypto.randomBytes(8).toString('hex');

    // Insert new admin
    await db.query(
      'INSERT INTO admins (full_name, email, id_number, location, password) VALUES ($1, $2, $3, $4, $5)',
      [fullName, email, id_number, location, hashedPassword]
    );

    res.status(201).json({ message: 'Admin account created successfully. You can now log in.' });
  } catch (err) {
    console.error('Error registering admin:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/admin/login - Admin login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [admins] = await db.query('SELECT * FROM admins WHERE email = $1', [email]);

    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const admin = admins[0];
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        fullName: admin.full_name,
        email: admin.email,
        location: admin.location
      }
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/admin/forgot-password - Request password reset
router.post('/admin/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const [admins] = await db.query('SELECT id, email, full_name FROM admins WHERE email = $1', [email]);

    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = admins[0];

    // Check if admin has email
    if (!admin.email) {
      return res.status(400).json({ error: 'No email address on file. Please contact system administrator.' });
    }

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpire = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token in database
    await db.query(
      'UPDATE admins SET reset_token_hash = ?, reset_token_expire = ? WHERE id = ?',
      [resetTokenHash, resetTokenExpire, admin.id]
    );

    // Send password reset email
    try {
      const { sendPasswordResetEmail } = require('../services/mailService');
      await sendPasswordResetEmail(admin.email, resetToken, admin.full_name);
    } catch (emailErr) {
      console.error('Error sending email, but token was generated:', emailErr);
      // Continue anyway - token is still valid
    }

    res.json({
      message: 'Password reset instructions have been sent to your email address.',
      note: 'Check your email for the reset token and instructions.'
    });
  } catch (err) {
    console.error('Error processing forgot password:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/admin/reset-password - Reset password
router.post('/admin/reset-password', async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  if (!resetToken || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const crypto = require('crypto');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find admin with valid reset token
    const [admins] = await db.query(
      'SELECT id FROM admins WHERE reset_token_hash = $1 AND reset_token_expire > NOW()',
      [resetTokenHash]
    );

    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await db.query(
      'UPDATE admins SET password = $1, reset_token_hash = NULL, reset_token_expire = NULL WHERE id = $2',
      [hashedPassword, admins[0].id]
    );

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Admin endpoints: list bookings and get single booking (receipt)
// GET /api/bookings - list bookings (supports ?page=&limit=&house_id=)
router.get('/bookings', adminAuth, async (req, res) => {
  const { page = 1, limit = 20, house_id } = req.query;
  const offset = (page - 1) * limit;

  try {
    let baseQuery = `SELECT b.id as bookingId, b.house_id as houseId, b.customer_phone as customerPhone, b.total_cost as amountPaid, b.email, b.payment_method as paymentMethod, b.nights, b.checked_out, b.booking_date as bookingDate FROM bookings b`;
    const params = [];
    if (house_id) {
      baseQuery += ` WHERE b.house_id = ?`;
      params.push(house_id);
    }
    baseQuery += ` ORDER BY b.booking_date DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(baseQuery, params);

    // Attach house details for each booking
    const bookingPromises = rows.map(async (r) => {
      try {
        const [houses] = await db.query('SELECT id, name, location FROM houses WHERE id = ?', [r.houseId]);
        const house = houses && houses[0] ? houses[0] : { id: r.houseId, name: 'Unknown', location: '' };
        return {
          ...r,
          houseName: house.name,
          location: house.location
        };
      } catch (err) {
        console.error('Error fetching house for booking:', err);
        return {
          ...r,
          houseName: 'Unknown',
          location: 'Unknown'
        };
      }
    });

    const bookings = await Promise.all(bookingPromises);

    res.json({ bookings, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Error listing bookings:', err.message, err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// GET /api/bookings/:id - get booking receipt (with house details)
router.get('/bookings/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const b = rows[0];
    const [houses] = await db.query('SELECT id, name, location FROM houses WHERE id = ?', [b.house_id]);
    const house = houses && houses[0] ? houses[0] : { id: b.house_id, name: 'Unknown', location: '' };

    const receipt = {
      bookingId: b.id,
      houseId: b.house_id,
      houseName: house.name,
      apartmentName: house.name,
      location: house.location,
      nights: b.nights || 1,
      amountPaid: b.total_cost,
      customerName: b.customer_name,
      customerIdNumber: b.customer_id_number,
      customerPhone: b.customer_phone,
      paymentMethod: b.payment_method || 'Unknown',
      email: b.email || null,
      checkedOut: !!b.checked_out,
      createdAt: b.booking_date
    };

    res.json({ receipt });
  } catch (err) {
    console.error('Error fetching booking:', err.message, err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// ===== VIDEO ENDPOINTS =====

// POST /api/videos - Upload a video (admin only)
router.post('/videos', adminAuth, (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    const videoData = {
      filename: req.file.filename,
      original_name: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    const videoId = await Video.create(videoData);
    res.status(201).json({
      message: 'Video uploaded successfully',
      video: { id: videoId, ...videoData }
    });
  } catch (err) {
    console.error('Error uploading video:', err);
    // Clean up uploaded file if there's an error
    if (req.file) {
      const fs = require('fs');
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    }
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// GET /api/videos - Get all videos
router.get('/videos', async (req, res) => {
  try {
    const videos = await Video.findAll();
    const videoUrls = videos.map(video => `/uploads/${video.filename}`);
    res.json({ videos: videoUrls });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// DELETE /api/videos/:filename - Delete a video (admin only)
router.delete('/videos/:filename', adminAuth, async (req, res) => {
  const { filename } = req.params;
  try {
    const [videos] = await db.query('SELECT * FROM advertisement_videos WHERE filename = $1', [filename]);
    if (!videos || videos.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videos[0];
    const fs = require('fs');
    const path = require('path');

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../public/uploads', video.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await Video.deleteByFilename(filename);
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    console.error('Error deleting video:', err);
    res.status(500).json({ error: 'Failed to delete video' });
});

// ===== ANALYTICS ENDPOINTS =====

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/newsletter/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  try {
    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM newsletter_subscribers WHERE email = ? AND is_active = TRUE', [email]);

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already subscribed' });
    }

    // Add new subscriber
    await db.query('INSERT INTO newsletter_subscribers (email) VALUES (?)', [email]);

    res.status(201).json({ message: 'Successfully subscribed to newsletter' });
  } catch (err) {
    console.error('Error subscribing to newsletter:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/houses/:id/like - Like a house
router.post('/houses/:id/like', async (req, res) => {
  const { id } = req.params;
  const userIp = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  try {
    // Check if house exists
    const [houses] = await db.query('SELECT id FROM houses WHERE id = ?', [id]);
    if (houses.length === 0) {
      return res.status(404).json({ error: 'House not found' });
    }

    // Check if already liked by this IP
    const [existing] = await db.query('SELECT id FROM house_likes WHERE house_id = ? AND user_ip = ?', [id, userIp]);

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Already liked by this user' });
    }

    // Add like
    await db.query('INSERT INTO house_likes (house_id, user_ip, user_agent) VALUES (?, ?, ?)', [id, userIp, userAgent]);

    res.status(201).json({ message: 'House liked successfully' });
  } catch (err) {
    console.error('Error liking house:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/stats - Get analytics stats (admin only)
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    // Get newsletter subscriber count
    const [subscriberResult] = await db.query('SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = TRUE');
    const subscriberCount = subscriberResult[0].count;

    // Get total likes count
    const [likesResult] = await db.query('SELECT COUNT(*) as count FROM house_likes');
    const totalLikes = likesResult[0].count;

    // Get top 3 houses by likes
    const [topHouses] = await db.query(`
      SELECT h.id, h.name, h.location, COUNT(l.id) as like_count
      FROM houses h
      LEFT JOIN house_likes l ON h.id = l.house_id
      GROUP BY h.id, h.name, h.location
      ORDER BY like_count DESC
      LIMIT 3
    `);

    res.json({
      newsletterSubscribers: subscriberCount,
      totalLikes: totalLikes,
      topHouses: topHouses
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
