# 📧 Email Setup Guide

This guide explains how to set up email functionality for lead notifications and thank you emails.

## Prerequisites

1. **Install nodemailer** (if not already installed):
   ```bash
   cd backend
   npm install nodemailer
   ```

2. **Gmail App Password Setup** (for Gmail):
   - Go to your Google Account settings
   - Enable 2-Step Verification
   - Go to App Passwords: https://myaccount.google.com/apppasswords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

## Environment Variables

Add the following variables to your `.env` file in the `backend` directory:

```env
# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=sayedmdsafiuddin@gmail.com
SMTP_PASS=jngh hvnm bwfu wupz


# Or use these alternative variable names:
# EMAIL_USER=sayedmdsafiuddin@gmail.com
# EMAIL_APP_PASSWORD=your_app_password_here

# Admin Email (where notifications will be sent)
ADMIN_EMAIL=sayedmdsafiuddin@gmail.com

# Admin Dashboard URL (for email links)
ADMIN_DASHBOARD_URL=https://admin.sayedsafi.me
```

## How It Works

### When a Lead is Created:

1. **Lead is saved to database** ✅
2. **Notification email sent to admin** (sayedmdsafiuddin@gmail.com) with:
   - Lead's name, email, message
   - Country information
   - Page where form was submitted
   - Link to view in dashboard

3. **Thank you email sent to sender** with:
   - Personalized thank you message
   - Social media links
   - Confirmation that message was received

### Email Features:

- ✅ HTML formatted emails with beautiful styling
- ✅ Plain text fallback
- ✅ Automatic error handling (won't break if email fails)
- ✅ Works for both contact page and CTA submissions
- ✅ All messages count as leads in dashboard

## Testing

To test email configuration, you can create a test route or use the test function:

```javascript
import { testEmailConfig } from './utils/email.js';

// Test email configuration
const result = await testEmailConfig();
console.log(result);
```

## Troubleshooting

### Email not sending?

1. **Check environment variables** are set correctly
2. **Verify Gmail App Password** is correct (16 characters, no spaces)
3. **Check SMTP settings**:
   - Host: `smtp.gmail.com`
   - Port: `587` (for TLS) or `465` (for SSL)
   - Secure: `false` for port 587, `true` for port 465
4. **Check server logs** for error messages
5. **Verify 2-Step Verification** is enabled on Gmail account

### Common Errors:

- **"Invalid login"**: App password is incorrect
- **"Connection timeout"**: Check firewall/network settings
- **"Authentication failed"**: Enable "Less secure app access" or use App Password

## Alternative Email Providers

You can use other SMTP providers by changing the environment variables:

### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

### Custom SMTP:
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

## Security Notes

- ⚠️ Never commit `.env` file to git
- ⚠️ Use App Passwords, not your main Gmail password
- ⚠️ Keep your app password secure
- ✅ Emails are sent asynchronously (won't block API response)
- ✅ Email failures won't prevent lead creation

