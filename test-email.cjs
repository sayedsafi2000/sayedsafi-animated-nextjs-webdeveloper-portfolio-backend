require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: { rejectUnauthorized: false }
});

console.log('Testing SMTP connection...');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);

transporter.verify()
  .then(result => {
    console.log('\n✅ SMTP Connection:', result ? 'SUCCESS' : 'FAILED');
    
    // Try sending a test email
    console.log('\nSending test email...');
    return transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'Portfolio Email Test',
      text: 'This is a test email from your portfolio backend.'
    });
  })
  .then(info => {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });
