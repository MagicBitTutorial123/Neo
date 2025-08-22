import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Simple in-memory OTP storage (use Redis/database in production)
// Use a more persistent approach for development
let otpStorage: Map<string, { otp: string; expiresAt: number }>;

// Initialize OTP storage with better persistence
if (typeof global !== 'undefined') {
  if (!(global as any).otpStorage) {
    (global as any).otpStorage = new Map<string, { otp: string; expiresAt: number }>();
    console.log('🔧 Initialized new global OTP storage');
  } else {
    console.log('🔧 Using existing global OTP storage, size:', (global as any).otpStorage.size);
  }
  otpStorage = (global as any).otpStorage;
} else {
  otpStorage = new Map<string, { otp: string; expiresAt: number }>();
  console.log('🔧 Initialized local OTP storage (no global available)');
}

// Clean up expired OTPs every 5 minutes
if (typeof global !== 'undefined' && !(global as any).otpCleanupInterval) {
  (global as any).otpCleanupInterval = setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;
    for (const [key, value] of otpStorage.entries()) {
      if (value.expiresAt < now) {
        otpStorage.delete(key);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
    }
  }, 5 * 60 * 1000);
}

// File-based OTP storage functions for development
const OTP_STORAGE_FILE = path.join(process.cwd(), 'app', 'api', 'otp-storage.json');

async function saveOTPToFile(key: string, otpData: { otp: string; expiresAt: number }) {
  try {
    let storageData: { otps: Record<string, { otp: string; expiresAt: number }>; lastUpdated: string | null } = { 
      otps: {}, 
      lastUpdated: null 
    };
    
    try {
      const fileContent = await fs.readFile(OTP_STORAGE_FILE, 'utf-8');
      storageData = JSON.parse(fileContent);
    } catch (error) {
      console.log('📁 Creating new OTP storage file');
    }
    
    storageData.otps[key] = otpData;
    storageData.lastUpdated = new Date().toISOString();
    
    await fs.writeFile(OTP_STORAGE_FILE, JSON.stringify(storageData, null, 2));
    console.log('💾 OTP saved to file:', key);
  } catch (error) {
    console.error('❌ Error saving OTP to file:', error);
  }
}

async function getOTPFromFile(key: string) {
  try {
    const fileContent = await fs.readFile(OTP_STORAGE_FILE, 'utf-8');
    const storageData = JSON.parse(fileContent);
    return storageData.otps[key] || null;
  } catch (error) {
    console.log('📁 No OTP storage file found or error reading');
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json();

    if (!email || !phone) {
      return NextResponse.json(
        { error: 'Email and phone are required' },
        { status: 400 }
      );
    }

    // Debug: Log environment variables
    console.log('🔍 Environment Variables Debug:');
    console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
    console.log('SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY?.length || 0);
    console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL);
    console.log('TWILIO_ACCOUNT_SID exists:', !!process.env.TWILIO_ACCOUNT_SID);
    console.log('TWILIO_AUTH_TOKEN exists:', !!process.env.TWILIO_AUTH_TOKEN);
    console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    console.log('📱 Sending OTP to:', phone);
    console.log('📧 Sending OTP to email:', email);

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10-minute expiration
    const storageKey = `${email}:${phone}`;
    const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
    
    // Store in global memory
    otpStorage.set(storageKey, { otp, expiresAt });
    
    // Also store in file for persistence
    await saveOTPToFile(storageKey, { otp, expiresAt });
    
    console.log('🔐 Generated OTP:', otp, 'Expires at:', new Date(expiresAt).toLocaleString());
    console.log('🔍 OTP Storage Debug:');
    console.log('🔍 Storage key:', storageKey);
    console.log('🔍 Storage size after adding:', otpStorage.size);
    console.log('🔍 All storage keys:', Array.from(otpStorage.keys()));
    console.log('💾 OTP also saved to file for persistence');

    // Send OTP via email using SendGrid
    if (process.env.SENDGRID_API_KEY) {
      try {
        console.log('📧 Attempting to send email via SendGrid...');
        console.log('📧 From email:', process.env.SENDGRID_FROM_EMAIL);
        console.log('📧 To email:', email);
        console.log('📧 API Key length:', process.env.SENDGRID_API_KEY.length);
        
        const emailMsg = {
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@buddyneo.com',
          subject: 'Your BuddyNeo Verification Code',
          text: `Your BuddyNeo verification code is: ${otp}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #F28B20; text-align: center;">BuddyNeo</h1>
              <h2 style="color: #222E3A;">Your Verification Code</h2>
              <p>Hello!</p>
              <p>Your verification code for BuddyNeo is:</p>
              <div style="background: #F8F9FC; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
                <h1 style="color: #F28B20; font-size: 48px; margin: 0; letter-spacing: 5px;">${otp}</h1>
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
              <p>Best regards,<br>The BuddyNeo Team</p>
            </div>
          `
        };

        console.log('📧 Email message prepared, sending via SendGrid...');
        console.log('📧 Email details:', {
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL,
          subject: 'Your BuddyNeo Verification Code'
        });
        const emailResponse = await sgMail.send(emailMsg);
        console.log('✅ Email OTP sent successfully via SendGrid:', emailResponse);
        console.log('📧 Message ID:', emailResponse?.[0]?.headers?.['x-message-id']);
        console.log('📧 Check your email for OTP:', otp);
      } catch (emailError: any) {
        console.error('❌ Failed to send email OTP:', emailError);
        console.error('❌ Error details:', {
          message: emailError.message,
          code: emailError.code,
          response: emailError.response?.body
        });
      }
    } else {
      console.log('⚠️ SendGrid API key not configured - skipping email');
    }

    // Send OTP via WhatsApp using Twilio
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        console.log('📱 Attempting to send WhatsApp via Twilio...');
        console.log('📱 From number:', process.env.TWILIO_PHONE_NUMBER);
        console.log('📱 To number:', phone);
        console.log('📱 Twilio client initialized:', !!twilioClient);
        
        // Ensure phone number is in correct format for WhatsApp
        const whatsappPhone = phone.startsWith('+') ? phone : `+${phone}`;
        console.log('📱 Formatted WhatsApp number:', whatsappPhone);
        
        const whatsappMessage = await twilioClient.messages.create({
          body: `🔐 Your BuddyNeo verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `whatsapp:${whatsappPhone}`
        });

        console.log('✅ WhatsApp OTP sent successfully via Twilio:', whatsappMessage.sid);
        console.log('✅ Message status:', whatsappMessage.status);
        console.log('📱 WhatsApp message body:', `🔐 Your BuddyNeo verification code is: ${otp}\n\nThis code will expire in 10 minutes.`);
        console.log('📱 Check WhatsApp for OTP:', otp);
      } catch (whatsappError: any) {
        console.error('❌ Failed to send WhatsApp OTP:', whatsappError);
        console.error('❌ Error details:', {
          message: whatsappError.message,
          code: whatsappError.code,
          status: whatsappError.status
        });
      }
    } else {
      console.log('⚠️ Twilio credentials not configured - skipping WhatsApp');
    }

    // For development/testing, also return the OTP
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Only show in development
      sentTo: {
        email,
        phone
      },
      services: {
        email: !!process.env.SENDGRID_API_KEY,
        whatsapp: !!twilioClient
      },
      expiresAt: new Date(expiresAt).toISOString()
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
