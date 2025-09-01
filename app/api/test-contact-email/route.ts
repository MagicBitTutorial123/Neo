import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    // Check if SMTP environment variables are configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
      return NextResponse.json(
        { error: 'SMTP environment variables not configured' },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Test email with inline image
    const testEmailSubject = 'Test: Contact Form Email with Inline Image';
    const imageContentId = `test_image_${Date.now()}`;
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

    const htmlEmailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Contact Form Email</title>
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
        .content {
            padding: 30px;
        }
        .test-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .test-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin: 10px 0;
            display: block;
            border: 1px solid #e1e5e9;
        }
        .success-message {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 15px;
            color: #155724;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>✅ Test Email Success!</h1>
        </div>
        
        <div class="content">
            <div class="success-message">
                <strong>🎉 Inline Image Test Successful!</strong><br>
                If you can see the image below, the inline image functionality is working correctly.
            </div>

            <div class="test-section">
                <h3>📸 Test Image (Should Display Inline)</h3>
                <img src="cid:${imageContentId}" alt="Test image" class="test-image" />
                <p><strong>Image Status:</strong> This image should be displayed inline within the email, not as an attachment.</p>
            </div>

            <div class="test-section">
                <h3>📋 Test Information</h3>
                <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Email Client:</strong> This test verifies inline image support</p>
                <p><strong>Content ID:</strong> ${imageContentId}</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const textEmailBody = `
Test Contact Form Email with Inline Image

✅ Inline Image Test Successful!

If you can see the image in the HTML version, the inline image functionality is working correctly.

Test Time: ${new Date().toLocaleString()}
Content ID: ${imageContentId}

This test verifies that images are displayed inline within emails instead of just showing as attachments.
    `.trim();

    // Send test email
    const testEmailResult = await transporter.sendMail({
      from: smtpFrom,
      to: 'neo@magicbit.cc',
      subject: testEmailSubject,
      text: textEmailBody,
      html: htmlEmailBody,
      attachments: [{
        filename: 'test-image.png',
        content: testImageBuffer,
        contentType: 'image/png',
        cid: imageContentId
      }]
    });

    console.log('✅ Test email sent successfully:', testEmailResult.messageId);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully with inline image',
      messageId: testEmailResult.messageId,
      contentId: imageContentId
    });

  } catch (error) {
    console.error('❌ Test email failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

