"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { APP_BASE_URL } from "@/lib/env";
import { useSidebar } from "@/context/SidebarContext";
import { supabase } from "@/lib/supabaseClient";

/** Vertical ellipsis icon */
const EllipsisV = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="10" cy="4" r="2" fill="#222E3A" />
    <circle cx="10" cy="10" r="2" fill="#222E3A" />
    <circle cx="10" cy="16" r="2" fill="#222E3A" />
  </svg>
);

/** Small check icon */
const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 12l4 4L19 6"
      stroke="#16a34a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Small error icon */
const ErrorIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
      stroke="#dc2626"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function SideNavbar({
  avatar,
  name,
  playgroundActive = true,
  onCollapse,
  onDashboardClick,
  dashboardActive = false,
}: {
  avatar?: string;
  name?: string;
  playgroundActive?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  onDashboardClick?: () => void;
  dashboardActive?: boolean;
}) {
  const { registrationData, userData, updateUserData } = useUser();
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);


  // Contact modal state
  const [contactOpen, setContactOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");
  const [contactFile, setContactFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendOk, setSendOk] = useState<string | null>(null);

  // Function to close contact modal and reset form
  const closeContactModal = () => {
    setContactOpen(false);
    setContactEmail("");
    setContactMessage("");
    setContactFile(null);
    setSendError(null);
    setSendOk(null);
  };

  // localStorage-backed values
  const [lsName, setLsName] = useState<string | null>(null);
  const [lsAvatar, setLsAvatar] = useState<string | null>(null);
  
  // Supabase user data
  const [supabaseUserData, setSupabaseUserData] = useState<{
    full_name?: string;
    avatar?: string;
    email?: string;
  } | null>(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLLabelElement>(null);

  // Fetch user data from Supabase table
  const fetchUserDataFromSupabase = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching user data from Supabase...');
      
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('❌ No authenticated user found in Supabase Auth');
        setError("No authenticated user found");
        setLoading(false);
        return;
      }

      console.log('✅ Found authenticated user:', user.id);
      
      // Fetch user profile from user_profiles table
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, avatar, email')
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
              full_name: userMetadata.full_name || null,
              avatar: userMetadata.avatar || null,
              email: user.email
            };
            setSupabaseUserData(fallbackProfile);
            console.log('✅ Using fallback data from auth metadata:', fallbackProfile);
            setLoading(false);
            return;
          }
        }
        setError("Failed to load user profile");
        setLoading(false);
        return;
      }

      if (profile) {
        // Ensure avatar has proper path
        let avatarPath = profile.avatar;
        if (avatarPath && !avatarPath.startsWith('/') && !avatarPath.startsWith('http')) {
          avatarPath = `/${avatarPath}`;
        }
        
        const updatedProfile = {
          ...profile,
          avatar: avatarPath
        };
        
        setSupabaseUserData(updatedProfile);
        console.log('✅ User profile fetched from Supabase:', updatedProfile);
        
        // Update localStorage with Supabase data for consistency
        if (profile.full_name) {
          localStorage.setItem('name', profile.full_name);
        }
        if (profile.avatar) {
          localStorage.setItem('avatar', profile.avatar);
        }
        if (profile.email) {
          localStorage.setItem('email', profile.email);
        }
      } else {
        console.log('❌ No profile found for user');
        setError("No user profile found");
      }
    } catch (error) {
      console.error('❌ Error fetching user data from Supabase:', error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserDataFromSupabase();
  }, []);

  // Listen for profile updates from settings page
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('🔄 Profile update event received, refreshing sidebar data...');
      fetchUserDataFromSupabase();
    };

    // Listen for custom event when profile is updated
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  // Refresh data periodically to catch changes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserDataFromSupabase();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Try to create user profile if it doesn't exist
  const createUserProfileIfNeeded = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileCheckError && profileCheckError.code === 'PGRST116') {
        console.log('🔄 Creating missing user profile...');
        
        // Try to get data from localStorage or context
        const name = localStorage.getItem('name') || userData?.name || registrationData?.name;
        const avatar = localStorage.getItem('avatar') || userData?.avatar || registrationData?.avatar;
        const email = localStorage.getItem('email') || userData?.email || registrationData?.email;
        
        if (name && avatar && email) {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([{
              user_id: user.id,
              email: email,
              full_name: name,
              avatar: avatar,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }])
            .select('full_name, avatar')
            .single();

          if (createError) {
            console.error('❌ Failed to create profile:', createError);
          } else {
            console.log('✅ Created user profile:', newProfile);
            setSupabaseUserData(newProfile);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
    }
  };

  // Try to create profile after fetching data
  useEffect(() => {
    if (supabaseUserData === null) {
      // Wait a bit then try to create profile
      const timer = setTimeout(createUserProfileIfNeeded, 1000);
      return () => clearTimeout(timer);
    }
  }, [supabaseUserData]);

  // We'll use the user data from Supabase table (what user selected during signup)
  console.log('🔍 Using user data from Supabase table:', {
    supabaseUserData,
    userData,
    registrationData
  });

  // ---- load from localStorage
  const refreshFromLocalStorage = () => {
    try {
      const n = localStorage.getItem("name");
      const a = localStorage.getItem("avatar");
      
      console.log('🔍 localStorage raw values:', { name: n, avatar: a });
      
      setLsName(n && n.trim() ? n.trim() : null);

      // normalize avatar path
      let av = a && a.trim() ? a.trim() : null;
      if (av) {
        if (!av.startsWith("/") && !av.startsWith("http")) av = `/${av}`;
        setLsAvatar(av);
      } else {
        setLsAvatar(null);
      }

      console.log('🔍 localStorage processed values:', { lsName: n && n.trim() ? n.trim() : null, lsAvatar: av });

      // seed contact email from localStorage if present
      const e = localStorage.getItem("email");
      if (e && e.trim()) {
        setContactEmail(e.trim());
      }
    } catch (error) {
      console.error('❌ Error reading localStorage:', error);
    }
  };

  useEffect(() => {
    refreshFromLocalStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refresh when window regains focus or another tab updates storage
  useEffect(() => {
    // const onFocus = () => refreshFromLocalStorage();
    const onStorage = () => refreshFromLocalStorage();
    const onAvatarChanged = (event: CustomEvent) => {
      console.log('🔄 Avatar changed event received:', event.detail);
      refreshFromLocalStorage();
    };
    
    // window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    window.addEventListener("avatarChanged", onAvatarChanged as EventListener);
    
    return () => {
      // window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("avatarChanged", onAvatarChanged as EventListener);
    };
  }, []);


  // close menus on outside click / Esc
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuContainerRef.current?.contains(e.target as Node))
        setMenuOpen(false);
      if (!helpMenuRef.current?.contains(e.target as Node))
        setHelpMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setHelpMenuOpen(false);
        setContactOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // final sources (prefer Supabase table → context → localStorage → default)
  const userAvatar = (() => {
    // Priority: Supabase > localStorage > props > context > default
    if (supabaseUserData?.avatar) {
      return supabaseUserData.avatar;
    }
    if (lsAvatar) {
      return lsAvatar;
    }
    if (avatar) {
      return avatar;
    }
    if (userData?.avatar) {
      return userData.avatar;
    }
    if (registrationData?.avatar) {
      return registrationData.avatar;
    }
    return "/User.png";
  })();

  const userName = (() => {
    // Priority: Supabase > localStorage > props > context > default
    if (supabaseUserData?.full_name) {
      return supabaseUserData.full_name;
    }
    if (lsName) {
      return lsName;
    }
    if (name) {
      return name;
    }
    if (userData?.name) {
      return userData.name;
    }
    if (registrationData?.name) {
      return registrationData.name;
    }
    return "User";
  })();

  // Ensure avatar has proper path
  const finalAvatar = (() => {
    if (!userAvatar) return "/Avatar01.png";
    if (userAvatar.startsWith('/') || userAvatar.startsWith('http')) {
      return userAvatar;
    }
    return `/${userAvatar}`;
  })();

  const finalName = userName || "User";

  // Debug logging
  console.log('🔍 SideNavbar data sources:', {
    supabaseUserData,
    lsAvatar,
    lsName,
    userData: { avatar: userData?.avatar, name: userData?.name },
    registrationData: { avatar: registrationData.avatar, name: registrationData.name },
    finalAvatar: finalAvatar,
    finalName: finalName
  });

  const hasCompletedMission2 = userData?.hasCompletedMission2 || false;

  const navItems = [
    {
      icon: "/home.svg",
      label: "Home",
      href: "/home",
      active: pathname === "/home",
    },
    {
      icon: "/missions.svg",
      label: "Missions",
      href: "/missions",
      active: pathname === "/missions",
    },
    hasCompletedMission2
      ? {
          icon: "/playground.svg",
          label: "Playground",
          href: "/playground",
          active: pathname === "/playground",
        }
      : {
          icon: "/playground.svg",
          label: "Playground",
          href: "#",
          disabled: true as const,
        },
    {
      icon: "/demo.svg",
      label: "Demo",
      href: "/demo",
      active: pathname === "/demo",
    },
    {
      icon: "/projects.svg",
      label: "Projects",
      href: "/projects",
      active: pathname === "/projects",
    },
  ];

  const handleLogout = () => {
    updateUserData({});
    localStorage.clear();
    router.push(`${APP_BASE_URL}/`);
  };

  // Open contact modal from Help menu
  const openContact = () => {
    setHelpMenuOpen(false);
    setSendError(null);
    setSendOk(null);
    
    // Always refresh email from localStorage when opening modal
    const storedEmail = localStorage.getItem("email");
    console.log('🔍 Opening contact modal, stored email:', storedEmail);
    if (storedEmail && storedEmail.trim()) {
      setContactEmail(storedEmail.trim());
      console.log('✅ Set contact email to:', storedEmail.trim());
    } else {
      console.log('❌ No email found in localStorage');
    }
    
    setContactOpen(true);
  };

  // File selection
  const onFileChange = (file: File | null) => {
    if (!file) {
      setContactFile(null);
      return;
    }
    // basic size/type checks (optional)
    if (!file.type.startsWith("image/")) {
      setSendError("Please upload an image (PNG/JPG/WebP).");
      return;
    }
    // ~5MB soft cap
    if (file.size > 5 * 1024 * 1024) {
      setSendError("Image is too large (max 5MB).");
      return;
    }
    setSendError(null);
    setContactFile(file);
  };

  // Drag & drop handlers
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = (ev: DragEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
    };
    const onDrop = (ev: DragEvent) => {
      prevent(ev);
      const dt = ev.dataTransfer;
      if (!dt || !dt.files?.length) return;
      const file = dt.files[0];
      onFileChange(file);
    };
    el.addEventListener("dragenter", prevent);
    el.addEventListener("dragover", prevent);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragenter", prevent as EventListener);
      el.removeEventListener("dragover", prevent as EventListener);
      el.removeEventListener("drop", onDrop as EventListener);
    };
  }, []);

  // Send contact form to backend
  const submitContact = async () => {
    setSendError(null);
    setSendOk(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail.trim())) {
      setSendError("Please enter a valid email.");
      return;
    }
    if (contactMessage.trim().length < 5) {
      setSendError("Please enter a longer message.");
      return;
    }

    setSending(true);
    try {
      const form = new FormData();
      form.append("email", contactEmail.trim());
      form.append("message", contactMessage.trim());
      if (contactFile) form.append("file", contactFile);

      // Use the local API route
      const res = await fetch("/api/support/contact", {
        method: "POST",
        body: form,
      });

      const data = await res
        .json()
        .catch(() => ({} as Record<string, unknown>));
      if (!res.ok) {
        setSendError(
          (data as { message?: string })?.message ||
            "Failed to send. Please try again."
        );
        setSending(false);
        return;
      }

      setSendOk("Your message has been sent. We’ll get back to you soon.");
      // reset fields
      setContactEmail("");
      setContactMessage("");
      setContactFile(null);
    } catch {
      setSendError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <aside
      className={`flex flex-col justify-between items-center h-screen ${
        sidebarCollapsed ? "w-[80px]" : "w-[260px]"
      } bg-[#F8F9FC] rounded-r-3xl py-6 px-2 shadow-2xl`}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
      }}
    >
      {/* rounded-corner fillers */}
      <div
        className="absolute top-0 right-0 w-6 h-6 bg-[#F8F9FC]"
        style={{
          borderTopRightRadius: "24px",
          borderBottomLeftRadius: "24px",
          zIndex: 1,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-6 h-6 bg-[#F8F9FC]"
        style={{
          borderBottomRightRadius: "24px",
          borderTopLeftRadius: "24px",
          zIndex: 1,
        }}
      />

      {/* Logo */}
      <div
        className={`mb-8 w-full flex justify-center ${
          sidebarCollapsed ? "px-0" : "px-2"
        }`}
        style={{ zIndex: 2 }}
      >
        <div
          className={`bg-white rounded-2xl flex items-center justify-center ${
            sidebarCollapsed ? "w-14 h-14" : "w-[150px] h-[50px]"
          }`}
        >
          <Image
            src={
              sidebarCollapsed
                ? "/BuddyNeo-collapsed.svg"
                : "/BuddyNeo-expanded.svg"
            }
            alt="BuddyNeo Logo"
            width={sidebarCollapsed ? 40 : 120}
            height={sidebarCollapsed ? 40 : 40}
          />
        </div>
      </div>

      {/* Navigation */}
      <div
        className="flex-1 flex flex-col justify-center items-center w-full"
        style={{ zIndex: 2 }}
      >
        <nav
          className={`flex flex-col ${
            sidebarCollapsed ? "gap-4" : "gap-6"
          } items-start w-full ${sidebarCollapsed ? "pl-2" : "pl-8"}`}
        >
          {navItems.map((item) =>
            "disabled" in item && item.disabled ? (
              <div
                key={item.label}
                className={`flex flex-row items-center gap-3 cursor-not-allowed select-none ${
                  sidebarCollapsed ? "w-12 justify-center px-0" : "w-[80%] px-4"
                } py-3`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={25}
                  height={25}
                  style={{ filter: "grayscale(1)", opacity: 1 }}
                />
                {!sidebarCollapsed && (
                  <span
                    className="text-base font-semibold"
                    style={{ color: "#BDC8D5" }}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={(item as any).href}
                className={`flex flex-row items-center gap-3 ${
                  sidebarCollapsed ? "w-12 justify-center px-0" : "w-[80%] px-4"
                } py-3 rounded-2xl ${
                  item.active
                    ? "border border-[#00AEEF] bg-white shadow-sm"
                    : "hover:bg-[#F0F4F8] transition-colors"
                }`}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                />
                {!sidebarCollapsed && (
                  <span className="text-base font-semibold text-[#222E3A]">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          )}

          {/* Help Button */}
          <div
            ref={helpMenuRef}
            className={`relative flex flex-row items-center gap-3 ${
              sidebarCollapsed ? "w-12 justify-center px-0" : "w-[80%] px-4"
            } py-3 rounded-2xl hover:bg-[#F0F4F8] transition-colors cursor-pointer`}
            onClick={() => setHelpMenuOpen(!helpMenuOpen)}
          >
            <Image src="/help.svg" alt="Help" width={24} height={24} />
            {!sidebarCollapsed && (
              <span className="text-base font-semibold text-[#222E3A]">
                Help
              </span>
            )}

            {/* Help Dropdown Menu */}
            {helpMenuOpen && (
              <div
                className={`absolute ${
                  sidebarCollapsed
                    ? "left-full ml-2 top-0"
                    : "left-0 bottom-full mb-2"
                } w-48 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50`}
                role="menu"
              >
                {/* tiny arrow */}
                <div
                  className={`absolute ${
                    sidebarCollapsed ? "left-0 -ml-1 top-4" : "left-4 -bottom-1"
                  } w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100`}
                />
                <button
                  className="w-full flex items-center gap-2 text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-black"
                  onClick={() => {
                    setHelpMenuOpen(false);
                    router.push("/faq");
                  }}
                  role="menuitem"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                      stroke="#111827"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"
                      stroke="#111827"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  FAQ
                </button>
                <div className="h-px bg-gray-100" />
                <button
                  className="w-full flex items-center gap-2 text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-black"
                  onClick={openContact}
                  role="menuitem"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      stroke="#111827"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M22 6l-10 7L2 6"
                      stroke="#111827"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Contact Us
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Profile card with dropdown menu */}
      <div
        className="w-full flex flex-col items-center mb-2 gap-2"
        style={{ zIndex: 2 }}
      >
        <div
          ref={menuContainerRef}
          className={`relative bg-white rounded-2xl shadow-sm mt-2 ${
            sidebarCollapsed ? "w-12 px-0" : "w-[90%] px-3"
          } flex items-center ${
            sidebarCollapsed
              ? "flex-col justify-center"
              : "flex-row justify-between"
          }`}
        >
          {/* Avatar + Name link */}
          <Link
            href="/profile"
            className={`flex ${
              sidebarCollapsed
                ? "flex-col items-center gap-1"
                : "flex-row items-center gap-2"
            } py-2`}
          >
            <div className="w-10 h-10 rounded-full bg-[#FFFBEA] flex items-center justify-center overflow-hidden">
              {loading ? (
                <div className="w-6 h-6 border-2 border-[#222E3A] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Image
                  src={finalAvatar}
                  alt="User Avatar"
                  width={36}
                  height={36}
                  className="object-cover"
                />
              )}
            </div>
            {!sidebarCollapsed && (
              <span className="text-base font-semibold text-[#222E3A]">
                {loading ? "Loading..." : finalName}
              </span>
            )}
          </Link>

          {/* 3-dot button (inside card) */}
          <button
            type="button"
            className={`flex items-center justify-center rounded-full hover:bg-[#ECEFF3] transition-colors ${
              sidebarCollapsed ? "mb-2 mt-1 w-8 h-8" : "w-9 h-9"
            }`}
            aria-label="Profile menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <EllipsisV />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              className={`absolute ${
                sidebarCollapsed
                  ? "left-1/2 -translate-x-1/2 bottom-14"
                  : "right-2 bottom-12"
              } w-48 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[200]`}
              role="menu"
            >
              {/* tiny arrow */}
              <div
                className={`absolute ${
                  sidebarCollapsed
                    ? "left-1/2 -translate-x-1/2 -bottom-2"
                    : "right-4 -bottom-2"
                } w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100`}
              />
              <button
                className="w-full flex items-center gap-2 text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-black"
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/settings");
                }}
                role="menuitem"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"
                    stroke="#111827"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M19.4 15l1.6.9-1.6 2.8-1.6-.9a7.8 0 01-1.9 1.1l-.3 1.8h-3.2l-.3-1.8a7.8 0 01-1.9-1.1l-1.6.9L3 15.9l1.6-.9A7.4 0 014 12c0-1.1.2-2.1.6-3.1L3 8l1.6-2.8 1.6.9c.6-.5 1.2-.8 1.9-1.1l.3-1.8h3.2l.3 1.8c.7.3 1.3.6 1.9 1.1l1.6-.9L21 8l-1.6.9c.4 1 .6 2 .6 3.1 0 1.1-.2 2.1-.6 3z"
                    stroke="#111827"
                    strokeWidth="1.2"
                  />
                </svg>
                Settings
              </button>
              <div className="h-px bg-gray-100" />
              <button
                className="w-full flex items-center gap-2 text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-red-600"
                onClick={handleLogout}
                role="menuitem"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M15 17l5-5-5-5"
                    stroke="#DC2626"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 12H9"
                    stroke="#DC2626"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 19a7 7 0 110-14"
                    stroke="#DC2626"
                    strokeWidth="1.2"
                  />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collapse/Expand Handle */}
      <button
        className={`absolute top-1/2 right-0 -translate-y-1/2 w-3 h-12 flex items-center justify-center group transition-transform ${
          sidebarCollapsed ? "scale-x-[-1]" : ""
        }`}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          outline: "none",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          zIndex: 3,
        }}
      >
        <div className="w-2 h-8 bg-[#E0E6ED] rounded-full shadow-inner group-hover:bg-[#00AEEF] transition-colors" />
      </button>

      {/* Contact Us Modal */}
      {contactOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setContactOpen(false)}
          />
          {/* card */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-[92vw] max-w-[520px] p-6 z-[10000]">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-extrabold text-[#0F172A]">
                Contact Support
              </h3>
              <button
                aria-label="Close"
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                onClick={closeContactModal}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="#64748B"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <p className="text-sm text-[#475569] mb-4">
              Send us a message and we’ll email you back at{" "}
              <span className="font-semibold">info@magicbit.cc</span>.
            </p>

            {sendError && (
              <div className="mb-3 flex items-center gap-2 text-sm text-red-600">
                <ErrorIcon /> <span>{sendError}</span>
              </div>
            )}
            {sendOk && (
              <div className="mb-3 flex items-center gap-2 text-sm text-green-600">
                <CheckIcon /> <span>{sendOk}</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#6B7280]">Your email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] text-black"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#6B7280]">Message</label>
                <textarea
                  className="rounded-xl border border-[#E5E7EB] px-4 py-3 outline-none focus:ring-2 focus:ring-[#CFE2FF] focus:border-[#93C5FD] min-h-[120px] resize-vertical text-black"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell us how we can help…"
                  maxLength={1500}
                />
                <div className="text-xs text-[#94a3b8] self-end">
                  {contactMessage.length}/1500
                </div>
              </div>

              {/* Attachment */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#6B7280]">
                  Attachment (optional)
                </label>

                <label
                  ref={dropRef}
                  htmlFor="contact-file"
                  className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#CBD5E1] px-4 py-6 text-center cursor-pointer hover:border-[#93C5FD]"
                  title="Click or drop an image"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="#64748B"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-sm text-[#64748B]">
                    {contactFile
                      ? `Selected: ${contactFile.name}`
                      : "Click to upload or drag & drop an image"}
                  </span>
                  <input
                    id="contact-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              {/* Actions */}
              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-xl border border-[#E5E7EB] hover:bg-gray-50"
                  onClick={closeContactModal}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-xl text-white ${
                    sending
                      ? "bg-[#7ccfea]"
                      : "bg-[#00AEEF] hover:brightness-110"
                  }`}
                  onClick={submitContact}
                  disabled={sending}
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
