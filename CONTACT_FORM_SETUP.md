# Contact Form Email Setup Guide

## Option 1: EmailJS (Recommended for Quick Setup)

### Step 1: Sign up for EmailJS
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Create a free account
3. Verify your email

### Step 2: Create Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note down your **Service ID**

### Step 3: Create Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template:

```html
Subject: New Contact Form Submission from {{from_name}}

Hello {{to_name}},

You have received a new contact form submission:

**Name:** {{from_name}}
**Email:** {{from_email}}
**Subject:** {{subject}}
**Message:** {{message}}
**Attachment:** {{attachment_info}}

Best regards,
{{from_name}}
```

4. Note down your **Template ID**

### Step 4: Get Public Key
1. Go to "Account" → "API Keys"
2. Copy your **Public Key**

### Step 5: Update Contact Form
Replace the placeholders in `app/contact/page.tsx`:

```typescript
emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual public key

const result = await emailjs.send(
  'YOUR_SERVICE_ID', // Replace with your service ID
  'YOUR_TEMPLATE_ID', // Replace with your template ID
  templateParams
);
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

### Step 3: Create API Route
Update `app/api/send-email/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    const { data, error } = await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: ['support@yourdomain.com'],
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
```

### Step 4: Add Environment Variable
Create `.env.local`:
```
RESEND_API_KEY=your_resend_api_key_here
```

## Option 3: Gmail SMTP (Free but Limited)

### Step 1: Enable Gmail App Passwords
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate an app password for "Mail"

### Step 2: Install Nodemailer
```bash
npm install nodemailer
npm install @types/nodemailer --save-dev
```

### Step 3: Update API Route
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

// Use in your POST function
await transporter.sendMail({
  from: 'your-email@gmail.com',
  to: 'support@yourdomain.com',
  subject: `Contact Form: ${subject}`,
  html: `...`
});
```

## Testing

1. Fill out the contact form
2. Click "Send"
3. Check your email (both sender and recipient)
4. Check browser console for any errors

## Troubleshooting

- **Email not received**: Check spam folder, verify email service setup
- **Form submission error**: Check browser console and API logs
- **Attachment issues**: EmailJS has limited attachment support; consider using Resend for full attachment support

## Security Notes

- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Consider rate limiting for the contact form
- Validate and sanitize all input data
