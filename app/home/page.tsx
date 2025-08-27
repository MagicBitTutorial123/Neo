"use client";
import SideNavbar from "@/components/SideNavbar";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import LetsGoButton from "@/components/LetsGoButton";
import TipOfTheDayCard from "@/components/TipOfTheDayCard";
import { useUser } from "@/context/UserContext";

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
  const { userData } = useUser();

  const mainTextStep = useTypingEffect("I'm your Robot.");
  const subTextStep = useTypingEffect("Let's get things up!");
  const [isNewUser,setIsNewUser] = useState(false)

  // On mount, set hydrated state and check for new user query param
  useEffect(() => {
    setHydrated(true);

    // Check if this is a new user from signup
    const isNewUserFromSignup = searchParams.get("newUser") === "true";
    if (isNewUserFromSignup) {
      router.replace("/home");
      setIsNewUser(true);
    }
  }, [searchParams, router]);

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleSidebarCollapsed = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebarCollapsed', handleSidebarCollapsed as EventListener);
    
    return () => {
      window.removeEventListener('sidebarCollapsed', handleSidebarCollapsed as EventListener);
    };
  }, []);

  // New User Home step logic
  useEffect(() => {
    if (userData?.isNewUser && step < 2) {
      const timer = setTimeout(() => setStep(step + 1), 2000);
      return () => clearTimeout(timer);
    }
  }, [step, userData?.isNewUser]);

  // Dummy data for mission progress
  const totalSteps = 5;
  const completedSteps = 3; // Change this to simulate progress
  const xpPoints = 120;
  const missionLabel = `Mission 02`;
  const progressPercent = (completedSteps / totalSteps) * 100;

  // Dummy data for badges
  const badges = [
    { src: "/badge1.png", alt: "Badge1", earned: true },
    { src: "/badge2.png", alt: "Badge2", earned: true },
    { src: "/badge3.png", alt: "Badge3", earned: false },
    { src: "/badge4.png", alt: "Badge4", earned: false },
    { src: "/badge5.png", alt: "Badge5", earned: false },
    { src: "/badge6.png", alt: "Badge6", earned: false },
    { src: "/badge6.png", alt: "Badge7", earned: false },
    { src: "/badge8.png", alt: "Badge8", earned: false },
  ];

  // Dummy battery level (0-100)
  const batteryLevel = 68;

  // Determine the next mission (assuming missionProgress is the last completed mission)
  const nextMission = (userData?.missionProgress ?? 0) + 1;

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
    }
  
  , [router, mainTextStep, subTextStep, nextMission]);

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
              {userData?.name}{" "}
              {/* <span className="inline-block">
                <Image src="/User.png" alt="User" width={32} height={32} />
              </span> */}
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
            <button className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 bg-black text-white font-bold rounded-full px-4 sm:px-6 md:px-8 py-2 sm:py-3 flex items-center gap-2 text-sm sm:text-base md:text-lg shadow-lg hover:bg-[#222] transition">
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
  
  // Check if user is new based on mission progress or isNewUser flag
  

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] overflow-x-hidden">
      {/* Side Navbar */}
      <SideNavbar />
      {/* Main Content */}
      <main
        className="flex-1 flex flex-col items-center relative transition-all duration-300 ease-in-out overflow-x-hidden min-h-screen"
        style={{
          marginLeft: sidebarCollapsed ? "80px" : "260px",
        }}
      >
        {isNewUser ? newUserContent : defaultHomeContent}
      </main>
    </div>
  );
}