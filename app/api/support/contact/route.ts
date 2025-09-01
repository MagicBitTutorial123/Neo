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

    // Prepare beautiful HTML email content
    const emailSubject = `New Contact Form Submission from ${email}`;
    
    // Generate unique Content ID for inline image
    let imageContentId = '';
    if (file) {
      imageContentId = `image_${Date.now()}`;
    }

    const htmlEmailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin: 20px;
        }
        .header {
            background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .info-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .info-row {
            display: flex;
            margin-bottom: 12px;
            align-items: flex-start;
        }
        .info-label {
            font-weight: 600;
            color: #4A90E2;
            min-width: 80px;
            margin-right: 15px;
        }
        .info-value {
            flex: 1;
            color: #333;
        }
        .message-section {
            background-color: #fff;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .message-title {
            font-weight: 600;
            color: #4A90E2;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .message-content {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #4A90E2;
            white-space: pre-wrap;
            font-family: inherit;
        }
        .attachment-section {
            background-color: #fff;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .attachment-title {
            font-weight: 600;
            color: #4A90E2;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .attachment-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 10px;
            display: block;
            border: 1px solid #e1e5e9;
        }
        .attachment-info {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 6px;
            font-size: 14px;
            color: #666;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e1e5e9;
        }
        .footer p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        .timestamp {
            color: #999;
            font-size: 12px;
            margin-top: 10px;
        }
        .user-agent {
            color: #999;
            font-size: 12px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>📧 New Contact Form Submission</h1>
            <p>You have received a new message from your website</p>
        </div>
        
        <div class="content">
            <div class="info-section">
                <div class="info-row">
                    <div class="info-label">From:</div>
                    <div class="info-value">${email}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Time:</div>
                    <div class="info-value">${new Date().toLocaleString()}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">IP:</div>
                    <div class="info-value">${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'}</div>
                </div>
            </div>

            <div class="message-section">
                <div class="message-title">💬 Message Content</div>
                <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
            </div>

            ${file ? `
            <div class="attachment-section">
                <div class="attachment-title">📎 Image Attachment</div>
                <img src="cid:${imageContentId}" alt="User uploaded image" class="attachment-image" />
                <div class="attachment-info">
                    <strong>File:</strong> ${file.name}<br>
                    <strong>Type:</strong> ${file.type}<br>
                    <strong>Size:</strong> ${(file.size / 1024).toFixed(1)} KB
                </div>
            </div>
            ` : `
            <div class="attachment-section">
                <div class="attachment-title">📎 Attachment</div>
                <div class="attachment-info">No attachment provided</div>
            </div>
            `}
        </div>

        <div class="footer">
            <p>This email was sent from your Neo website contact form</p>
            <div class="timestamp">Timestamp: ${new Date().toISOString()}</div>
            <div class="user-agent">User Agent: ${request.headers.get('user-agent')}</div>
        </div>
    </div>
</body>
</html>
    `;

    // Plain text version for email clients that don't support HTML
    const textEmailBody = `
New Contact Form Submission

From: ${email}
Time: ${new Date().toLocaleString()}
IP: ${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'}

Message:
${message}

${file ? `Attachment: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)` : 'No attachment'}

---
This email was sent from your Neo website contact form.
Timestamp: ${new Date().toISOString()}
User Agent: ${request.headers.get('user-agent')}
    `.trim();

    // Send email to Neo support team
    let supportEmailResult;
    try {
      const emailOptions: any = {
        from: smtpFrom,
        to: 'neo@magicbit.cc',
        subject: emailSubject,
        text: textEmailBody,
        html: htmlEmailBody
      };

      // Add inline attachment if file exists
      if (file) {
        emailOptions.attachments = [{
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type,
          cid: imageContentId // Content ID for inline images
        }];
      }

      supportEmailResult = await transporter.sendMail(emailOptions);
    } catch (fileError) {
      console.error('❌ Error sending email with attachment:', fileError);
      // Try sending without attachment as fallback
      supportEmailResult = await transporter.sendMail({
        from: smtpFrom,
        to: 'neo@magicbit.cc',
        subject: emailSubject + ' (No attachment - error occurred)',
        text: textEmailBody + '\n\nNote: File attachment failed to process.',
        html: htmlEmailBody.replace(/<img[^>]*>/g, '<p><em>Image attachment failed to process</em></p>')
      });
    }

    console.log('✅ Support email sent:', supportEmailResult.messageId);

    // Send confirmation email to user with beautiful format
    const confirmationSubject = 'Thank you for contacting Neo Support';
    const confirmationHtmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank you for contacting Neo Support</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin: 20px;
        }
        .header {
            background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .message-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .message-title {
            font-weight: 600;
            color: #4A90E2;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .message-content {
            background-color: #fff;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #4A90E2;
            white-space: pre-wrap;
            font-family: inherit;
        }
        .info-box {
            background-color: #e8f4fd;
            border: 1px solid #4A90E2;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .info-box h3 {
            color: #4A90E2;
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .info-box p {
            margin: 5px 0;
            color: #333;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e1e5e9;
        }
        .footer p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e1e5e9;
        }
        .contact-info p {
            margin: 5px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>✅ Message Received!</h1>
            <p>Thank you for contacting Neo Support</p>
        </div>
        
        <div class="content">
            <div class="info-box">
                <h3>📧 Your Message Has Been Received</h3>
                <p>We have successfully received your message and our support team will review it shortly.</p>
                <p><strong>Response Time:</strong> We typically respond within 24-48 hours.</p>
                <p><strong>Reference:</strong> ${Date.now()}</p>
            </div>

            <div class="message-section">
                <div class="message-title">📝 Your Original Message</div>
                <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
            </div>

                         ${file ? `
             <div class="message-section">
                 <div class="message-title">📎 Your Attachment</div>
                 <img src="cid:${imageContentId}" alt="Your uploaded image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); margin-bottom: 10px;" />
                 <div class="message-content">
                     <strong>File:</strong> ${file.name}<br>
                     <strong>Type:</strong> ${file.type}<br>
                     <strong>Size:</strong> ${(file.size / 1024).toFixed(1)} KB
                 </div>
             </div>
             ` : ''}
        </div>

        <div class="footer">
            <p>This is an automated confirmation email from Neo Support</p>
            <div class="contact-info">
                <p><strong>Need immediate help?</strong></p>
                <p>📧 Email: neo@magicbit.cc</p>
                <p>📞 Phone: +1 (555) 123-4567</p>
                <p>🌐 Website: <a href="https://neo.com" style="color: #4A90E2;">neo.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const confirmationTextBody = `
Thank you for contacting Neo Support!

Your message has been received and our support team will review it shortly.

Your message:
"${message}"
${file ? `\nAttachment: ${file.name} (${(file.size / 1024).toFixed(1)} KB)` : ''}

We typically respond within 24-48 hours.

Reference: ${Date.now()}

Need immediate help?
Email: neo@magicbit.cc
Phone: +1 (555) 123-4567
Website: neo.com

Best regards,
The Neo Support Team
    `.trim();

    let confirmationEmailResult;
    try {
      const confirmationEmailOptions: any = {
        from: smtpFrom,
        to: email,
        subject: confirmationSubject,
        text: confirmationTextBody,
        html: confirmationHtmlBody
      };

      // Add inline attachment to confirmation email if file exists
      if (file) {
        confirmationEmailOptions.attachments = [{
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type,
          cid: imageContentId // Content ID for inline images
        }];
      }

      confirmationEmailResult = await transporter.sendMail(confirmationEmailOptions);
    } catch (fileError) {
      console.error('❌ Error sending confirmation email:', fileError);
      // Try sending without HTML as fallback
      confirmationEmailResult = await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: confirmationSubject + ' (Plain text version)',
        text: confirmationTextBody
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
