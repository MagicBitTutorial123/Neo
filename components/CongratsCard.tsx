import React, { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import animationData from "../assets/animation.json";

// Debug: Check if animation data is loaded
console.log("Animation data loaded:", animationData ? "Yes" : "No");

// CSS for scaling animation
const scalePulseStyle = `
  @keyframes scalePulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

interface CongratsCardProps {
  onBack: () => void;
  onNextMission: () => void;
  headline?: string;
  subtitle?: string;
  points?: number;
  timeSpent?: string;
  robotImageSrc?: string;
  backText?: string;
  nextMissionText?: string;
}

export default function CongratsCard({
  onBack,
  onNextMission,
  headline = "Congratulations!",
  subtitle = "You completed mission 1 successfully.",
  points = 0,
  timeSpent = "0:00",
  robotImageSrc = "/aww-robot-new.png",
  backText = "Back",
  nextMissionText = "Mission 2",
}: CongratsCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Play sound when component mounts
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log("Audio play failed:", error);
      });
    }
  }, []);

  return (
    <>
      <style>{scalePulseStyle}</style>
      <audio ref={audioRef} src="/congrats.mp3" preload="auto" />
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      >
        <div
          className="bg-white rounded-[40px] shadow-lg flex flex-col items-center min-w-[280px] max-w-[90vw] px-0 py-0 overflow-visible"
          style={{ width: 460, position: "relative" }}
        >
          {/* Curved dark background with robot + animation */}
          <div className="w-full relative" style={{ height: 120 }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 420 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                display: "block",
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
              }}
              preserveAspectRatio="none"
            >
              <path
                d="M32,0 h356 a32,32 0 0 1 32,32 v38 C420,90 360,100 210,100 C60,100 0,90 0,70 V32 a32,32 0 0 1 32,-32 Z"
                fill="#232733"
              />
            </svg>

            {/* LOTTIE ANIMATION (behind the robot by default) */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: "-150px", // adjusted for better visibility
                left: "41%",
                width: 220, // keep fixed to avoid layout shift
                height: 220,
                transform: "rotate(45deg)",
                zIndex: 2, // on top for now to see if it's working
              }}
            >
              <Lottie
                animationData={animationData}
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
                onError={(error) =>
                  console.error("Lottie animation error:", error)
                }
                onLoad={() =>
                  console.log("Lottie animation loaded successfully")
                }
              />
            </div>

            {/* Robot image */}
            <img
              src={robotImageSrc}
              alt="Congratulations"
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                zIndex: 3, // above animation; change if you want the opposite
                top: "-80px",
                width: "200px",
                height: "200px",
                animation: "scalePulse 3s ease-in-out infinite",
              }}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col items-center w-full px-4 pb-6 pt-2">
            <div className="mb-1 text-center text-3xl font-extrabold text-black">
              {headline}
            </div>
            <div className="mb-4 text-center text-base text-black font-medium">
              {subtitle}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#F5F6F8] flex items-center justify-center text-2xl font-extrabold text-[#232733] mb-1">
                  {points}
                </div>
                <div className="text-[#A1A6B0] text-xs font-semibold">
                  Points
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#F5F6F8] flex items-center justify-center text-lg font-extrabold text-[#232733] mb-1">
                  {timeSpent}
                </div>
                <div className="text-[#A1A6B0] text-xs font-semibold">
                  Timing
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={onBack}
                className="w-40 px-4 py-2 rounded-full font-medium bg-[#E6F6FF] text-[#232733] hover:bg-[#D0D6DD] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B3E6FF]"
              >
                {backText}
              </button>
              <button
                onClick={onNextMission}
                className="w-40 px-4 py-2 rounded-full font-medium bg-black text-white hover:bg-[#222E3A] transition-colors focus:outline-none focus:ring-2 focus:ring-black"
              >
                {nextMissionText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
