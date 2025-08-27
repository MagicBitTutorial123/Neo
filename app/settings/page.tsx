"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import SideNavbar from "@/components/SideNavbar";
import FirmwareInstaller from "@/components/FirmwareInstaller";
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
  
  // Header

  // Avatar state - read-only, shows selected avatar from sidebar
  const { sidebarCollapsed } = useSidebar();

  // Header
  const [displayName, setDisplayName] = useState("User");

  //
  const [avatar, setAvatar] = useState<string>(() => {
    if (typeof window === "undefined") return "/Avatar01.png";
    try {
      const a = (localStorage.getItem("avatar") || "").trim();
      return a ? (a.startsWith("/") ? a : `/${a}`) : "/Avatar01.png";
    } catch {
      return "/Avatar01.png";
    }
  });

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [whereEmail, setWhereEmail] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'subscription' | 'firmware' | 'delete'>('profile');
  
  // Supabase user data
  const [supabaseUserData, setSupabaseUserData] = useState<{
    full_name?: string;
    avatar?: string;
    email?: string;
    phone?: string;
    bio?: string;
  } | null>(null);

  // localStorage-backed values (same as sidebar)
  const [lsName, setLsName] = useState<string | null>(null);
  const [lsAvatar, setLsAvatar] = useState<string | null>(null);

  // Fetch user data from Supabase
  const fetchUserDataFromSupabase = async () => {
    try {
      console.log('🔍 Fetching user data from Supabase...');
      
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('❌ No authenticated user found in Supabase Auth');
        return;
      }

      console.log('✅ Found authenticated user:', user.id);
      
      // Fetch user profile from user_profiles table
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, avatar, email, phone, bio')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError);
        
        // If profile doesn't exist, try to get user metadata from auth
        if (profileError.code === 'PGRST116') {
          console.log('🔄 Profile not found, trying to get user metadata from auth...');
          
          const userMetadata = user.user_metadata;
          if (userMetadata && (userMetadata.full_name || userMetadata.avatar)) {
            const fallbackProfile = {
              full_name: userMetadata.full_name || undefined,
              avatar: userMetadata.avatar || undefined,
              email: user.email || undefined,
              phone: undefined,
              bio: undefined
            };
            setSupabaseUserData(fallbackProfile);
            console.log('✅ Using fallback data from auth metadata:', fallbackProfile);
            return;
          }
        }
        return;
      }

      if (profile) {
        setSupabaseUserData(profile);
        console.log('✅ User profile fetched from Supabase:', profile);
      } else {
        console.log('❌ No profile found for user');
      }
    } catch (error) {
      console.error('❌ Error fetching user data from Supabase:', error);
    }
  };

  // ---- load from localStorage (same as sidebar)
  const refreshFromLocalStorage = () => {
    try {
      const n = localStorage.getItem("name");
      const a = localStorage.getItem("avatar");
      setLsName(n && n.trim() ? n.trim() : null);

      // normalize avatar path
      let av = a && a.trim() ? a.trim() : null;
      if (av) {
        if (!av.startsWith("/") && !av.startsWith("http")) av = `/${av}`;
        setLsAvatar(av);
      } else {
        setLsAvatar(null);
      }
    } catch {
      /* noop */
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserDataFromSupabase();
    refreshFromLocalStorage();
  }, []);

  // refresh when window regains focus or another tab updates storage
  useEffect(() => {
    const onFocus = () => refreshFromLocalStorage();
    const onStorage = () => refreshFromLocalStorage();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Check localStorage periodically to catch sidebar changes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshFromLocalStorage();
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  // final sources (prefer Supabase table → context → localStorage → default) - SAME AS SIDEBAR
  const userAvatar =
    supabaseUserData?.avatar || userData?.avatar || registrationData?.avatar || lsAvatar || "/Avatar02.png";

  const userName =
    supabaseUserData?.full_name || userData?.name || registrationData?.name || lsName || "User";

  // If we have partial data from Supabase, try to fill in missing pieces
  const finalAvatar = userAvatar || "/Avatar01.png";
  const finalName = userName || "User";

  // Debug logging (same as sidebar)
  console.log('🔍 Settings data sources:', {
    supabaseUserData,
    lsAvatar,
    lsName,
    userData: { avatar: userData?.avatar, name: userData?.name },
    registrationData: { avatar: registrationData?.avatar, name: registrationData?.name },
    finalAvatar: finalAvatar,
    finalName: finalName
  });

  // Prefill form fields from Supabase data
  useEffect(() => {
    if (supabaseUserData) {
      // Set avatar from Supabase data
      if (supabaseUserData.avatar) {
        const avatarPath = supabaseUserData.avatar.startsWith("/") 
          ? supabaseUserData.avatar 
          : `/${supabaseUserData.avatar}`;
        console.log('🔄 Setting avatar from Supabase:', avatarPath);
        setAvatar(avatarPath);
      }

      // Set name fields
      if (supabaseUserData.full_name) {
        const { first, last } = splitName(supabaseUserData.full_name);
        setFirstName(first);
        setLastName(last);
        setDisplayName(supabaseUserData.full_name);
      }

      // Set other fields
      if (supabaseUserData.email) {
        setEmail(supabaseUserData.email);
        setWhereEmail(supabaseUserData.email);
      }
      if (supabaseUserData.phone) setPhone(supabaseUserData.phone);
      if (supabaseUserData.bio) setBio(supabaseUserData.bio);
    }
  }, [supabaseUserData]);

  // Update display name when firstName or lastName changes
  useEffect(() => {
    // Only update if we have both names and they're not empty
    if (firstName.trim() && lastName.trim()) {
      const newDisplayName = joinName(firstName, lastName);
      setDisplayName(newDisplayName.trim());
    }
  }, [firstName, lastName]);

  // Update avatar and name from final sources (same as sidebar)
  useEffect(() => {
    // Set avatar from final source
    if (finalAvatar && finalAvatar !== "/Avatar02.png") {
      const avatarPath = finalAvatar.startsWith("/") 
        ? finalAvatar 
        : `/${finalAvatar}`;
      console.log('🔄 Setting avatar from final source:', avatarPath);
      setAvatar(avatarPath);
    }

    // Set name from final source if we don't have form data
    if (!firstName.trim() && !lastName.trim() && finalName && finalName !== "User") {
      const { first, last } = splitName(finalName);
      setFirstName(first);
      setLastName(last);
      setDisplayName(finalName);
      console.log('🔄 Setting name from final source:', finalName);
    }
  }, [finalAvatar, finalName, firstName, lastName]);

  // Force update avatar and name when final sources change (separate effect)
  useEffect(() => {
    console.log('🔄 Final sources changed - forcing update:', { finalAvatar, finalName });
    
    // Force update avatar
    if (finalAvatar && finalAvatar !== "/Avatar02.png") {
      const avatarPath = finalAvatar.startsWith("/") 
        ? finalAvatar 
        : `/${finalAvatar}`;
      console.log('🔄 Force updating avatar to:', avatarPath);
      setAvatar(avatarPath);
    }
    
    // Force update name if we have a valid name
    if (finalName && finalName !== "User") {
      console.log('🔄 Force updating name to:', finalName);
      setDisplayName(finalName);
      
      // Also update form fields if they're empty
      if (!firstName.trim() && !lastName.trim()) {
        const { first, last } = splitName(finalName);
        setFirstName(first);
        setLastName(last);
      }
    }
  }, [finalAvatar, finalName]);

  // Fallback to localStorage if no Supabase data
  useEffect(() => {
    if (!supabaseUserData) {
      try {
        const n = (localStorage.getItem("name") || "").trim();
        const e = (localStorage.getItem("email") || "").trim();
        const p = (localStorage.getItem("fullPhone") || localStorage.getItem("phone") || "").trim();
        const b = localStorage.getItem("bio") || "";

        if (n) {
          const { first, last } = splitName(n);
          setFirstName(first);
          setLastName(last);
          setDisplayName(n);
        }
        if (e) {
          setEmail(e);
          setWhereEmail(e);
        }
        if (p) setPhone(p);
        if (b) setBio(b);
      } catch {
        /* ignore */
      }
    }
  }, [supabaseUserData]);

  // Debug function to check current state (same as sidebar)
  const debugCurrentState = () => {
    console.log('🔍 Settings Current State Debug:', {
      avatar,
      displayName,
      firstName,
      lastName,
      finalAvatar,
      finalName,
      lsName,
      lsAvatar,
      supabaseUserData,
      userData: { avatar: userData?.avatar, name: userData?.name },
      registrationData: { avatar: registrationData?.avatar, name: registrationData?.name }
    });
  };

  const fullName = useMemo(
    () => joinName(firstName, lastName),
    [firstName, lastName]
  );
  
  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );
  
  const phoneValid = useMemo(
    () => /^[0-9+\s-]{7,}$/.test(phone),
    [phone]
  );
  
  const canSave =
    !!firstName.trim() && emailValid && phoneValid && !saving;

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
      console.log('📝 New data:', { fullName, email, phone, bio, currentAvatar: avatar });

      // Update user profile in Supabase
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: email.trim(),
          full_name: fullName.trim(),
          phone: phone.trim(),
          bio: bio.trim() || null,
          avatar: avatar.replace('/', ''), // Remove leading slash for storage
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Error updating profile:', profileError);
        setError("Failed to update profile. Please try again.");
        return;
      }

      console.log('✅ Profile updated in Supabase:', profile);

      // Always update user metadata in auth for name and avatar changes
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
      if (bio.trim()) localStorage.setItem("bio", bio.trim());
      localStorage.setItem("avatar", avatar.replace('/', '')); // Store without leading slash

      // Update local state immediately for better UX
      setWhereEmail(email.trim());
      setDisplayName(fullName.trim());
      
      // Refresh Supabase data to ensure consistency
      await fetchUserDataFromSupabase();
      
      setOk("Profile updated successfully!");
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-5 py-5 rounded-[14px] transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-[#F3F8FF] text-[#00AEEF] font-semibold border border-[#CFE2FF]'
                      : 'hover:bg-[#F8FAFC] text-[#0F172A]/70'
                  }`}
                >
                  My Profile
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-5 py-5 rounded-[14px] transition-colors ${
                    activeTab === 'security'
                      ? 'bg-[#F3F8FF] text-[#00AEEF] font-semibold border border-[#CFE2FF]'
                      : 'hover:bg-[#F8FAFC] text-[#0F172A]/70'
                  }`}
                >
                  Security
                </button>
                <button 
                  onClick={() => setActiveTab('subscription')}
                  className={`w-full text-left px-5 py-5 rounded-[14px] transition-colors ${
                    activeTab === 'subscription'
                      ? 'bg-[#F3F8FF] text-[#00AEEF] font-semibold border border-[#CFE2FF]'
                      : 'hover:bg-[#F8FAFC] text-[#0F172A]/70'
                  }`}
                >
                  Subscription
                </button>
                <button 
                  onClick={() => setActiveTab('firmware')}
                  className={`w-full text-left px-5 py-5 rounded-[14px] transition-colors ${
                    activeTab === 'firmware'
                      ? 'bg-[#F3F8FF] text-[#00AEEF] font-semibold border border-[#CFE2FF]'
                      : 'hover:bg-[#F8FAFC] text-[#0F172A]/70'
                  }`}
                >
                  Firmware
                </button>
                <button 
                  onClick={() => setActiveTab('delete')}
                  className={`w-full text-left px-5 py-5 rounded-[14px] transition-colors ${
                    activeTab === 'delete'
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
                        {displayName}
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
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-[#6B7280]">Last Name</label>
                      <input
                        type="text"
                        className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                        value={lastName}
                        onChange={(ev) => setLastName(ev.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-[#6B7280]">Email</label>
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
                        className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                        value={phone}
                        onChange={(ev) => setPhone(ev.target.value)}
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
                <h2 className="text-[20px] font-extrabold text-[#0F172A] mb-4">Delete Account</h2>
                <p className="text-[14px] text-[#6B7280]">Account deletion will be available soon.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
