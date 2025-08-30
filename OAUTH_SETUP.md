# Google OAuth Setup and Fixes

## Issues Fixed

### 1. Profile Creation Failure
- **Problem**: Google OAuth users were not getting profiles created automatically
- **Solution**: Added proper profile creation logic in OAuth callback and auth guards
- **Files Modified**: 
  - `app/auth/callback/route.ts` - New OAuth callback route
  - `components/BasicAuthGuard.tsx` - Enhanced profile creation
  - `lib/oauthProfileHelper.ts` - New utility for OAuth profile management

### 2. Redirect Loop Issues
- **Problem**: Users were being redirected to localhost:3000 instead of proper home page
- **Solution**: Created proper OAuth callback route that handles redirects correctly
- **Files Modified**:
  - `app/page.tsx` - Updated Google OAuth redirectTo URL
  - `app/Land/page.tsx` - Updated Google OAuth redirectTo URL
  - `app/home/page.tsx` - Added OAuth success handling

### 3. Missing OAuth Callback Handler
- **Problem**: No route to handle OAuth callbacks from Google
- **Solution**: Created `/auth/callback` route with proper session handling
- **Files Modified**:
  - `app/auth/callback/route.ts` - New callback route

## Setup Instructions

### 1. Supabase Configuration
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials (Client ID and Secret)
5. Set callback URL to: `http://localhost:3000/auth/callback` (development)
6. For production: `https://yourdomain.com/auth/callback`

### 2. Environment Variables
Ensure these are set in your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
```

### 3. Database Setup
Run the SQL from `create-user-profiles.sql` to ensure:
- `user_profiles` table exists
- Proper RLS policies are in place
- `handle_new_user` trigger is active

## How It Works Now

### 1. OAuth Flow
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. After authentication, Google redirects to `/auth/callback`
4. Callback route exchanges code for session
5. Profile is created/verified automatically
6. User is redirected to `/home?oauth=success`
7. Home page cleans up URL and shows dashboard

### 2. Profile Creation
- **Automatic**: Database trigger creates profile on user signup
- **Fallback**: OAuth callback ensures profile exists
- **Guard**: BasicAuthGuard checks and creates profiles if missing

### 3. Error Handling
- OAuth errors are captured and displayed
- Profile creation failures are logged but don't block login
- Fallback mechanisms ensure users can still access the app

## Testing

### 1. Test OAuth Flow
1. Start your development server: `npm run dev`
2. Go to `/` or `/Land`
3. Click "Sign in with Google"
4. Complete Google authentication
5. Should redirect to `/home` with profile created

### 2. Check Profile Creation
1. After OAuth login, check browser console for logs
2. Verify profile exists in Supabase `user_profiles` table
3. Check that user data is properly populated

### 3. Debug Issues
1. Check browser console for error messages
2. Verify Supabase OAuth provider is configured
3. Ensure callback URL matches exactly
4. Check database trigger is active

## Common Issues

### 1. "Invalid redirect_uri" Error
- Ensure callback URL in Supabase matches exactly
- Check for trailing slashes or protocol mismatches

### 2. Profile Not Created
- Verify database trigger is active
- Check RLS policies allow profile creation
- Ensure user has proper permissions

### 3. Redirect Loop
- Check OAuth callback route is working
- Verify session is being created properly
- Ensure no conflicting redirect logic

## Files Added/Modified

### New Files
- `app/auth/callback/route.ts` - OAuth callback handler
- `lib/oauthProfileHelper.ts` - OAuth profile utilities
- `OAUTH_SETUP.md` - This documentation

### Modified Files
- `components/BasicAuthGuard.tsx` - Enhanced OAuth support
- `app/page.tsx` - Updated OAuth redirect
- `app/Land/page.tsx` - Updated OAuth redirect
- `app/home/page.tsx` - Added OAuth success handling
- `check-env.js` - Updated environment checks

## Next Steps

1. Test the OAuth flow thoroughly
2. Monitor profile creation in production
3. Add additional OAuth providers if needed
4. Implement profile completion flows for OAuth users
5. Add error recovery mechanisms
