"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function OAuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setStatus('Waiting for authentication...');
        
        // Wait for Supabase to automatically handle the OAuth callback
        // This can take a moment as Supabase processes the PKCE flow
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          setStatus(`Checking authentication... (${attempts + 1}/${maxAttempts})`);
          
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionData?.session?.user) {
            const user = sessionData.session.user;
            console.log('✅ OAuth authentication successful');
            console.log('🔍 User data:', user);
            
            // Check if this is a first-time user or has incomplete profile
            let hasCompleteProfile = false;
            try {
              const { data: profileData, error } = await supabase
                .from('user_profiles')
                .select('user_id, full_name, phone, age, avatar')
                .eq('user_id', user.id)
                .single();
              
              if (!error && profileData) {
                // Check if profile is complete (has all required fields)
                hasCompleteProfile = !!(
                  profileData.full_name && 
                  profileData.phone && 
                  profileData.age && 
                  profileData.avatar
                );
                console.log('🔍 Profile data:', profileData);
                console.log('🔍 Profile completeness check:', {
                  hasName: !!profileData.full_name,
                  hasPhone: !!profileData.phone,
                  hasAge: !!profileData.age,
                  hasAvatar: !!profileData.avatar,
                  isComplete: hasCompleteProfile
                });
              }
            } catch {
              hasCompleteProfile = false;
            }
            
            const isFirstTimeUser = !hasCompleteProfile;
            console.log('🔍 Is first-time user (incomplete profile):', isFirstTimeUser);
            
            if (isFirstTimeUser) {
              console.log('🆕 Google user with incomplete profile, redirecting to signup flow');
              
              // Store Google OAuth data for signup flow
              const googleName = user.user_metadata?.full_name || 
                                user.user_metadata?.name || 
                                user.user_metadata?.display_name || 
                                'User';
              const googleEmail = user.email || '';
              
              // Store in localStorage for signup flow
              localStorage.setItem('isGoogleOAuth', 'true');
              localStorage.setItem('googleOAuthName', googleName);
              localStorage.setItem('googleOAuthEmail', googleEmail);
              localStorage.setItem('signupEmail', googleEmail);
              localStorage.setItem('userEmail', googleEmail);
              
              setStatus('Redirecting to signup...');
              router.push('/signup/phone');
              return;
            } else {
              console.log('🔄 Returning Google user, redirecting to home');
              setStatus('Redirecting to home...');
              router.push('/home');
              return;
            }
          }
          
          // Wait before trying again
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        
        // If we get here, authentication failed
        console.error('❌ Authentication timeout');
        router.push('/?error=Authentication timeout');
        
      } catch (err) {
        console.error('❌ Unexpected error in OAuth callback:', err);
        router.push('/?error=An unexpected error occurred');
      }
    };

    handleOAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}
