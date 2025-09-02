// Check environment variables for the application
console.log('🔍 Checking environment variables...\n');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_BASE_URL'
];

const optionalVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID'
];

const recommendedVars = [
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`⚠️  ${varName}: Not set (optional)`);
  }
});

console.log('\n📋 Recommended Variables:');
recommendedVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`🔴 ${varName}: Not set (recommended for OAuth)`);
  }
});

console.log('\n🔧 OAuth Configuration:');
console.log('Make sure your Supabase project has Google OAuth provider configured');
console.log('Callback URL should be: http://localhost:3000/auth/callback (for development)');
console.log('Production callback URL should be: https://yourdomain.com/auth/callback');

console.log('\n📊 Database Check:');
console.log('Ensure the user_profiles table exists with proper RLS policies');
console.log('The handle_new_user trigger should be active for automatic profile creation');
