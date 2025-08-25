"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import SideNavbar from "@/components/SideNavbar";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { useSidebar } from "@/context/SidebarContext";

const splitName = (full: string) => {
  const parts = (full || "").trim().split(/\s+/);
  const first = parts.shift() ?? "";
  const last = parts.join(" ");
  return { first, last };
};

const joinName = (first: string, last: string) =>
  [first.trim(), last.trim()].filter(Boolean).join(" ");

export default function SettingsPage() {
  const { registrationData, userData, updateUserData } = useUser();
  const { sidebarCollapsed } = useSidebar();

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("/Avatar01.png");

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Supabase
  const fetchUserDataFromSupabase = async () => {
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
          if (userMetadata && (userMetadata.full_name || userMetadata.avatar || userMetadata.phone || userMetadata.age)) {
            const fallbackProfile = {
              full_name: userMetadata.full_name || undefined,
              avatar: userMetadata.avatar || undefined,
              email: user.email || undefined,
              phone: userMetadata.phone || undefined,
              bio: '',
              age: userMetadata.age ? parseInt(userMetadata.age) : null
            };
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
  };

  // Create user profile manually if it doesn't exist
  const createUserProfileManually = async (user: any) => {
    try {
      console.log('🔧 Creating user profile manually...');
      
      // Get data from user metadata
      const userMetadata = user.user_metadata;
      const profileData = {
        user_id: user.id, // Use 'user_id' column name as this is standard
        email: user.email,
        full_name: userMetadata?.full_name || 'User',
        phone: userMetadata?.phone || '',
        age: userMetadata?.age ? parseInt(userMetadata.age) : null,
        avatar: userMetadata?.avatar || '/Avatar01.png',
        bio: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 Profile data to insert:', profileData);

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
  };

  // Populate form fields with user data
  const populateFormFields = (profile: any) => {
    // Set avatar
    if (profile.avatar) {
      const avatarPath = profile.avatar.startsWith("/") 
        ? profile.avatar 
        : `/${profile.avatar}`;
      setAvatar(avatarPath);
    }

    // Set name fields
    if (profile.full_name) {
      const { first, last } = splitName(profile.full_name);
      setFirstName(first);
      setLastName(last);
    }

    // Set other fields
    if (profile.email) setEmail(profile.email);
    if (profile.phone) setPhone(profile.phone);
    if (profile.bio !== undefined) setBio(profile.bio || '');
    if (profile.age !== undefined) setAge(profile.age);
  };

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserDataFromSupabase();
  }, []);

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
    () => /^[0-9+\s-]{7,}$/.test(phone),
    [phone]
  );
  
  const ageValid = useMemo(
    () => age === null || (age >= 5 && age <= 120),
    [age]
  );
  
  const canSave = !!firstName.trim() && phoneValid && ageValid && !saving;

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
      
      // Dispatch custom event to notify sidebar to refresh
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
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
        className="flex-1 px-6 lg:px-8 xl:px-10 py-8 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarCollapsed ? "80px" : "260px",
        }}
      >
        <div className="w-full flex flex-col lg:flex-row gap-6">
          {/* Left tabs */}
          <aside className="lg:w-[280px] w-full shrink-0">
            <div className="rounded-[24px] bg-white shadow-sm border border-[#EEF2F7] p-6 min-h-[560px]">
              <nav className="flex flex-col gap-2 h-full">
                <button className="w-full text-left px-5 py-5 rounded-[14px] bg-[#F3F8FF] text-[#00AEEF] font-semibold border border-[#CFE2FF]">
                  My Profile
                </button>
                <button className="w-full text-left px-5 py-5 rounded-[14px] hover:bg-[#F8FAFC] text-[#0F172A]/70">
                  Security
                </button>
                <button className="w-full text-left px-5 py-5 rounded-[14px] hover:bg-[#F8FAFC] text-[#0F172A]/70">
                  Subscription
                </button>
                <button className="w-full text-left px-5 py-5 rounded-[14px] hover:bg-[#F8FAFC] text-[#EF4444]">
                  Delete Account
                </button>
                <div className="flex-1" />
              </nav>
            </div>
          </aside>

          {/* Right pane */}
          <section className="flex-1 flex flex-col gap-6">
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
                <div className="flex flex-col">
                  <h1 className="text-[34px] md:text-[40px] leading-none font-extrabold text-[#0F172A]">
                    {fullName || "User"}
                  </h1>
                  <p className="mt-1 text-[15px] text-[#6B7280]">
                    {bio || "No bio set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Editable form */}
            <div className="rounded-[24px] bg-white shadow-sm border border-[#EEF2F7] p-5 md:p-7">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] md:text-[20px] font-extrabold text-[#0F172A]">
                  Personal Information
                </h2>
                <button
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                    canSave
                      ? "border-[#E5E7EB] hover:bg-[#F8FAFC]"
                      : "border-[#E5E7EB] opacity-60 cursor-not-allowed"
                  } text-[14px] text-[#0F172A]`}
                  onClick={handleSave}
                  disabled={!canSave}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>

              {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
              {ok && <p className="mb-4 text-sm text-green-600">{ok}</p>}

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
                    className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                    value={phone}
                    onChange={(ev) => setPhone(ev.target.value)}
                    placeholder="Enter phone number"
                  />
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
          </section>
        </div>
      </main>
    </div>
  );
}
