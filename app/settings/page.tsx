"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import SideNavbar from "@/components/SideNavbar";
import FirmwareInstaller from "@/components/FirmwareInstaller";
// import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { useSidebar } from "@/context/SidebarContext";
import { useSearchParams } from "next/navigation";

const splitName = (full: string) => {
  const parts = (full || "").trim().split(/\s+/);
  const first = parts.shift() ?? "";
  const last = parts.join(" ");
  return { first, last };
};

const joinName = (first: string, last: string) =>
  [first.trim(), last.trim()].filter(Boolean).join(" ");

const avatars = [
  "/Avatar01.png",
  "/Avatar02.png",
  "/Avatar03.png",
  "/Avatar04.png",
  "/Avatar05.png",
];



export default function SettingsPage() {
  // const { registrationData, userData, updateUserData } = useUser();
  const { sidebarCollapsed } = useSidebar();
  const searchParams = useSearchParams();
  
  // Check if this is a first-time OAuth user
  const isFirstTimeOAuth = searchParams.get('firstTime') === 'true';
  const isOAuthSuccess = searchParams.get('oauth') === 'success';
  
  // Debug logging
  console.log('🔍 Settings page URL params:', {
    firstTime: searchParams.get('firstTime'),
    oauth: searchParams.get('oauth'),
    isFirstTimeOAuth,
    isOAuthSuccess
  });

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("/Avatar02.png");
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'subscription' | 'firmware' | 'delete'>('profile');
  const [avatarChanged, setAvatarChanged] = useState(false);

  // Supabase user data
  // const [supabaseUserData, setSupabaseUserData] = useState<{
  //   full_name?: string;
  //   avatar?: string;
  //   email?: string;
  //   phone?: string;
  //   bio?: string;
  // } | null>(null);

  // localStorage-backed values (same as sidebar)
  // const [lsName, setLsName] = useState<string | null>(null);
  // const [lsAvatar, setLsAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

    // Create user profile manually if it doesn't exist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createUserProfileManually = useCallback(async (user: any) => {
    try {
      console.log('🔧 Creating user profile manually...');

      // Get data from user metadata
      const userMetadata = user.user_metadata;
      const profileData = {
        user_id: user.id, // Use 'user_id' column name as this is standard
        email: user.email,
        full_name: userMetadata?.full_name || userMetadata?.name || userMetadata?.display_name || 'User',
        phone: userMetadata?.phone || '',
        age: userMetadata?.age ? parseInt(userMetadata.age) : null,
        avatar: userMetadata?.avatar || '/Avatar01.png',
        bio: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 Profile data to insert:', profileData);
      console.log('🔍 Google user metadata:', userMetadata);
      console.log('🔍 Full name extracted:', profileData.full_name);

      // Insert profile into user_profiles table
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating profile manually:', insertError);
        // Even if profile creation fails, try to use metadata
        const fallbackProfile = {
          full_name: userMetadata?.full_name || 'User',
          avatar: userMetadata?.avatar || '/Avatar01.png',
          email: user.email || '',
          phone: userMetadata?.phone || '',
          bio: '',
          age: userMetadata?.age ? parseInt(userMetadata.age) : null
        };
        populateFormFields(fallbackProfile);
        console.log('✅ Using fallback data after failed profile creation:', fallbackProfile);
        return;
      }

      if (newProfile) {
        populateFormFields(newProfile);
        console.log('✅ User profile created manually:', newProfile);
      }
    } catch (error) {
      console.error('❌ Error creating profile manually:', error);
      // Last resort: use whatever data we can get
      const userMetadata = user.user_metadata;
      const fallbackProfile = {
        full_name: userMetadata?.full_name || 'User',
        avatar: userMetadata?.avatar || '/Avatar01.png',
        email: user.email || '',
        phone: userMetadata?.phone || '',
        bio: '',
        age: userMetadata?.age ? parseInt(userMetadata.age) : null
      };
      populateFormFields(fallbackProfile);
      console.log('✅ Using last resort fallback data:', fallbackProfile);
    }
  }, []);
  
  // Fetch user data from Supabase
  const fetchUserDataFromSupabase = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching user data from Supabase...');

      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log('❌ No authenticated user found in Supabase Auth');
        setError("No authenticated user found. Please log in again.");
        return;
      }

      console.log('✅ Found authenticated user:', user.id);
      console.log('🔍 User metadata:', user.user_metadata);

      // Fetch user profile from user_profiles table - now including bio column
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, avatar, email, phone, bio, age')
        .eq('user_id', user.id) // Use 'user_id' column name as this is standard
        .single();

      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError);

        // If profile doesn't exist, try to get user metadata from auth
        if (profileError.code === 'PGRST116') {
          console.log('🔄 Profile not found, trying to get user metadata from auth...');

          const userMetadata = user.user_metadata;
          if (userMetadata && (userMetadata.full_name || userMetadata.name || userMetadata.display_name || userMetadata.avatar || userMetadata.phone || userMetadata.age)) {
            const fallbackProfile = {
              full_name: userMetadata.full_name || userMetadata.name || userMetadata.display_name || undefined,
              avatar: userMetadata.avatar || undefined,
              email: user.email || undefined,
              phone: userMetadata.phone || undefined,
              bio: '',
              age: userMetadata.age ? parseInt(userMetadata.age) : null
            };
            console.log('🔍 Google user metadata found:', userMetadata);
            console.log('🔍 Fallback profile created:', fallbackProfile);
            populateFormFields(fallbackProfile);
            console.log('✅ Using fallback data from auth metadata:', fallbackProfile);
            return;
          }
        }

        // If we still don't have data, try to create a profile manually
        console.log('🔄 Attempting to create user profile manually...');
        await createUserProfileManually(user);
        return;
      }

      if (profile) {
        populateFormFields(profile);
        console.log('✅ User profile fetched from Supabase:', profile);
      } else {
        console.log('❌ No profile found for user');
        setError("No user profile found.");
      }
    } catch (error) {
      console.error('❌ Error fetching user data from Supabase:', error);
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [createUserProfileManually]);





  // Populate form fields with user data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const populateFormFields = (profile: any) => {
    console.log('🔍 Populating form fields with profile:', profile);
    console.log('🔍 Current form state before population:', { firstName, lastName, email, avatar });
    
    // Set avatar
    if (profile.avatar) {
      const avatarPath = profile.avatar.startsWith("/")
        ? profile.avatar
        : `/${profile.avatar}`;
      setAvatar(avatarPath);
    }

    // Set name fields - prioritize Google account data
    if (profile.full_name) {
      const { first, last } = splitName(profile.full_name);
      console.log('🔍 Splitting full_name:', profile.full_name, 'into first:', first, 'last:', last);
      setFirstName(first);
      setLastName(last);
      console.log('✅ Name fields populated from profile:', { first, last, full: profile.full_name });
    } else {
      console.log('⚠️ No full_name found in profile');
    }

    // Set other fields
    if (profile.email) {
      setEmail(profile.email);
      console.log('✅ Email set to:', profile.email);
    }
    if (profile.phone) {
      setPhone(profile.phone);
      console.log('✅ Phone set to:', profile.phone);
    }
    if (profile.bio !== undefined) {
      setBio(profile.bio || '');
      console.log('✅ Bio set to:', profile.bio || '');
    }
    if (profile.age !== undefined) {
      setAge(profile.age);
      console.log('✅ Age set to:', profile.age);
    }
    
    console.log('🔍 Form state after population:', { 
      firstName: profile.full_name ? splitName(profile.full_name).first : firstName,
      lastName: profile.full_name ? splitName(profile.full_name).last : lastName,
      email: profile.email || email,
      avatar: profile.avatar ? (profile.avatar.startsWith("/") ? profile.avatar : `/${profile.avatar}`) : avatar
    });
  };

  // Manual refresh function for debugging
  const refreshUserData = useCallback(async () => {
    console.log('🔄 Manually refreshing user data...');
    await fetchUserDataFromSupabase();
  }, [fetchUserDataFromSupabase]);

  // Force refresh from database for Google users
  const forceRefreshFromDatabase = useCallback(async () => {
    try {
      console.log('🔄 Force refreshing user data from database...');
      setLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('❌ No authenticated user found');
        return;
      }

      // Force fetch from database
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, avatar, email, phone, bio, age')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
        return;
      }

      if (profile) {
        console.log('✅ Force refreshed profile from database:', profile);
        populateFormFields(profile);
      }
    } catch (error) {
      console.error('❌ Error force refreshing:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check database directly for a specific user
  const checkDatabaseDirectly = useCallback(async () => {
    try {
      console.log('🔄 Checking database directly for user:', supabase.auth.getUser());
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user found.');
        return;
      }

      console.log('🔍 User ID:', user.id);
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error fetching profile directly:', profileError);
        console.error('❌ Error details:', profileError.details);
        console.error('❌ Error hint:', profileError.hint);
        return;
      }

      if (profile) {
        console.log('✅ Profile found in database directly:', profile);
        populateFormFields(profile);
      } else {
        console.log('❌ Profile not found in database directly.');
      }
    } catch (error) {
      console.error('❌ Error checking database directly:', error);
    }
  }, []);

  // Fix Google user profile by updating with Google metadata
  const fixGoogleUserProfile = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return;
      }

      // Extract full name from Google metadata
      const googleFullName = user.user_metadata?.full_name || 
                            user.user_metadata?.name || 
                            user.user_metadata?.display_name ||
                            (user.user_metadata?.given_name && user.user_metadata?.family_name ? 
                             `${user.user_metadata.given_name} ${user.user_metadata.family_name}` : null);

      if (googleFullName && googleFullName !== 'undefined undefined') {
        // Update the profile with the Google full name
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            full_name: googleFullName,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (!updateError && updatedProfile) {
          // Refresh the form fields
          populateFormFields(updatedProfile);
        }
      }
    } catch (error) {
      // Silently handle errors for production
    }
  }, []);

  // Delete account functionality
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = useCallback(async () => {
    console.log('🔍 handleDeleteAccount called with deleteConfirmation:', deleteConfirmation);
    
    if (!deleteConfirmation || deleteConfirmation !== "DELETE") {
      console.log('❌ Delete confirmation mismatch. Expected: DELETE, Got:', deleteConfirmation);
      setError("Please type 'DELETE' to confirm account deletion.");
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      console.log('🗑️ Starting account deletion...');

      // First, verify the user is still authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ User not authenticated:', authError);
        setError("Your session has expired. Please log in again.");
        return;
      }

      console.log('✅ User authenticated, proceeding with deletion for user:', user.id);
      
      // Also check the session to see if it's valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
      } else if (session) {
        console.log('✅ Valid session found, expires at:', session.expires_at);
      } else {
        console.log('⚠️ No active session found');
      }

      // Call the delete account API route with user ID
      console.log('📡 Calling delete account API...');
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
        credentials: 'include', // Ensure cookies are sent
      });

      console.log('📡 API response status:', response.status);
      const result = await response.json();
      console.log('📡 API response:', result);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(result.error || 'Failed to delete account');
      }

      console.log('✅ Account deletion successful:', result);
      
      // Show success message
      setOk("Profile deleted successfully. Signing out and redirecting...");
      
      // Sign out the user
      try {
        await supabase.auth.signOut();
        console.log('✅ User signed out successfully');
      } catch (signOutError) {
        console.error('⚠️ Error signing out:', signOutError);
        // Continue anyway
      }
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

    } catch (error) {
      console.error('❌ Error deleting account:', error);
      setError(error instanceof Error ? error.message : "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConfirmation]);
  // Removed duplicate declaration of openDeleteModal

  const closeDeleteModal = () => {
    console.log('🔍 closeDeleteModal called, isDeleting:', isDeleting, 'deleteConfirmation:', deleteConfirmation);
    setShowDeleteModal(false);
    // Don't clear deleteConfirmation when closing modal - let user keep their input
    // Only clear it when explicitly requested (like clicking Clear button)
    setError(null);
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    // Don't clear deleteConfirmation when opening modal - preserve user's input
    setError(null);
  };

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserDataFromSupabase();
    fixGoogleUserProfile(); // Fix Google user profile on mount
  }, [fetchUserDataFromSupabase, fixGoogleUserProfile]);

  // Auto-populate Google user data if this is their first time
  useEffect(() => {
    if (isFirstTimeOAuth && !loading) {
      console.log('🆕 First-time OAuth user detected, auto-populating form fields...');
      
      const autoPopulateFromGoogle = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.user_metadata) {
            const userMetadata = user.user_metadata;
            console.log('🔍 Google user metadata for auto-population:', userMetadata);
            
            // Auto-populate name fields if they're empty
            if (!firstName && !lastName && (userMetadata.full_name || userMetadata.name || userMetadata.display_name)) {
              const fullName = userMetadata.full_name || userMetadata.name || userMetadata.display_name;
              const { first, last } = splitName(fullName);
              setFirstName(first);
              setLastName(last);
              console.log('✅ Auto-populated name fields from Google:', { first, last, full: fullName });
            }
            
            // Auto-populate email if empty
            if (!email && user.email) {
              setEmail(user.email);
              console.log('✅ Auto-populated email from Google:', user.email);
            }
            
            // Auto-populate avatar if it's the default
            if (avatar === '/Avatar01.png' && userMetadata.avatar) {
              setAvatar(userMetadata.avatar);
              console.log('✅ Auto-populated avatar from Google:', userMetadata.avatar);
            }
          }
        } catch (error) {
          console.log('🔍 Error auto-populating from Google:', error);
        }
      };
      
      autoPopulateFromGoogle();
    }
  }, [isFirstTimeOAuth, loading, firstName, lastName, email, avatar]);

  // Only reset delete confirmation when explicitly needed
  // Removed the problematic useEffect that was clearing confirmation too aggressively

  // Load data from localStorage as fallback
  useEffect(() => {
    try {
      const storedAge = localStorage.getItem('age');
      if (storedAge && storedAge.trim()) {
        const ageValue = parseInt(storedAge.trim());
        if (!isNaN(ageValue)) {
          setAge(ageValue);
        }
      }
    } catch (error) {
      console.error('❌ Error reading age from localStorage:', error);
    }
  }, []);

  const fullName = useMemo(
    () => joinName(firstName, lastName),
    [firstName, lastName]
  );

  const phoneValid = useMemo(
    () => /^[0-9+\s-]{10}$/.test(phone),
    [phone]
  );

  const ageValid = useMemo(
    () => age === null || (age >= 5 && age <= 120),
    [age]
  );

  const canSave = !!firstName.trim() && phoneValid && ageValid && !saving;

  // Handle immediate avatar update
  const handleAvatarChange = (newAvatar: string) => {
    setAvatar(newAvatar);
    setAvatarChanged(true);
    setOk(null); // Clear any previous success message
  };

  // Handle immediate avatar save
  const handleAvatarSave = async () => {
    if (!avatarChanged) return;
    
    setSaving(true);
    setError(null);
    
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("No authenticated user found. Please log in again.");
        return;
      }

      // Update avatar in user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          avatar: avatar.startsWith('/') ? avatar.substring(1) : avatar,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('❌ Error updating avatar:', profileError);
        setError(`Failed to update avatar: ${profileError.message}`);
        return;
      }

      // Update user metadata in auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar: avatar.replace('/', '')
        }
      });

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError);
        // Don't fail the whole operation for metadata update
      }

      // Update localStorage
      localStorage.setItem("avatar", avatar.replace('/', ''));

      // Dispatch events to notify sidebar
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { avatar: avatar.replace('/', '') } 
      }));
      window.dispatchEvent(new CustomEvent('avatarChanged', { 
        detail: { avatar: avatar.replace('/', '') } 
      }));

      setOk("Avatar updated successfully!");
      setAvatarChanged(false);
      
    } catch (error) {
      console.error('❌ Error saving avatar:', error);
      setError("Failed to update avatar. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setOk(null);
    if (!canSave) return;

    setSaving(true);
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("No authenticated user found. Please log in again.");
        return;
      }

      console.log('🔄 Updating profile for user:', user.id);
      console.log('📝 New data:', { fullName, email, phone, age, bio, currentAvatar: avatar });

      // Prepare the data for upsert
      const upsertData = {
        user_id: user.id,
        email: email.trim(),
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        age: age, // Preserve existing age
        avatar: avatar.startsWith('/') ? avatar.substring(1) : avatar,
        bio: bio.trim() || '',
        updated_at: new Date().toISOString()
      };

      console.log('📤 Data being sent to Supabase:', upsertData);

      // First, let's check what's currently in the database
      console.log('🔍 Checking current profile in database...');
      const { data: currentProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (checkError) {
        console.log('⚠️ No existing profile found, will create new one');
      } else {
        console.log('✅ Found existing profile:', currentProfile);
      }

      // Update user profile in Supabase
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert(upsertData, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Error updating profile:', profileError);
        console.error('❌ Error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        setError(`Failed to update profile: ${profileError.message}`);
        return;
      }

      console.log('✅ Profile updated in Supabase:', profile);

      // Update user metadata in auth for name and avatar changes
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          avatar: avatar.replace('/', '') // Remove leading slash for storage
        }
      });

      if (updateError) {
        console.error('❌ Error updating user metadata:', updateError);
        // Don't fail the whole operation for metadata update
      } else {
        console.log('✅ User metadata updated in auth');
      }

      // Sync localStorage as backup
      localStorage.setItem("name", fullName.trim());
      localStorage.setItem("email", email.trim());
      localStorage.setItem("phone", phone.trim());
      localStorage.setItem("age", age ? age.toString() : '');
      localStorage.setItem("bio", bio.trim());
      localStorage.setItem("avatar", avatar.replace('/', '')); // Store without leading slash

      setOk("Profile updated successfully!");
      setAvatarChanged(false);

      // Dispatch custom events to notify sidebar to refresh
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { avatar: avatar.replace('/', '') } 
      }));
      window.dispatchEvent(new CustomEvent('avatarChanged', { 
        detail: { avatar: avatar.replace('/', '') } 
      }));

      // Refresh data to ensure consistency
      await fetchUserDataFromSupabase();
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <SideNavbar />
        <main
          className="flex-1 px-6 lg:px-8 xl:px-10 py-8 transition-all duration-300 ease-in-out"
          style={{
            marginLeft: sidebarCollapsed ? "80px" : "260px",
          }}
        >
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading profile...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !firstName && !lastName) {
    return (
      <div className="flex min-h-screen bg-[#F6F8FC]">
        <SideNavbar />
        <main
          className="flex-1 px-6 lg:px-8 xl:px-10 py-8 transition-all duration-300 ease-in-out"
          style={{
            marginLeft: sidebarCollapsed ? "80px" : "260px",
          }}
        >
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-lg text-red-600">{error}</div>
            <button
              onClick={fetchUserDataFromSupabase}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry Loading Profile
            </button>
            <div className="text-sm text-gray-500">
              If the problem persists, try refreshing the page or contact support.
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F6F8FC]">
      <SideNavbar />
      <main
        className="flex-1 px-6 lg:px-8  xl:px-10 py-8 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarCollapsed ? "80px" : "260px",
        }}
      >
        <div className="w-full flex flex-col lg:flex-row gap-6">
          {/* Left tabs */}
          <aside className="lg:w-[280px] w-full shrink-0">
            <div className="rounded-[24px] bg-white shadow-sm border border-[#EEF2F7] p-6 min-h-[560px]">
              <nav className="flex flex-col gap-2 h-full">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-5 py-5 rounded-[14px] transition-colors ${activeTab === 'profile'
                      ? 'bg-[#F3F8FF] text-[#00AEEF] font-semibold border border-[#CFE2FF]'
                      : 'hover:bg-[#F8FAFC] text-[#0F172A]/70'
                    }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-5 py-5 rounded-[14px] transition-colors ${activeTab === 'security'
                      ? 'bg-[#F3F8FF] text-[#00AEEF] font-semibold border border-[#CFE2FF]'
                      : 'hover:bg-[#F8FAFC] text-[#0F172A]/70'
                    }`}
                >
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`w-full text-left px-5 py-5 rounded-[14px] transition-colors ${activeTab === 'subscription'
                      ? 'bg-[#F3F8FF] text-[#00AEEF] font-semibold border border-[#CFE2FF]'
                      : 'hover:bg-[#F8FAFC] text-[#0F172A]/70'
                    }`}
                >
                  Subscription
                </button>
                <button
                  onClick={() => setActiveTab('firmware')}
                  className={`w-full text-left px-5 py-5 rounded-[14px] transition-colors ${activeTab === 'firmware'
                      ? 'bg-[#F3F8FF] text-[#00AEEF] font-semibold border border-[#CFE2FF]'
                      : 'hover:bg-[#F8FAFC] text-[#0F172A]/70'
                    }`}
                >
                  Firmware
                </button>
                <button
                  onClick={() => setActiveTab('delete')}
                  className={`w-full text-left px-5 py-5 rounded-[14px] transition-colors ${activeTab === 'delete'
                      ? 'bg-[#F3F8FF] text-[#00AEEF] font-semibold border border-[#CFE2FF]'
                      : 'hover:bg-[#F8FAFC] text-[#EF4444]'
                    }`}
                >
                  Delete Account
                </button>
                <div className="flex-1" />
              </nav>
            </div>
          </aside>

          {/* Right pane */}
            <section className="flex-1 flex flex-col gap-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                                 {/* Welcome message for first-time OAuth users */}
                 {isFirstTimeOAuth && (
                   <div className="rounded-[24px] bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                         <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                         </svg>
                       </div>
                       <div className="flex-1">
                         <h3 className="text-lg font-bold text-blue-900 mb-1">
                           Welcome! 🎉
                         </h3>
                         <p className="text-blue-700 text-sm mb-2">
                           {isOAuthSuccess 
                             ? "You've successfully signed in with Google! Your profile has been automatically populated with your Google account information."
                             : "Please complete your profile below to get started."
                           }
                         </p>
                         {isOAuthSuccess && (
                           <p className="text-blue-600 text-xs">
                             💡 You can review and edit the auto-populated information below, then click &quot;Save&quot; to complete your profile.
                           </p>
                         )}
                       </div>
                     </div>
                   </div>
                 )}
               
                 
                 {/* Header card */}
                <div className="rounded-[24px] bg-white shadow-sm border border-[#EEF2F7] px-6 md:px-10 py-6 md:py-7">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-[82px] h-[82px] relative">
                      <Image
                        src={avatar}
                        alt="Avatar"
                        fill
                        className="rounded-full object-cover bg-[#FFF7E6] p-2"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <h1 className="text-[34px] md:text-[40px] leading-none font-extrabold text-[#0F172A]">
                        {fullName}
                      </h1>
                      <p className="mt-1 text-[15px] text-[#6B7280]">
                        {bio || "No bio set"}
                      </p>
                    </div>
                    {/* Debug refresh button for Google users */}
                    {isFirstTimeOAuth && (
                      <button
                        onClick={refreshUserData}
                        className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Refresh user data from Google"
                      >
                        🔄 Refresh
                      </button>
                    )}
                  </div>
                </div>
         
            {/* Editable form */}
            <div className="rounded-[24px] bg-white shadow-sm border border-[#EEF2F7] p-5 md:p-7">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] md:text-[20px] font-extrabold text-[#0F172A]">
                  Personal Information
                </h2>
                <button
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${canSave
                      ? "border-[#E5E7EB] hover:bg-[#F8FAFC]"
                      : "border-[#E5E7EB] opacity-60 cursor-not-allowed"
                    } text-[14px] text-[#0F172A]`}
                  onClick={handleSave}
                  disabled={!canSave}
                >
                  {saving ? "Saving..." : avatarChanged ? "Save Changes" : "Save"}
                </button>
              </div>

              {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
              {ok && <p className="mb-4 text-sm text-green-600">{ok}</p>}

              {/* Avatar Selection Section */}
              <div className="mb-8">
                <label className="block text-sm text-[#6B7280] mb-3 flex items-center gap-2">
                  Profile Avatar
                  {isFirstTimeOAuth && avatar !== '/Avatar01.png' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      From Google
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-4">
                  {avatars.map((avatarSrc, idx) => (
                    <button
                      key={avatarSrc}
                      type="button"
                      className={`relative rounded-full p-2 transition-all border-4 ${
                        avatar === avatarSrc
                          ? "border-[#00AEEF] bg-[#F3F8FF]"
                          : "border-transparent bg-[#F8FAFC] hover:bg-[#F1F5F9]"
                      } focus:outline-none focus:ring-2 focus:ring-[#CFE2FF]`}
                      style={{
                        width: 80,
                        height: 80,
                      }}
                      onClick={() => handleAvatarChange(avatarSrc)}
                      tabIndex={0}
                      aria-label={`Select avatar ${idx + 1}`}
                    >
                      <Image
                        src={avatarSrc}
                        alt={`Avatar ${idx + 1}`}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                      {avatar === avatarSrc && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#00AEEF] rounded-full flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 12l4 4L19 6"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-[#6B7280]">
                    Click on an avatar to select it. Your selection will be saved when you click the Save button.
                    {avatarChanged && (
                      <span className="ml-2 text-[#00AEEF] font-medium">
                        • Changes pending
                      </span>
                    )}
                  </p>
                  {avatarChanged && (
                    <button
                      onClick={handleAvatarSave}
                      disabled={saving}
                      className="px-3 py-1.5 text-xs bg-[#00AEEF] text-white rounded-lg hover:bg-[#0098D4] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Save Avatar"}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#6B7280] flex items-center gap-2">
                    First Name
                    {isFirstTimeOAuth && firstName && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        From Google
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                    value={firstName}
                    onChange={(ev) => setFirstName(ev.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#6B7280] flex items-center gap-2">
                    Last Name
                    {isFirstTimeOAuth && lastName && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        From Google
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                    value={lastName}
                    onChange={(ev) => setLastName(ev.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#6B7280] flex items-center gap-2">
                    Email
                    {isFirstTimeOAuth && email && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        From Google
                      </span>
                    )}
                  </label>
                  <input
                    type="email"
                    className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-[#6B7280]">Phone</label>
                  <input
                    type="tel"
                    className={`rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black ${
                      phone && !phoneValid 
                        ? 'border-red-500 focus:ring-red-200' 
                        : phone && phoneValid 
                        ? 'border-green-500 focus:ring-green-200' 
                        : 'border-[#E5E7EB]'
                    }`}
                    value={phone}
                    onChange={(ev) => setPhone(ev.target.value)}
                    placeholder="Enter phone number"
                  />
                  {phone && !phoneValid && (
                    <p className="text-xs text-red-500 mt-1">
                      Phone number must be exactly 10 digits and can contain +, -, and spaces
                    </p>
                  )}
                                     {phone && phoneValid && (
                     <p className="text-xs text-green-500 mt-1">
                       ✓ Valid phone number format (10 digits)
                     </p>
                   )}
                 </div>
                 <div className="flex flex-col gap-1">
                   <label className="text-sm text-[#6B7280]">Age</label>
                   <input
                     type="number"
                     className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                     value={age || ''}
                     onChange={(ev) => setAge(ev.target.value ? parseInt(ev.target.value) : null)}
                     placeholder="Enter age"
                   />
                 </div>
                 <div className="md:col-span-2 flex flex-col gap-1">
                   <label className="text-sm text-[#6B7280]">Bio</label>
                  <textarea
                    className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] min-h-[90px] text-black"
                    value={bio}
                    onChange={(ev) => setBio(ev.target.value)}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
                 
            </>
            )}

          

        {/* Firmware Tab */}
        {activeTab === 'firmware' && (
          <FirmwareInstaller />
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="rounded-[24px] bg-white shadow-sm border border-[#EEF2F7] p-6">
            <h2 className="text-[20px] font-extrabold text-[#0F172A] mb-4">Security Settings</h2>
            <p className="text-[14px] text-[#6B7280]">Security settings will be available soon.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#6B7280]">First Name</label>
                <input
                  type="text"
                  className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                  value={firstName}
                  onChange={(ev) => setFirstName(ev.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#6B7280]">Last Name</label>
                <input
                  type="text"
                  className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                  value={lastName}
                  onChange={(ev) => setLastName(ev.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#6B7280]">Email <span className="text-xs text-gray-500">(Read-only)</span></label>
                <input
                  type="email"
                  className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none bg-gray-50 text-gray-600 cursor-not-allowed"
                  value={email}
                  readOnly
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#6B7280]">Phone</label>
                <input
                  type="tel"
                  className={`rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black ${
                    phone && !phoneValid 
                      ? 'border-red-500 focus:ring-red-200' 
                      : phone && phoneValid 
                      ? 'border-green-500 focus:ring-green-200' 
                      : 'border-[#E5E7EB]'
                  }`}
                  value={phone}
                  onChange={(ev) => setPhone(ev.target.value)}
                  placeholder="Enter phone number"
                />
                {phone && !phoneValid && (
                  <p className="text-xs text-red-500 mt-1">
                    Phone number must be exactly 10 digits and can contain +, -, and spaces
                  </p>
                )}
                {phone && phoneValid && (
                  <p className="text-xs text-green-500 mt-1">
                    ✓ Valid phone number format (10 digits)
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#6B7280]">Age</label>
                <input
                  type="number"
                  className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                  value={age || ''}
                  onChange={(ev) => setAge(ev.target.value ? parseInt(ev.target.value) : null)}
                  placeholder="Enter age"
                />
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-sm text-[#6B7280]">Bio</label>
                <textarea
                  className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] min-h-[90px] text-black"
                  value={bio}
                  onChange={(ev) => setBio(ev.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="rounded-[24px] bg-white shadow-sm border border-[#EEF2F7] p-6">
            <h2 className="text-[20px] font-extrabold text-[#0F172A] mb-4">Subscription</h2>
            <p className="text-[14px] text-[#6B7280]">Subscription management will be available soon.</p>
          </div>
        )}

        {/* Delete Account Tab */}
        {activeTab === 'delete' && (
          <div className="rounded-[24px] bg-white shadow-sm border border-[#EEF2F7] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-[20px] font-extrabold text-[#0F172A]">Delete Account</h2>
                <p className="text-[14px] text-[#6B7280]">Permanently remove your account and all associated data</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Warning: This action cannot be undone</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Your profile and all personal data will be permanently deleted</li>
                    <li>• Your account will be completely removed from our system</li>
                    <li>• You will lose access to all features and data</li>
                    <li>• This action is irreversible</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-red-700 mb-2">
                  Type &quot;DELETE&quot; to confirm
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 text-red-900 placeholder-red-400"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE to confirm"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {ok && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">{ok}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={openDeleteModal}
                  disabled={deleteConfirmation !== "DELETE" || isDeleting}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    deleteConfirmation === "DELETE" && !isDeleting
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isDeleting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting Account...
                    </span>
                  ) : (
                    "Delete My Account"
                  )}
                </button>

                <button
                  onClick={() => setDeleteConfirmation("")}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
        </section>
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Final Confirmation</h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
            </p>
            
                         <div className="flex gap-3">
               <button
                onClick={async () => {
                  console.log('🔍 Modal delete button clicked');
                  // Set the confirmation to DELETE since user has already confirmed in the modal
                  setDeleteConfirmation("DELETE");
                  console.log('✅ Set deleteConfirmation to DELETE');
                  // Hide the modal
                  setShowDeleteModal(false);
                  // Call handleDeleteAccount directly without timeout to avoid race condition
                  console.log('🚀 Calling handleDeleteAccount immediately');
                  handleDeleteAccount();
                }}
                 disabled={isDeleting}
                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
               >
                 {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
               </button>
               <button
                 onClick={closeDeleteModal}
                 disabled={isDeleting}
                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 Cancel
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
