const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('MailService - EMAIL_USER:', process.env.EMAIL_USER);
console.log('MailService - EMAIL_PASS loaded:', process.env.EMAIL_PASS ? 'Yes' : 'No');

// Configure your email service here
// Using Ethereal Email for testing - no authentication issues!
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add additional options for better reliability
  tls: {
    rejectUnauthorized: false
  }
});

// Test the connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service connection failed:', error.message);
  } else {
    console.log('✅ Email service is ready to send messages');
  }
});

const sendApprovalEmail = async (mainAdminEmail, newAdminData, approvalLink, declineLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: mainAdminEmail,
    subject: 'New Admin Registration Request',
    html: `
      <h2>New Admin Registration Request</h2>
      <p>A new admin has registered and requires your approval.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li><strong>Full Name:</strong> ${newAdminData.fullName}</li>
        <li><strong>Email:</strong> ${newAdminData.email}</li>
        <li><strong>ID Number:</strong> ${newAdminData.idNumber}</li>
        <li><strong>Location:</strong> ${newAdminData.location}</li>
      </ul>
      <p><strong>Action Required:</strong></p>
      <p>
        <a href="${approvalLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Approve
        </a>
        &nbsp;&nbsp;
        <a href="${declineLink}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Decline
        </a>
      </p>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Approval email sent to', mainAdminEmail);
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};

const sendApprovalNotification = async (newAdminEmail, approved) => {
  const subject = approved ? 'Your Admin Account Approved' : 'Your Admin Account Declined';
  const message = approved
    ? 'Your admin account has been approved. You can now log in.'
    : 'Unfortunately, your admin account registration has been declined. Please contact the main admin for more details.';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: newAdminEmail,
    subject,
    html: `
      <h2>${subject}</h2>
      <p>${message}</p>
      ${approved ? '<p>You can now log in to the admin portal.</p>' : ''}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Notification email sent to', newAdminEmail);
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (adminEmail, resetToken, adminName) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${adminName},</p>
      <p>You requested to reset your admin account password. Click the link below to reset your password:</p>
      <p>
        <a href="${resetLink}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this token into the password reset form:</p>
      <p><code>${resetToken}</code></p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to', adminEmail);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

const sendBookingConfirmationEmail = async (customerEmail, bookingDetails) => {
  console.log('Attempting to send booking confirmation email to:', customerEmail);
  console.log('Booking details:', bookingDetails);

  const {
    bookingId,
    houseName,
    location,
    nights,
    amountPaid,
    customerName,
    customerPhone,
    paymentMethod,
    createdAt
  } = bookingDetails;

  // Validate required fields
  if (!customerEmail || !bookingId || !customerName) {
    console.error('Missing required fields for booking confirmation email');
    throw new Error('Missing required fields for email');
  }

  const mailOptions = {
    from: `"House Kenya" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Booking Confirmation - House Kenya (Booking #${bookingId})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2E8B57;">Booking Confirmation</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for your booking with House Kenya! Here are your booking details:</p>

        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; background-color: #f9f9f9;">
          <h3 style="margin-top: 0; color: #2E8B57;">Booking Receipt</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Booking ID:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>House:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${houseName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Location:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${location}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Nights:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${nights}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Amount Paid:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">KES ${amountPaid.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${customerPhone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Payment Method:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Booking Date:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${new Date(createdAt).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <p><strong>Important:</strong> Please keep this email as your booking confirmation and receipt. You can print this page for your records.</p>

        <p>If you have any questions or need to make changes to your booking, please contact us.</p>

        <p>Thank you for choosing House Kenya!</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          House Kenya<br>
          Email: support@housekenya.com<br>
          Phone: +254 700 000 000
        </p>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent successfully to', customerEmail, 'Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw error;
  }
};

module.exports = {
  sendApprovalEmail,
  sendApprovalNotification,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
};
