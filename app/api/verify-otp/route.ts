import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Import the OTP storage from send-otp route
// Note: In production, use a shared database or Redis instance
declare global {
  var otpStorage: Map<string, { otp: string; expiresAt: number }> | undefined;
}

// Access the global OTP storage with better error handling
const otpStorage = (global as any)?.otpStorage || new Map();

// File-based OTP storage functions for development
const OTP_STORAGE_FILE = path.join(process.cwd(), 'app', 'api', 'otp-storage.json');

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
    const { email, phone, otp } = await request.json();

    if (!email || !phone || !otp) {
      return NextResponse.json(
        { error: 'Email, phone, and OTP are required' },
        { status: 400 }
      );
    }

    console.log('🔐 Verifying OTP:', { email, phone, otp });
    console.log('🔍 OTP Storage Debug:');
    console.log('🔍 Storage size:', otpStorage.size);
    console.log('🔍 All storage keys:', Array.from(otpStorage.keys()));

    // Check OTP format
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format. Please enter a 6-digit number.' },
        { status: 400 }
      );
    }

    // Look up stored OTP
    const storageKey = `${email}:${phone}`;
    console.log('🔍 Looking for storage key:', storageKey);
    
    // First try global storage
    let storedOTPData = otpStorage.get(storageKey);
    console.log('🔍 Found in global storage:', storedOTPData);
    
    // If not found in global storage, try file storage
    if (!storedOTPData) {
      console.log('🔍 Checking file storage...');
      storedOTPData = await getOTPFromFile(storageKey);
      console.log('🔍 Found in file storage:', storedOTPData);
      
      // If found in file, also restore to global storage
      if (storedOTPData) {
        otpStorage.set(storageKey, storedOTPData);
        console.log('🔧 Restored OTP to global storage from file');
      }
    }

    if (!storedOTPData) {
      console.log('❌ OTP not found in any storage');
      console.log('🔍 Available global keys:', Array.from(otpStorage.keys()));
      return NextResponse.json(
        { error: 'OTP not found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (Date.now() > storedOTPData.expiresAt) {
      otpStorage.delete(storageKey);
      
      // Also remove from file storage
      try {
        const fileContent = await fs.readFile(OTP_STORAGE_FILE, 'utf-8');
        const storageData = JSON.parse(fileContent);
        delete storageData.otps[storageKey];
        storageData.lastUpdated = new Date().toISOString();
        await fs.writeFile(OTP_STORAGE_FILE, JSON.stringify(storageData, null, 2));
        console.log('🗑️ Expired OTP removed from file storage');
      } catch (error) {
        console.log('⚠️ Could not remove expired OTP from file storage:', error);
      }
      
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedOTPData.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    // OTP is valid - remove it from both storages
    otpStorage.delete(storageKey);
    
    // Also remove from file storage
    try {
      const fileContent = await fs.readFile(OTP_STORAGE_FILE, 'utf-8');
      const storageData = JSON.parse(fileContent);
      delete storageData.otps[storageKey];
      storageData.lastUpdated = new Date().toISOString();
      await fs.writeFile(OTP_STORAGE_FILE, JSON.stringify(storageData, null, 2));
      console.log('🗑️ OTP removed from file storage');
    } catch (error) {
      console.log('⚠️ Could not remove OTP from file storage:', error);
    }

    console.log('✅ OTP verified successfully for:', email);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
