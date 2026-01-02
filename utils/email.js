/**
 * Email utility using nodemailer
 * Sends emails for lead notifications and thank you messages
 */

import nodemailer from 'nodemailer';

// Create reusable transporter
let transporter = null;

/**
 * Initialize email transporter
 * Uses Gmail SMTP by default
 */
function createTransporter() {
  if (transporter) {
    return transporter;
  }

  // Email configuration from environment variables
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD
    }
  };

  // Validate email configuration
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    console.warn('⚠️ Email configuration missing. Email functionality will be disabled.');
    console.warn('Please set SMTP_USER and SMTP_PASS (or EMAIL_USER and EMAIL_APP_PASSWORD) environment variables.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth,
    tls: {
      rejectUnauthorized: false // For development, set to true in production with valid cert
    }
  });

  return transporter;
}

/**
 * Send email notification to admin when a new lead is created
 * @param {Object} leadData - Lead information
 * @returns {Promise<Object>} Email send result
 */
export async function sendLeadNotificationEmail(leadData) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn('Email transporter not configured. Skipping email notification.');
      return { success: false, message: 'Email not configured' };
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'sayedmdsafiuddin@gmail.com';
    
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🎯 New Lead: ${leadData.name} contacted you`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .label { font-weight: bold; color: #667eea; margin-right: 10px; }
            .message-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border: 1px solid #e0e0e0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 New Lead Received!</h1>
              <p>Someone contacted you through your portfolio</p>
            </div>
            <div class="content">
              <div class="info-box">
                <p><span class="label">👤 Name:</span> ${leadData.name}</p>
                <p><span class="label">📧 Email:</span> <a href="mailto:${leadData.email}">${leadData.email}</a></p>
                <p><span class="label">🌍 Country:</span> ${leadData.country || 'Unknown'}</p>
                <p><span class="label">📍 Page:</span> ${leadData.page || 'contact'}</p>
                <p><span class="label">🕐 Time:</span> ${new Date(leadData.createdAt || new Date()).toLocaleString()}</p>
              </div>
              
              <div class="message-box">
                <h3 style="margin-top: 0; color: #667eea;">Message:</h3>
                <p style="white-space: pre-wrap;">${leadData.message}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.ADMIN_DASHBOARD_URL || 'https://admin.sayedsafi.me'}/dashboard/leads" class="button">View in Dashboard</a>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated notification from your portfolio contact form.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Lead Received!

Name: ${leadData.name}
Email: ${leadData.email}
Country: ${leadData.country || 'Unknown'}
Page: ${leadData.page || 'contact'}
Time: ${new Date(leadData.createdAt || new Date()).toLocaleString()}

Message:
${leadData.message}

View in Dashboard: ${process.env.ADMIN_DASHBOARD_URL || 'https://admin.sayedsafi.me'}/dashboard/leads
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Lead notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending lead notification email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send thank you email to the person who submitted the contact form
 * @param {Object} leadData - Lead information
 * @returns {Promise<Object>} Email send result
 */
export async function sendThankYouEmail(leadData) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn('Email transporter not configured. Skipping thank you email.');
      return { success: false, message: 'Email not configured' };
    }

    const mailOptions = {
      from: `"Sayed Safi" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: leadData.email,
      subject: 'Thank you for contacting me! 🙏',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .message { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .social-links { text-align: center; margin: 20px 0; }
            .social-links a { display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You, ${leadData.name}! 🙏</h1>
            </div>
            <div class="content">
              <div class="message">
                <p>Hi ${leadData.name},</p>
                <p>Thank you for reaching out to me through my portfolio! I really appreciate you taking the time to contact me.</p>
                <p>I've received your message and will get back to you as soon as possible. I typically respond within 24-48 hours.</p>
                <p>In the meantime, feel free to check out my work and connect with me on social media:</p>
              </div>
              
              <div class="social-links">
                <p>
                  <a href="https://github.com/sayedsafi">GitHub</a> | 
                  <a href="https://linkedin.com/in/sayedsafi">LinkedIn</a> | 
                  <a href="https://sayedsafi.me">Portfolio</a>
                </p>
              </div>
              
              <p style="text-align: center; color: #666; font-style: italic;">
                Looking forward to working with you!<br>
                <strong>Sayed Safi</strong><br>
                Full-Stack Developer
              </p>
            </div>
            <div class="footer">
              <p>This is an automated response. Your message has been received and will be reviewed soon.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Thank You, ${leadData.name}!

Hi ${leadData.name},

Thank you for reaching out to me through my portfolio! I really appreciate you taking the time to contact me.

I've received your message and will get back to you as soon as possible. I typically respond within 24-48 hours.

In the meantime, feel free to check out my work:
- GitHub: https://github.com/sayedsafi
- LinkedIn: https://linkedin.com/in/sayedsafi
- Portfolio: https://sayedsafi.me

Looking forward to working with you!

Sayed Safi
Full-Stack Developer

---
This is an automated response. Your message has been received and will be reviewed soon.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Thank you email sent to:', leadData.email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending thank you email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test email configuration
 * @returns {Promise<Object>} Test result
 */
export async function testEmailConfig() {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, message: 'Email not configured' };
    }

    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return { success: false, error: error.message };
  }
}

