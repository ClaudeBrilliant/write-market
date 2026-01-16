// Create this file: test-smtp.js (in your project root)
// Then run: node test-smtp.js

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🔍 Testing SMTP Connection...\n');
  
  // Show what's loaded from .env
  console.log('📋 Environment Variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ NOT SET');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ NOT SET');
  console.log('SMTP_USER:', process.env.SMTP_USER || '❌ NOT SET');
  console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✅ SET (length: ' + process.env.SMTP_PASSWORD.length + ')' : '❌ NOT SET');
  console.log('SMTP_FROM:', process.env.SMTP_FROM || '❌ NOT SET');
  console.log('\n');

  // Check for common issues
  if (!process.env.SMTP_HOST || process.env.SMTP_HOST === '127.0.0.1') {
    console.error('❌ ERROR: SMTP_HOST is not set or is localhost!');
    console.log('Fix: Set SMTP_HOST=smtp.gmail.com in your .env file\n');
    return;
  }

  if (!process.env.SMTP_USER) {
    console.error('❌ ERROR: SMTP_USER is not set!');
    console.log('Fix: Set SMTP_USER=youremail@gmail.com in your .env file\n');
    return;
  }

  if (!process.env.SMTP_PASSWORD) {
    console.error('❌ ERROR: SMTP_PASSWORD is not set!');
    console.log('Fix: Generate an App Password and set it in your .env file\n');
    return;
  }

  // Check password format
  if (process.env.SMTP_PASSWORD.includes(' ')) {
    console.warn('⚠️  WARNING: Password contains spaces! Remove all spaces.\n');
  }

  if (process.env.SMTP_PASSWORD.length !== 16) {
    console.warn('⚠️  WARNING: Gmail App Passwords are usually 16 characters.\n');
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    debug: true,
  });

  try {
    console.log('🔌 Attempting to connect to SMTP server...\n');
    
    // Verify connection
    await transporter.verify();
    console.log('\n✅ SMTP Connection Successful!\n');

    // Try sending a test email
    console.log('📧 Sending test email...\n');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email from WriteFlow - ' + new Date().toLocaleString(),
      html: `
        <h1>✅ Success!</h1>
        <p>Your SMTP configuration is working correctly!</p>
        <hr>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Host: ${process.env.SMTP_HOST}</li>
          <li>Port: ${process.env.SMTP_PORT}</li>
          <li>User: ${process.env.SMTP_USER}</li>
        </ul>
        <p><em>Sent at: ${new Date().toLocaleString()}</em></p>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\n📬 Check your inbox at:', process.env.SMTP_USER);
    console.log('\n🎉 All tests passed! Your email configuration is working.\n');
    
  } catch (error) {
    console.error('\n❌ SMTP Test Failed!\n');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('\n');

    // Provide specific help based on error
    if (error.code === 'ESOCKET' || error.code === 'ECONNREFUSED') {
      console.log('💡 Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify SMTP_HOST=smtp.gmail.com (not 127.0.0.1)');
      console.log('3. Check if port 587 is blocked by firewall');
      console.log('4. Try from a different network\n');
    } else if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.log('💡 Authentication failed. Solutions:');
      console.log('1. Generate a NEW Gmail App Password:');
      console.log('   https://myaccount.google.com/apppasswords');
      console.log('2. Make sure 2FA is enabled on your Google account');
      console.log('3. Remove ALL spaces from the password');
      console.log('4. Use your full email as SMTP_USER\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 Connection timeout. Solutions:');
      console.log('1. Check your firewall settings');
      console.log('2. Try port 465 with secure: true');
      console.log('3. Check if your ISP blocks SMTP ports\n');
    }

    console.log('Full error details:');
    console.error(error);
  }
}

// Run the test
testSMTP().catch(console.error);