import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    const file = formData.get('file') as File | null;

    // Validate file if present
    if (file && !file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    if (file && file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!email || !message) {
      return NextResponse.json(
        { message: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.trim().length < 5) {
      return NextResponse.json(
        { message: 'Message must be at least 5 characters long' },
        { status: 400 }
      );
    }

    // Check if SMTP environment variables are configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
      console.error('❌ SMTP environment variables not configured for Neo support');
      return NextResponse.json(
        { message: 'Email service not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: true, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Prepare email content
    const emailSubject = `Contact Support Request from ${email}`;
    const emailBody = `
New contact support request received:

From: ${email}
Message: ${message}
Timestamp: ${new Date().toISOString()}
User Agent: ${request.headers.get('user-agent')}
${file ? `Attachment: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)} KB) - Image attached below` : 'No attachment'}

---
This email was sent from your website's contact form.
    `.trim();

    // Send email to Neo support team
    let supportEmailResult;
    try {
      supportEmailResult = await transporter.sendMail({
        from: smtpFrom,
        to: 'neo@magicbit.cc',
        subject: emailSubject,
        text: emailBody,
        html: emailBody.replace(/\n/g, '<br>'),
        attachments: file ? [{
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type
        }] : undefined
      });
    } catch (fileError) {
      console.error('❌ Error sending email with attachment:', fileError);
      // Try sending without attachment as fallback
      supportEmailResult = await transporter.sendMail({
        from: smtpFrom,
        to: 'neo@magicbit.cc',
        subject: emailSubject + ' (No attachment - error occurred)',
        text: emailBody + '\n\nNote: File attachment failed to process.',
        html: emailBody.replace(/\n/g, '<br>') + '<br><br><em>Note: File attachment failed to process.</em>'
      });
    }

    console.log('✅ Support email sent:', supportEmailResult.messageId);

    // Send confirmation email to user
    const confirmationSubject = 'Your Neo support message has been received';
    const confirmationBody = `
Dear ${email},

Thank you for contacting Neo support. We have received your message and will get back to you soon.

Your message:
"${message}"
${file ? `\nImage attachment: ${file.name} (${(file.size / 1024).toFixed(1)} KB)` : ''}

We typically respond within 24-48 hours.

Best regards,
The Neo Support Team
neo@magicbit.cc
    `.trim();

    let confirmationEmailResult;
    try {
      confirmationEmailResult = await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: confirmationSubject,
        text: confirmationBody,
        html: confirmationBody.replace(/\n/g, '<br>'),
        attachments: file ? [{
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type
        }] : undefined
      });
    } catch (fileError) {
      console.error('❌ Error sending confirmation email with attachment:', fileError);
      // Try sending without attachment as fallback
      confirmationEmailResult = await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: confirmationSubject + ' (No attachment - error occurred)',
        text: confirmationBody + '\n\nNote: File attachment failed to process.',
        html: confirmationBody.replace(/\n/g, '<br>') + '<br><br><em>Note: File attachment failed to process.</em>'
      });
    }

    console.log('✅ Confirmation email sent:', confirmationEmailResult.messageId);

    // Log the contact request
    console.log('Neo Contact Support Request:', {
      email,
      message,
      hasFile: !!file,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      supportEmailId: supportEmailResult.messageId,
      confirmationEmailId: confirmationEmailResult.messageId,
    });

    return NextResponse.json(
      {
        message: 'Your message has been sent to Neo support successfully. You will receive a confirmation email shortly.',
        success: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Contact support error:', error);
    
    // Check if it's an SMTP error
    if (error instanceof Error && error.message.includes('SMTP')) {
      return NextResponse.json(
        { message: 'Failed to send email. Please try again later or contact us directly.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
