# Contact Form Email Setup Guide

## ✅ Current Implementation (Recommended)

The contact form now uses a **beautiful HTML email system** with proper image handling and professional formatting. The system includes:

### Features:
- ✨ **Beautiful HTML email templates** with modern design
- 🖼️ **True inline image display** - images are embedded directly in emails using Content-ID (CID)
- 📧 **Professional formatting** with gradients, icons, and responsive design
- 🔄 **Automatic fallbacks** for email clients that don't support HTML
- 📱 **Mobile-responsive** email design
- ✅ **Confirmation emails** sent to users with inline images
- 🛡️ **Error handling** with graceful fallbacks
- 🧪 **Test endpoint** available to verify inline image functionality

### How it works:
1. User submits contact form with image attachment
2. **Support email** sent to `neo@magicbit.cc` with:
   - Beautiful HTML formatting
   - Inline image display (not just file names)
   - User information and message
   - Professional styling with Neo branding
3. **Confirmation email** sent to user with:
   - Thank you message
   - Copy of their original message
   - Contact information for immediate help

### Email Format Improvements:
- **Before**: Plain text with ugly formatting, images only showed as file names
- **After**: Beautiful HTML emails with:
  - Gradient headers with Neo branding
  - Organized sections with icons
  - **True inline image display** using Content-ID (CID) references
  - Professional styling and typography
  - Mobile-responsive design
  - Images embedded directly in email body (not as attachments)

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# SMTP Configuration
SMTP_HOST=your-smtp-host.com
SMTP_PORT=465
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

## Option 1: Gmail SMTP (Recommended for Quick Setup)

### Step 1: Enable Gmail App Passwords
1. Go to [Google Account settings](https://myaccount.google.com/)
2. Enable 2-factor authentication
3. Generate an app password for "Mail"
4. Use this password in `SMTP_PASS`

### Step 2: Configure Environment Variables
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-digit-app-password
SMTP_FROM=your-gmail@gmail.com
```

## Option 2: Resend (Professional Email Service)

### Step 1: Sign up for Resend
1. Go to [Resend.com](https://resend.com/)
2. Create an account
3. Verify your domain or use their sandbox

### Step 2: Install Resend
```bash
npm install resend
```

### Step 3: Update API Route
Replace the nodemailer implementation in `app/api/support/contact/route.ts` with Resend:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use resend.emails.send() instead of nodemailer
```

### Step 4: Add Environment Variable
```bash
RESEND_API_KEY=your_resend_api_key_here
```

## Option 3: EmailJS (Legacy - Not Recommended)

EmailJS has limitations with image attachments and email formatting. The current implementation is much better.

## Testing

### Method 1: Test Endpoint (Recommended)
1. Send a POST request to `/api/test-contact-email`
2. Check the test email sent to `neo@magicbit.cc`
3. Verify the image displays inline (not as an attachment)

### Method 2: Contact Form
1. Fill out the contact form with an image attachment
2. Click "Send"
3. Check both emails:
   - **Support email** to `neo@magicbit.cc` (should show beautiful HTML with inline image)
   - **Confirmation email** to user (should show thank you message with inline image)
4. Check browser console for any errors

### What to Look For:
- ✅ Images should display **inline** within the email body
- ✅ Images should **NOT** appear as separate attachments
- ✅ Beautiful HTML formatting with gradients and styling
- ✅ Professional layout with organized sections

## Email Preview

### Support Email (to neo@magicbit.cc):
- Beautiful HTML header with gradient
- User information section
- Message content in styled box
- **True inline image display** using Content-ID (CID)
- Professional footer with metadata
- Images embedded directly in email body

### Confirmation Email (to user):
- Thank you message with checkmark
- Copy of their original message with inline image
- Contact information for immediate help
- Professional Neo branding
- Images embedded directly in email body

## Troubleshooting

- **Email not received**: Check spam folder, verify SMTP settings
- **Images not displaying inline**: 
  - Ensure SMTP supports HTML emails
  - Check that Content-ID (CID) references are working
  - Verify email client supports inline images
- **Images showing as attachments**: This indicates the old format - the new system embeds images directly
- **Form submission error**: Check browser console and API logs
- **SMTP errors**: Verify credentials and port settings
- **Test inline images**: Use `/api/test-contact-email` endpoint to verify functionality

## Security Notes

- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Consider rate limiting for the contact form
- Validate and sanitize all input data
- Images are embedded using Content-ID (CID) for secure inline display
- No base64 encoding in email body (more secure and compatible)

## Migration from EmailJS

If you were previously using EmailJS:

1. Remove EmailJS dependencies:
   ```bash
   npm uninstall @emailjs/browser
   ```

2. Remove EmailJS environment variables:
   ```bash
   # Remove these from .env.local
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
   ```

3. The contact form now automatically uses the improved API route

## Performance Notes

- Images are embedded using Content-ID (CID) for optimal compatibility
- Email size may be larger due to embedded images
- Consider image compression for very large files
- Fallback to plain text for email clients that don't support HTML
- Content-ID method is more efficient than base64 encoding
