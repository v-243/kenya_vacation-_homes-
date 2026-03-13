const nodemailer = require('nodemailer');

// Generate test SMTP service account from ethereal.email
// Only needed if you can't get Gmail App Password working
async function generateTestEmail() {
  try {
    console.log('🔄 Generating test email account from Ethereal...');

    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    console.log('✅ Test email account created!');
    console.log('📧 Email:', testAccount.user);
    console.log('🔑 Password:', testAccount.pass);
    console.log('🌐 Web interface:', nodemailer.getTestMessageUrl(testAccount));

    // Update .env file with the test credentials
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env');

    let envContent = fs.readFileSync(envPath, 'utf8');

    // Replace the EMAIL_USER and EMAIL_PASS with test credentials
    envContent = envContent.replace(
      /EMAIL_USER=.*/,
      `EMAIL_USER=${testAccount.user}`
    );
    envContent = envContent.replace(
      /EMAIL_PASS=.*/,
      `EMAIL_PASS=${testAccount.pass}`
    );

    fs.writeFileSync(envPath, envContent);

    console.log('✅ .env file updated with test credentials!');
    console.log('🧪 You can now test emails. They will appear in the Ethereal web interface above.');
    console.log('📝 Note: These are temporary test credentials. For production, use Gmail with App Password.');

  } catch (error) {
    console.error('❌ Error generating test email:', error.message);
  }
}

generateTestEmail();