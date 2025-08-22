import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Environment Variables Test',
    sendgrid: {
      apiKeyExists: !!process.env.SENDGRID_API_KEY,
      apiKeyLength: process.env.SENDGRID_API_KEY?.length || 0,
      fromEmail: process.env.SENDGRID_FROM_EMAIL
    },
    twilio: {
      accountSidExists: !!process.env.TWILIO_ACCOUNT_SID,
      authTokenExists: !!process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    },
    nodeEnv: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('SENDGRID') || key.includes('TWILIO')
    )
  });
}

