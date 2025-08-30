import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      console.log('🔄 Processing OAuth callback with code');
      
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ Error exchanging code for session:', error);
        return NextResponse.redirect(`${requestUrl.origin}/signin?error=${encodeURIComponent(error.message)}`);
      }

      if (data.user) {
        console.log('✅ User authenticated via OAuth:', data.user.email);
        console.log('🔍 User metadata:', data.user.user_metadata);
        console.log('🔍 User app metadata:', data.user.app_metadata);
        console.log('🔍 User ID:', data.user.id);
        
        // Check if this is a first-time user BEFORE creating the profile
        let hasExistingProfile = false;
        try {
          const { error } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('user_id', data.user.id)
            .single();
          hasExistingProfile = !error;
        } catch {
          hasExistingProfile = false;
        }
        
        // Also check if this is a completely new user (no previous sessions)
        const isCompletelyNewUser = !data.user.app_metadata?.provider_refreshed_at;
        
        // User is first-time if they have no profile OR if they're completely new
        const isFirstTimeUser = !hasExistingProfile || isCompletelyNewUser;
        console.log('🆕 Is first-time user:', isFirstTimeUser);
        console.log('🔍 Has existing profile:', hasExistingProfile);
        console.log('🔍 Is completely new user:', isCompletelyNewUser);
        console.log('🔍 App metadata provider_refreshed_at:', data.user.app_metadata?.provider_refreshed_at);
        
        // ALWAYS create/update user profile for Google users
        try {
          console.log('🔄 Starting profile creation/update process...');
          
          // First, let's check if a profile already exists
          console.log('🔍 Checking if profile already exists...');
          const { data: existingProfile, error: checkError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
            
          if (checkError && checkError.code === 'PGRST116') {
            console.log('🆕 No existing profile found, will create new one');
          } else if (existingProfile) {
            console.log('🔄 Existing profile found:', existingProfile);
            console.log('🔍 Existing avatar field:', existingProfile.avatar);
          } else {
            console.log('⚠️ Unexpected result when checking profile:', checkError);
          }
          
          const profileData = {
            user_id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.user_metadata?.display_name || 'User',
            avatar: '/Avatar02.png', // ALWAYS set Avatar02.png for Google users
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('📝 Profile data to insert/update:', profileData);
          console.log('🔍 Google user metadata:', data.user.user_metadata);
          console.log('🔍 Full name extracted:', profileData.full_name);
          console.log('🔍 Avatar field value:', profileData.avatar);
          
          // Ensure we have a valid full name
          if (!profileData.full_name || profileData.full_name === 'User') {
            console.log('⚠️ No valid full name found, trying alternative extraction...');
            
            // Try alternative extraction methods
            const alternativeName = data.user.user_metadata?.email?.split('@')[0] || 
                                  data.user.email?.split('@')[0] || 
                                  'User';
            
            profileData.full_name = alternativeName;
            console.log('🔍 Using alternative name:', profileData.full_name);
          }
          
          // Try to insert first (in case trigger didn't work)
          console.log('🔄 Attempting to insert profile...');
          const { data: insertProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert([profileData])
            .select()
            .single();
            
          if (insertError) {
            console.log('⚠️ Insert failed, trying upsert instead...');
            console.error('❌ Insert error:', insertError.message);
            
            // Try upsert as fallback
            const { data: upsertProfile, error: upsertError } = await supabase
              .from('user_profiles')
              .upsert([profileData], {
                onConflict: 'user_id',
                ignoreDuplicates: false
              })
              .select()
              .single();
              
            if (upsertError) {
              console.error('❌ Upsert also failed:', upsertError.message);
              console.log('⚠️ Profile creation failed, redirecting to home anyway');
              return NextResponse.redirect(`${requestUrl.origin}/home`);
            } else {
              console.log('✅ Profile created via upsert with Avatar02.png:', upsertProfile);
              console.log('🔍 Upserted avatar field:', upsertProfile.avatar);
            }
          } else {
            console.log('✅ Profile created via insert with Avatar02.png:', insertProfile);
            console.log('🔍 Inserted avatar field:', insertProfile.avatar);
          }
          
          // Wait a moment for any database triggers to complete
          console.log('⏳ Waiting for database operations to complete...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check what the database trigger actually created
          console.log('🔍 Checking what the database trigger created...');
          const { data: triggerProfile, error: triggerError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
            
          if (triggerError) {
            console.error('❌ Trigger profile check failed:', triggerError);
          } else {
            console.log('🔍 Trigger-created profile:', triggerProfile);
            console.log('🔍 Trigger-created avatar field:', triggerProfile.avatar);
            
            // If the trigger created a profile with wrong avatar, update it immediately
            if (triggerProfile.avatar !== '/Avatar02.png') {
              console.log('⚠️ Trigger created profile with wrong avatar, updating immediately...');
              const { data: immediateUpdate, error: immediateError } = await supabase
                .from('user_profiles')
                .update({ 
                  avatar: '/Avatar02.png',
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', data.user.id)
                .select()
                .single();
                
              if (immediateError) {
                console.error('❌ Immediate update failed:', immediateError);
              } else {
                console.log('✅ Immediate update successful:', immediateUpdate);
                console.log('🔍 Immediate updated avatar field:', immediateUpdate.avatar);
              }
            }
          }
          
          // Let's verify the profile was actually created/updated
          console.log('🔍 Verifying profile in database...');
          const { data: verifyProfile, error: verifyError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
            
          if (verifyError) {
            console.error('❌ Verification failed:', verifyError);
          } else {
            console.log('✅ Verification successful:', verifyProfile);
            console.log('🔍 Verified avatar field:', verifyProfile.avatar);
            
            // If avatar is not set correctly, try to force update it
            if (verifyProfile.avatar !== '/Avatar02.png') {
              console.log('⚠️ Avatar field is not correct, forcing update...');
              const { data: forceUpdate, error: forceError } = await supabase
                .from('user_profiles')
                .update({ 
                  avatar: '/Avatar02.png',
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', data.user.id)
                .select()
                .single();
                
              if (forceError) {
                console.error('❌ Force update failed:', forceError);
              } else {
                console.log('✅ Force update successful:', forceUpdate);
                console.log('🔍 Force updated avatar field:', forceUpdate.avatar);
              }
            }
          }
          
          // Final verification after all operations
          console.log('🔍 Final verification...');
          const { data: finalProfile, error: finalError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
            
          if (finalError) {
            console.error('❌ Final verification failed:', finalError);
          } else {
            console.log('✅ Final verification successful:', finalProfile);
            console.log('🔍 Final avatar field value:', finalProfile.avatar);
            
            if (finalProfile.avatar === '/Avatar02.png') {
              console.log('🎉 SUCCESS: Avatar field is correctly set to /Avatar02.png');
            } else {
              console.log('❌ FAILURE: Avatar field is still not correct:', finalProfile.avatar);
            }
          }
          
        } catch (profileErr) {
          console.error('❌ Unexpected profile error:', profileErr);
          console.error('❌ Error stack:', profileErr instanceof Error ? profileErr.stack : 'No stack trace');
          // On any profile error, still redirect to home
          console.log('⚠️ Profile error occurred, redirecting to home anyway');
        }
        
        // Redirect based on whether this is a first-time user
        if (isFirstTimeUser) {
          console.log('🆕 First-time Google user, redirecting to settings for profile completion');
          const redirectUrl = `${requestUrl.origin}/settings?oauth=success&firstTime=true`;
          console.log('🔗 Redirecting to:', redirectUrl);
          console.log('🔗 Full redirect URL:', redirectUrl);
          console.log('🔗 Request origin:', requestUrl.origin);
          return NextResponse.redirect(redirectUrl);
        } else {
          console.log('🔄 Returning Google user, redirecting to home');
          const redirectUrl = `${requestUrl.origin}/home?oauth=success`;
          console.log('🔗 Redirecting to:', redirectUrl);
          return NextResponse.redirect(redirectUrl);
        }
        
      } else {
        console.error('❌ No user data after OAuth exchange');
        return NextResponse.redirect(`${requestUrl.origin}/signin?error=Authentication failed`);
      }
    } catch (err) {
      console.error('❌ Unexpected error in OAuth callback:', err);
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=An unexpected error occurred`);
    }
  }

  // No code provided, redirect to signin
  console.log('❌ No OAuth code provided, redirecting to signin');
  return NextResponse.redirect(`${requestUrl.origin}/signin`);
}