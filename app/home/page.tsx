"use client";
import SideNavbar from "@/components/SideNavbar";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import LetsGoButton from "@/components/LetsGoButton";
import TipOfTheDayCard from "@/components/TipOfTheDayCard";
import { useUser } from "@/context/UserContext";
import BasicAuthGuard from "@/components/BasicAuthGuard";
import { supabase } from "@/lib/supabaseClient";

function useTypingEffect(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed(""); // Reset on text change
    if (!text) return;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
}

export default function HomePage() {
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, updateUserData } = useUser();
  const [isFirstTimeOAuth, setIsFirstTimeOAuth] = useState(false);
  const [showProfileUpdateNotification, setShowProfileUpdateNotification] =
    useState(false);
  const [userName, setUserName] = useState<string>("");
  const [isNameLoaded, setIsNameLoaded] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const mainTextStep = useTypingEffect("I'm your Robot.");
  const subTextStep = useTypingEffect("Let's get things up!");
  const [isNewUser, setIsNewUser] = useState(false);

  // Get user name from Supabase user profiles (prioritize Supabase over Google account)
  useEffect(() => {
    // Only run after component is mounted on client side
    if (!mounted) return;

    const getUserName = async () => {
      try {
        console.log("🔍 Getting user name from Supabase user profiles...");

        // First, check direct "name" key in localStorage (highest priority)
        const directName = localStorage.getItem("name");
        console.log("🔍 Direct name from localStorage:", directName);
        if (directName && directName.trim()) {
          console.log(
            "✅ Using direct name from localStorage:",
            directName.trim()
          );
          return directName.trim();
        }

        // Then check other localStorage keys for name
        const possibleKeys = ["userData", "registrationData"];

        for (const key of possibleKeys) {
          const value = localStorage.getItem(key);
          console.log(`🔍 Checking ${key}:`, value);

          if (value) {
            try {
              const parsed = JSON.parse(value);
              if (parsed.name && parsed.name.trim()) {
                console.log(`✅ Using name from ${key}:`, parsed.name.trim());
                return parsed.name.trim();
              }
            } catch {
              // Skip if not JSON
              continue;
            }
          }
        }

        // Try to get name from Supabase user profiles
        try {
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser();
          if (!authError && user) {
            console.log("🔍 Fetching user profile from Supabase...");
            const { data: profile, error: profileError } = await supabase
              .from("user_profiles")
              .select("full_name")
              .eq("user_id", user.id)
              .single();

            if (!profileError && profile?.full_name) {
              console.log(
                "✅ Using name from Supabase user profile:",
                profile.full_name
              );
              return profile.full_name.trim();
            }
          }
        } catch (supabaseError) {
          console.log("❌ Error fetching from Supabase:", supabaseError);
        }

        // Only use Google account name as last resort
        if (userData?.name && userData.name.trim()) {
          console.log(
            "✅ Using Google account name as fallback:",
            userData.name.trim()
          );
          return userData.name.trim();
        }

        console.log("❌ No name found in localStorage, Supabase, or userData");
        return "";
      } catch (error) {
        console.error("Error reading user name:", error);
        return "";
      }
    };

    const loadName = async () => {
      const name = await getUserName();
      console.log("🔍 Final userName set to:", name);
      setUserName(name);
      setIsNameLoaded(true);
    };

    loadName();
  }, [userData, mounted]);

  // Listen for localStorage changes to update name
  useEffect(() => {
    const handleStorageChange = () => {
      console.log("🔄 localStorage changed, refreshing name...");
      const directName = localStorage.getItem("name");
      if (directName && directName.trim()) {
        console.log("✅ Name updated from localStorage:", directName.trim());
        setUserName(directName.trim());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
    setIsHydrated(true);
    setHydrated(true);

    // Immediately try to get name from localStorage
    const directName = localStorage.getItem("name");
    if (directName && directName.trim()) {
      console.log(
        "🚀 Immediate name load from localStorage:",
        directName.trim()
      );
      setUserName(directName.trim());
      setIsNameLoaded(true);
    } else {
      // If no localStorage name, try to get from Supabase immediately
      const loadFromSupabase = async () => {
        try {
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser();
          if (!authError && user) {
            const { data: profile, error: profileError } = await supabase
              .from("user_profiles")
              .select("full_name")
              .eq("user_id", user.id)
              .single();

            if (!profileError && profile?.full_name) {
              console.log(
                "🚀 Immediate name load from Supabase:",
                profile.full_name
              );
              setUserName(profile.full_name.trim());
              setIsNameLoaded(true);
            }
          }
        } catch (error) {
          console.log("❌ Error in immediate Supabase load:", error);
        }
      };
      loadFromSupabase();
    }

    // Check if this is a new user from signup process
    const isNewUserFromSignup = searchParams.get("newUser") === "true";
    const isOnboarding = searchParams.get("onboarding") === "true";

    if (isNewUserFromSignup && isOnboarding) {
      console.log("🆕 New user from signup process - showing onboarding");
      router.replace("/home?newUser=true&onboarding=true");
      setIsNewUser(true);
    } else if (isNewUserFromSignup && !isOnboarding) {
      // User came from signup but no onboarding flag - redirect to onboarding
      console.log("🔄 New user from signup - redirecting to onboarding");
      router.replace("/home?newUser=true&onboarding=true");
      setIsNewUser(true);
    }

    // Check if user returned from settings with profile update
    const profileUpdated = searchParams.get("profileUpdated") === "true";
    if (profileUpdated) {
      console.log("🔄 User returned from settings, checking profile status...");
      router.replace("/home"); // Clean up URL
      // Refresh profile status to check if notification should be hidden
      setTimeout(() => refreshProfileStatus(), 500); // Small delay to ensure settings page has saved
    }

    // Check if user is new based on mission progress (for existing users who haven't completed missions)
    // User is considered "new" until Mission 2 is completed
    if (
      userData?.isNewUser ||
      (userData?.missionProgress !== undefined && userData?.missionProgress < 2)
    ) {
      // Only set as new user if they didn't come from signup (to avoid double onboarding)
      if (!isNewUserFromSignup) {
        setIsNewUser(true);
      }
    } else {
      // User has completed Mission 2, they are no longer "new"
      setIsNewUser(false);
    }

    // Check if this is a first-time Google OAuth user
    const checkFirstTimeOAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // Check if user has a profile and get all profile details
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("user_id, created_at, full_name, phone, age, avatar")
            .eq("user_id", user.id)
            .single();

          if (profile) {
            // Check if this is a first-time OAuth user by looking at:
            // 1. No mission progress (missionProgress === 0 or undefined)
            // 2. Profile was created recently (within last 24 hours)
            const isNewProfile =
              new Date(profile.created_at) >
              new Date(Date.now() - 24 * 60 * 60 * 1000);
            const hasNoMissionProgress =
              !userData?.missionProgress || userData.missionProgress === 0;

            // Check if profile is complete (has name, phone, age, and avatar)
            const isProfileComplete =
              profile.full_name &&
              profile.phone &&
              profile.age &&
              profile.avatar;

            if (isNewProfile && hasNoMissionProgress && !isProfileComplete) {
              // Show notification only if profile is incomplete
              setIsFirstTimeOAuth(true);
              setShowProfileUpdateNotification(true);
              console.log(
                "🆕 First-time OAuth user detected - new profile and incomplete profile"
              );
            } else if (isProfileComplete) {
              // Profile is complete, hide notification
              setShowProfileUpdateNotification(false);
              setIsFirstTimeOAuth(false);
              console.log("✅ Profile is complete, hiding notification");
            } else {
              // Returning user but profile incomplete
              setShowProfileUpdateNotification(true);
              console.log("⚠️ Returning OAuth user with incomplete profile");
            }
          }
        }
      } catch (error) {
        console.log("🔍 Error checking first-time OAuth status:", error);
      }
    };

    checkFirstTimeOAuth();
  }, [searchParams, router, userData]);

  // Function to refresh profile status (can be called when returning from settings)
  const refreshProfileStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("full_name, phone, age, avatar")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          const isProfileComplete =
            profile.full_name && profile.phone && profile.age && profile.avatar;

          if (isProfileComplete) {
            setShowProfileUpdateNotification(false);
            setIsFirstTimeOAuth(false);
            console.log("✅ Profile completed, notification hidden");
          } else {
            setShowProfileUpdateNotification(true);
            console.log("⚠️ Profile still incomplete, notification shown");
          }
        }
      }
    } catch (error) {
      console.log("🔍 Error refreshing profile status:", error);
    }
  };

  // Listen for navigation back to home (when user returns from settings)
  useEffect(() => {
    const handleFocus = () => {
      // Check profile status when user returns to the page
      refreshProfileStatus();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleSidebarCollapsed = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener(
      "sidebarCollapsed",
      handleSidebarCollapsed as EventListener
    );

    return () => {
      window.removeEventListener(
        "sidebarCollapsed",
        handleSidebarCollapsed as EventListener
      );
    };
  }, []);

  // New User Home step logic
  useEffect(() => {
    if (userData?.isNewUser && step < 2) {
      const timer = setTimeout(() => setStep(step + 1), 2000);
      return () => clearTimeout(timer);
    }
  }, [step, userData?.isNewUser]);

  // Listen for mission completion events to update progress in real-time
  useEffect(() => {
    const handleMissionCompleted = async (event: CustomEvent) => {
      console.log("🎯 [Home] Mission completed event received:", event.detail);

      if (userData?._id) {
        try {
          // Import the getUserProgress function
          const { getUserProgress } = await import("@/utils/queries");

          // Refresh user data from database
          const freshUserData = await getUserProgress(userData._id);
          if (freshUserData) {
            console.log("🎯 [Home] Refreshing user data:", freshUserData);

            // Update the user data in context
            updateUserData({
              xp: freshUserData.xp || 0,
              missionProgress: freshUserData.current_mission || 0,
              hasCompletedMission2: (freshUserData.current_mission || 0) >= 2,
            });
          }
        } catch (error) {
          console.error("🎯 [Home] Failed to refresh user data:", error);
        }
      }
    };

    window.addEventListener(
      "missionCompleted",
      handleMissionCompleted as unknown as EventListener
    );

    return () => {
      window.removeEventListener(
        "missionCompleted",
        handleMissionCompleted as unknown as EventListener
      );
    };
  }, [userData?._id, updateUserData]);

  // Real user data for mission progress
  const totalSteps = 5; // Total number of missions
  const completedSteps = userData?.missionProgress || 0; // Current mission progress
  const xpPoints = userData?.xp || 0; // User's XP points

  // Determine the next mission (assuming missionProgress is the last completed mission)
  // Mission UIDs are strings like "01", "02", etc.
  const nextMissionNumber = (userData?.missionProgress ?? 0) + 1;
  const nextMission = String(nextMissionNumber).padStart(2, "0");
  const missionLabel = `Mission ${nextMission}`;

  const progressPercent =
    totalSteps > 0 ? ((userData?.missionProgress || 0) / totalSteps) * 100 : 0;

  // Dummy data for badges
  const badges = [
    { src: "/badge1.png", alt: "Badge1", earned: true },
    { src: "/badge2.png", alt: "Badge2", earned: true },
    { src: "/badge3.png", alt: "Badge3", earned: false },
    { src: "/badge4.png", alt: "Badge4", earned: false },
    { src: "/badge5.png", alt: "Badge5", earned: false },
    { src: "/badge6.png", alt: "Badge6", earned: false },
    { src: "/badge6.png", alt: "Badge7", earned: false },
    { src: "/badge5.png", alt: "Badge8", earned: false },
  ];

  // Dummy battery level (0-100)
  const batteryLevel = 68;

  const newUserContent = useMemo(() => {
    return (
      <div className="flex flex-1 w-full h-full relative animate-fade-in">
        <div className="flex flex-col justify-center items-start min-w-[320px] px-32 pt-24 z-10  ml-40">
          <div className="text-4xl md:text-5xl font-extrabold text-[#222E3A] mb-4">
            {mainTextStep}
          </div>
          <div className="text-3xl text-[#555] font-poppins mb-18">
            {subTextStep}
          </div>
          <LetsGoButton
            style={{ width: 200, height: 60 }}
            onClick={() => router.push(`/missions/${nextMission}`)}
          >
            Lets Go
          </LetsGoButton>
        </div>
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
          className="absolute bottom-0 right-0 flex items-end justify-end"
          style={{ width: "min(60vw, 700px)", height: "min(90vh, 700px)" }}
        >
          <Image
            src="/welcome-robot.png"
            alt="Robot"
            width={450}
            height={450}
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </motion.div>
      </div>
    );
  }, [router, mainTextStep, subTextStep, nextMission, userName]);

  // Default Home (after Mission 2)
  const defaultHomeContent = (
    <div className="flex flex-col w-full relative animate-fade-in px-4 sm:px-6 md:px-8 lg:px-12 pt-4 sm:pt-6 md:pt-8 lg:pt-12 pb-20 sm:pb-24 md:pb-32 lg:pb-0">
      {/* Mobile Mission Progress Bar - Top of page */}
      <div className="lg:hidden w-full flex flex-col items-center mb-4">
        <div className="w-full flex flex-row items-center justify-between mb-2">
          <span className="text-sm sm:text-base font-bold text-[#00AEEF]">
            {missionLabel}
          </span>
          <span className="text-sm sm:text-base font-bold text-[#00AEEF]">
            {xpPoints} XP
          </span>
        </div>
        <div className="w-full h-2 sm:h-3 rounded-full bg-[#E5EAF1] flex overflow-hidden">
          <div
            className="bg-[#00AEEF] h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between w-full max-w-7xl mx-auto gap-6 lg:gap-0">
        {/* Left: Welcome and Mission */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-5 md:gap-6 min-w-0 lg:min-w-[400px]">
          <div className="mb-2">
            <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#FF9C32]">
              Welcome back!
            </span>
            <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#222E3A] mt-1 flex items-center gap-2">
              {!mounted ? (
                <span className="animate-pulse bg-gray-200 h-8 w-24 rounded"></span>
              ) : !isNameLoaded ? (
                <span className="animate-pulse">Loading...</span>
              ) : userName ? (
                userName
              ) : (
                ""
              )}{" "}
            </div>
          </div>
          {/* Mission Card */}
          <div className="rounded-2xl overflow-hidden shadow bg-white relative flex flex-col max-w-3xl w-full">
            <Image
              src="/continue mission-image.png"
              alt="Mission"
              width={500}
              height={300}
              className="object-cover w-full h-[200px] sm:h-[250px] md:h-[300px]"
            />
            <button
              onClick={() => router.push(`/missions/${nextMission}`)}
              className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 bg-black text-white font-bold rounded-full px-4 sm:px-6 md:px-8 py-2 sm:py-3 flex items-center gap-2 text-sm sm:text-base md:text-lg shadow-lg hover:bg-[#222] transition"
            >
              Continue mission{" "}
              <span className="inline-block">
                <svg
                  width="20"
                  height="20"
                  className="sm:w-6 sm:h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
          {/* Project of the week - new layout */}
          <div className="rounded-2xl bg-white shadow flex flex-col sm:flex-row items-stretch p-0 mt-0 overflow-hidden max-w-3xl w-full">
            {/* Left: Text */}
            <div className="flex flex-col justify-center p-4 sm:p-6 md:p-8 flex-1 min-w-0 sm:min-w-[220px] h-full">
              <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                <span className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black shadow-lg">
                  <Image
                    src="/project-week-icon.png"
                    alt="project-week-icon"
                    width={18}
                    height={18}
                    className="sm:w-[22px] sm:h-[22px]"
                  />
                </span>
                <span className="text-sm sm:text-base md:text-lg font-medium text-[#222E3A]">
                  Project of the week
                </span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#222E3A] mb-1 sm:mb-2">
                Boxing Champ
              </div>
              <div className="text-sm sm:text-base text-[#555] font-normal">
                Lorem ipsum dolor sit amet consectetur.
              </div>
            </div>
            {/* Right: Image */}
            <div className="flex-shrink-0 w-full sm:w-[260px] md:w-[320px] lg:w-[340px] h-full relative overflow-hidden m-0 p-0">
              <Image
                src="/project-image-4.png"
                alt="Project of the Week"
                fill
                className="object-cover"
                style={{
                  objectPosition: "center",
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  margin: 0,
                  padding: 0,
                }}
              />
            </div>
          </div>
        </div>
        {/* Right: Mission Progress, Badges, Battery, Tip */}
        <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 min-w-0 lg:min-w-[340px] lg:ml-12 lg:w-[380px] justify-start w-full">
          {/* Mission Progress Bar - Desktop Only */}
          <div className="hidden lg:flex w-full flex-col items-center mb-2">
            <div className="w-full flex flex-row items-center justify-between mb-2">
              <span className="text-sm sm:text-base md:text-lg font-bold text-[#00AEEF]">
                {missionLabel}
              </span>
              <span className="text-sm sm:text-base md:text-lg font-bold text-[#00AEEF]">
                {xpPoints} XP
              </span>
            </div>
            <div className="w-full h-2 sm:h-3 rounded-full bg-[#E5EAF1] flex overflow-hidden">
              <div
                className="bg-[#00AEEF] h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Badges */}
          <div className="rounded-2xl border border-[#E0E6ED] bg-white p-3 sm:p-4 flex flex-col mt-6 sm:mt-8 lg:mt-10">
            <div className="font-bold text-[#222E3A] mb-2 text-sm sm:text-base">
              My Badges
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {badges.map((badge, idx) => (
                <span key={idx} className="flex items-center justify-center">
                  <Image
                    src={badge.src}
                    alt={badge.alt}
                    width={50}
                    height={50}
                    className="sm:w-[65px] sm:h-[65px]"
                    style={
                      badge.earned
                        ? {}
                        : { filter: "grayscale(1)", opacity: 0.5 }
                    }
                  />
                </span>
              ))}
            </div>
          </div>
          {/* Battery */}
          <div className="rounded-2xl bg-white shadow flex flex-row items-center p-4 sm:p-6 gap-4 sm:gap-6 min-h-[70px] sm:min-h-[80px] w-full">
            <span className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#00AEEF] shadow-lg">
              <Image
                src="/power-icon.png"
                alt="Battery"
                width={16}
                height={16}
                className="sm:w-5 sm:h-5"
              />
            </span>
            <div className="text-lg sm:text-xl font-bold text-[#222E3A] ml-2">
              Battery
            </div>
            <div className="flex-1 flex justify-end items-center">
              {/* Battery Icon */}
              <div
                className="relative flex items-center sm:w-[120px] sm:h-[48px]"
                style={{ width: 100, height: 40 }}
              >
                {/* Battery outline */}
                <div
                  className="absolute left-0 top-0 w-full h-full rounded-[10px] sm:rounded-[12px] border-2 border-[#E5EAF1] bg-white"
                  style={{ boxShadow: "0 2px 8px #0001" }}
                ></div>
                {/* Battery fill */}
                <div
                  className="absolute left-0 top-0 h-full rounded-l-[8px] sm:rounded-l-[10px] bg-gradient-to-b from-[#B6FF7A] to-[#7ED957]"
                  style={{
                    width: `${Math.max(0, Math.min(100, batteryLevel))}%`,
                    transition: "width 0.5s",
                    zIndex: 1,
                  }}
                ></div>
                {/* Battery tip */}
                <div
                  className="absolute right-[-10px] sm:right-[-12px] top-1/4 w-5 h-1/2 sm:w-6 sm:h-1/2 bg-white border-2 border-[#E5EAF1] rounded-r-[5px] sm:rounded-r-[6px]"
                  style={{ zIndex: 2 }}
                ></div>
                {/* Battery percentage */}
                <span
                  className="absolute left-0 top-0 w-full h-full flex items-center justify-center text-sm sm:text-lg font-bold"
                  style={{
                    zIndex: 3,
                    color: batteryLevel > 20 ? "#222E3A" : "#FF4D4F",
                  }}
                >
                  {batteryLevel}%
                </span>
              </div>
            </div>
          </div>
          {/* Tip of the day */}
          <TipOfTheDayCard />
        </div>
      </div>
    </div>
  );

  // Clean conditional rendering based on mission progress
  if (!hydrated) {
    return null; // Still loading
  }

  // Get user data from context or localStorage fallback

  // Check if user came from signup flow (newUser=true in URL)
  const isFromSignup = searchParams.get("newUser") === "true";
  const isOnboarding = searchParams.get("onboarding") === "true";

  // Simple transition logic: Show new user home until Mission 2 is completed
  // Mission progress 0 = Mission 1 not started, 1 = Mission 1 completed, 2 = Mission 2 completed
  const shouldShowNewUserHome = (userData?.missionProgress ?? 0) < 2;
  const shouldShowDefaultHome = (userData?.missionProgress ?? 0) >= 2;

  // Show onboarding ONLY for new users who came from signup flow
  const shouldShowOnboarding = isNewUser && isFromSignup && isOnboarding;

  console.log("🔍 User data:", userData);
  console.log("🔍 Mission progress:", userData?.missionProgress);
  console.log("🔍 shouldShowNewUserHome:", shouldShowNewUserHome);
  console.log("🔍 shouldShowDefaultHome:", shouldShowDefaultHome);
  console.log("🔍 isFromSignup:", isFromSignup);
  console.log("🔍 isOnboarding:", isOnboarding);
  console.log("🔍 shouldShowOnboarding:", shouldShowOnboarding);
  console.log("🔍 Google OAuth Status:", {
    isFirstTimeOAuth,
    showProfileUpdateNotification,
  });

  return (
    <BasicAuthGuard>
      <div className="flex min-h-screen bg-[#F8F9FC] overflow-x-hidden">
        {/* Side Navbar */}
        <SideNavbar />
        {/* Main Content */}
        <main
          className="flex-1 flex flex-col items-center relative transition-all duration-300 ease-in-out overflow-x-hidden min-h-screen"
          style={{ marginLeft: "0px" }}
        >
          {/* Profile Update Notification for Google Users */}

          {/* Smart Content Routing */}
          {shouldShowOnboarding
            ? // New user from signup process - show onboarding (clean layout)
              newUserContent
            : shouldShowNewUserHome
            ? // Show new user home until Mission 2 is completed
              newUserContent
            : // Show default home once Mission 2 is completed
              defaultHomeContent}
        </main>
      </div>
    </BasicAuthGuard>
  );
}
