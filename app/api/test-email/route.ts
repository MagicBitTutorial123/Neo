import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function GET() {
  try {
    const testEmail = 'dtheekshana@gmail.com';
    const testOTP = '123456';
    
    console.log('🧪 Testing email sending...');
    console.log('📧 To:', testEmail);
    console.log('📧 From:', process.env.SENDGRID_FROM_EMAIL);
    console.log('📧 API Key exists:', !!process.env.SENDGRID_API_KEY);
    
    const emailMsg = {
      to: testEmail,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@buddyneo.com',
      subject: 'TEST: BuddyNeo Email OTP',
      text: `TEST: Your BuddyNeo verification code is: ${testOTP}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F28B20; text-align: center;">TEST: BuddyNeo</h1>
          <h2 style="color: #222E3A;">Test Email OTP</h2>
          <p>This is a test email to verify OTP delivery.</p>
          <div style="background: #F8F9FC; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h1 style="color: #F28B20; font-size: 48px; margin: 0; letter-spacing: 5px;">${testOTP}</h1>
          </div>
          <p>If you receive this, email OTP is working!</p>
        </div>
      `
    };

    console.log('📧 Sending test email...');
    const response = await sgMail.send(emailMsg);
    
    console.log('✅ Test email sent successfully:', response);
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent',
      response: response,
      otp: testOTP
    });
    
  } catch (error: any) {
    console.error('❌ Test email failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.body
    }, { status: 500 });
  }
}
