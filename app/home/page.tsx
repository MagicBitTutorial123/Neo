"use client";
import SideNavbar from "@/components/SideNavbar";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LetsGoButton from "@/components/LetsGoButton";
import TipOfTheDayCard from "@/components/TipOfTheDayCard";

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
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [hasCompletedMission2, setHasCompletedMission2] =
    useState<boolean>(false);
  const [step, setStep] = useState(0);
  const router = useRouter();

  const mainTextStep1 = useTypingEffect("Welcome onboard!");
  const mainTextStep2 = useTypingEffect("I'm your Robot.");
  const subTextStep2 = useTypingEffect("Let's get things up!");

  // On mount, read localStorage to determine which home to show
  useEffect(() => {
    setHydrated(true);
    if (typeof window !== "undefined") {
      const localIsNewUser = localStorage.getItem("isNewUser");
      const localHasCompletedMission2 = localStorage.getItem(
        "hasCompletedMission2"
      );
      setIsNewUser(localIsNewUser === "true");
      setHasCompletedMission2(localHasCompletedMission2 === "true");
    }
  }, []);

  // New User Home step logic
  useEffect(() => {
    if (isNewUser && step < 2) {
      const timer = setTimeout(() => setStep(step + 1), 2000);
      return () => clearTimeout(timer);
    }
  }, [step, isNewUser]);

  // Simulate completing Mission 2 for testing
  const completeMission2 = () => {
    localStorage.setItem("hasCompletedMission2", "true");
    localStorage.setItem("isNewUser", "false");
    setHasCompletedMission2(true);
    setIsNewUser(false);
  };

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
    { src: "/badge6.png", alt: "Badge8", earned: false },
  ];

  // Dummy battery level (0-100)
  const batteryLevel = 68;

  const newUserContent = useMemo(() => {
    if (step === 0) {
      return (
        <div className="flex flex-1 w-full h-full relative animate-fade-in">
          <div className="flex flex-col justify-center items-start min-w-[320px] px-32 pt-24 z-10 ml-40">
            <div className="text-4xl md:text-5xl font-extrabold text-[#222E3A]">
              {mainTextStep1}
            </div>
          </div>
        </div>
      );
    } else if (step === 1) {
      return (
        <div className="flex flex-1 w-full h-full relative animate-fade-in">
          <div className="flex flex-col justify-center items-start min-w-[320px] px-32 pt-24 z-10  ml-40">
            <div className="text-4xl md:text-5xl font-extrabold text-[#222E3A] mb-4">
              {mainTextStep2}
            </div>
            <div className="text-3xl text-[#555] font-poppins mb-18">
              {subTextStep2}
            </div>
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
    } else {
      return (
        <div className="flex flex-1 w-full h-full relative animate-fade-in">
          <div className="flex flex-col justify-center items-start min-w-[320px] px-32 pt-24 z-10  ml-40">
            <div className="text-4xl md:text-5xl font-extrabold text-[#222E3A] mb-4">
              {mainTextStep2}
            </div>
            <div className="text-3xl text-[#555] font-poppins mb-18">
              {subTextStep2}
            </div>
            <LetsGoButton onClick={() => router.push("/missions/mission1")}>
              Let's Go
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
  }, [step, router]);

  // Default Home (after Mission 2)
  const defaultHomeContent = (
    <div className="flex flex-1 flex-col w-full h-full relative animate-fade-in px-12 pt-12">
      <div className="flex flex-row items-start justify-between w-full max-w-7xl mx-auto">
        {/* Left: Welcome and Mission */}
        <div className="flex-1 flex flex-col gap-6 min-w-[400px]">
          <div className="mb-2">
            <span className="text-3xl md:text-4xl font-extrabold text-[#FF9C32]">
              Welcome back!
            </span>
            <div className="text-3xl md:text-4xl font-extrabold text-[#222E3A] mt-1 flex items-center gap-2">
              Miggy{" "}
              <span className="inline-block">
                <Image src="/User.png" alt="User" width={32} height={32} />
              </span>
            </div>
          </div>
          {/* Mission Card */}
          <div className="rounded-2xl overflow-hidden shadow bg-white relative flex flex-col max-w-3xl w-full">
            <Image
              src="/continue mission-image.png"
              alt="Mission"
              width={500}
              height={300}
              className="object-cover w-full h-[300px]"
            />
            <button className="absolute bottom-6 right-6 bg-black text-white font-bold rounded-full px-8 py-3 flex items-center gap-2 text-lg shadow-lg hover:bg-[#222] transition">
              Continue mission{" "}
              <span className="inline-block">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
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
          <div className="rounded-2xl bg-white shadow flex flex-row items-stretch p-0 mt-0 overflow-hidden max-w-3xl w-full">
            {/* Left: Text */}
            <div className="flex flex-col justify-center p-10 flex-1 min-w-[220px] h-full">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-black shadow-lg">
                  <Image
                    src="/project-week-icon.png"
                    alt="project-week-icon"
                    width={22}
                    height={22}
                  />
                </span>
                <span className="text-lg font-medium text-[#222E3A]">
                  Project of the week
                </span>
              </div>
              <div className="text-2xl font-extrabold text-[#222E3A] mb-2">
                Boxing Champ
              </div>
              <div className="text-[#555] text-base font-normal">
                Lorem ipsum dolor sit amet consectetur.
              </div>
            </div>
            {/* Right: Image */}
            <div className="flex-shrink-0 w-[260px] h-[180px] md:w-[320px] md:h-[200px] lg:w-[340px] lg:h-[220px] relative">
              <Image
                src="/project-image-4.png"
                alt="Project of the Week"
                fill
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
        {/* Right: Mission Progress, Badges, Battery, Tip */}
        <div className="flex flex-col gap-6 min-w-[340px] ml-12 w-[380px] h-full justify-start">
          {/* Mission Progress Bar */}
          <div className="w-full flex flex-col items-center mb-2">
            <div className="w-full flex flex-row items-center justify-between mb-2">
              <span className="text-lg font-bold text-[#00AEEF]">
                {missionLabel}
              </span>
              <span className="text-lg font-bold text-[#00AEEF]">
                {xpPoints} XP
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#E5EAF1] flex overflow-hidden">
              <div
                className="bg-[#00AEEF] h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Badges */}
          <div className="rounded-2xl border border-[#E0E6ED] bg-white p-4 flex flex-col mt-10">
            <div className="font-bold text-[#222E3A] mb-2">My Badges</div>
            <div className="grid grid-cols-4 gap-3">
              {badges.map((badge, idx) => (
                <span key={idx} className="flex items-center justify-center">
                  <Image
                    src={badge.src}
                    alt={badge.alt}
                    width={65}
                    height={65}
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
          <div
            className="rounded-2xl bg-white shadow flex flex-row items-center p-6 gap-6 min-h-[80px]"
            style={{ minWidth: 340 }}
          >
            <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[#00AEEF] shadow-lg">
              <Image
                src="/power-icon.png"
                alt="Battery"
                width={20}
                height={20}
              />
            </span>
            <div className="text-xl font-bold text-[#222E3A] ml-2">Battery</div>
            <div className="flex-1 flex justify-end items-center">
              {/* Battery Icon */}
              <div
                className="relative flex items-center"
                style={{ width: 120, height: 48 }}
              >
                {/* Battery outline */}
                <div
                  className="absolute left-0 top-0 w-full h-full rounded-[12px] border-2 border-[#E5EAF1] bg-white"
                  style={{ boxShadow: "0 2px 8px #0001" }}
                ></div>
                {/* Battery fill */}
                <div
                  className="absolute left-0 top-0 h-full rounded-l-[10px] bg-gradient-to-b from-[#B6FF7A] to-[#7ED957]"
                  style={{
                    width: `${Math.max(0, Math.min(100, batteryLevel))}%`,
                    transition: "width 0.5s",
                    zIndex: 1,
                  }}
                ></div>
                {/* Battery tip */}
                <div
                  className="absolute right-[-12px] top-1/4 w-6 h-1/2 bg-white border-2 border-[#E5EAF1] rounded-r-[6px]"
                  style={{ zIndex: 2 }}
                ></div>
                {/* Battery percentage */}
                <span
                  className="absolute left-0 top-0 w-full h-full flex items-center justify-center text-lg font-bold"
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

  // Decide which home to show
  let showNewUserHome = false;
  if (!hydrated || isNewUser === null) {
    // Still loading or not hydrated
    return null;
  } else if (isNewUser) {
    showNewUserHome = true;
  } else if (!hasCompletedMission2) {
    showNewUserHome = true;
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      {/* Side Navbar */}
      <SideNavbar />
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-x-hidden min-h-screen">
        {showNewUserHome ? newUserContent : defaultHomeContent}
        {/* Button to simulate completing Mission 2 for testing */}
        <button
          onClick={completeMission2}
          className="fixed bottom-8 right-8 bg-[#00AEEF] text-white px-6 py-2 rounded-full shadow-lg z-50"
        >
          Simulate Complete Mission 2
        </button>
      </main>
    </div>
  );
}

// Add a simple fade-in animation
// In your global CSS (e.g., app/globals.css), add:
// .animate-fade-in { animation: fadeIn 0.6s; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
