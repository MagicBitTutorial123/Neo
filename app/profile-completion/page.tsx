"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";

export default function ProfileCompletionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkUserAndShowModal();
  }, []);

  const checkUserAndShowModal = async () => {
    try {
      setLoading(true);
      
      // Get current authenticated user
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error('❌ No authenticated user found:', error);
        router.push('/signin');
        return;
      }

      // Check if user has a complete profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // No profile exists, show completion modal
        console.log('🆕 No profile found, showing completion modal');
        setUser(user);
        setShowModal(true);
      } else if (profile && profile.full_name && profile.full_name.trim() !== 'User') {
        // Profile is complete, redirect to home
        console.log('✅ Profile already complete, redirecting to home');
        router.push('/home');
      } else {
        // Profile exists but incomplete, show completion modal
        console.log('⚠️ Profile incomplete, showing completion modal');
        setUser(user);
        setShowModal(true);
      }
      
    } catch (err) {
      console.error('❌ Error checking user profile:', err);
      router.push('/signin');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    // If modal is closed without completion, redirect to home
    router.push('/home');
  };

  // Check if this is an OAuth success redirect
  const isOAuthSuccess = searchParams.get('oauth') === 'success';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
          <p className="text-lg text-[#222E3A]">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Welcome to Neo</h1>
            </div>
            <div className="text-sm text-gray-500">
              Complete your profile to get started
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {isOAuthSuccess ? 'Welcome! 🎉' : 'Complete Your Profile'}
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {isOAuthSuccess 
              ? "You've successfully signed in with Google! Now let's complete your profile to personalize your experience."
              : "Please provide some additional information to complete your profile setup."
            }
          </p>

          {!showModal && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Preparing your profile form...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Completion Modal */}
      {user && (
        <ProfileCompletionModal
          isOpen={showModal}
          onClose={handleModalClose}
          user={user}
        />
      )}
    </div>
  );
}
