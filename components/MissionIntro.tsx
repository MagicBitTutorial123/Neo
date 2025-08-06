"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LetsGoButton from "@/components/LetsGoButton";

interface MissionIntroProps {
  missionNumber: number;
  title: string;
  timeAllocated: string;
  image: string;
  instructions: string;
  buttonLabel?: string;
  onStart?: () => void;
  onMissionStart?: () => void;
}

export default function MissionIntro({
  missionNumber,
  title,
  timeAllocated,
  image,
  instructions,
  buttonLabel = "START",
  onStart,
  onMissionStart,
}: MissionIntroProps) {
  const [showCountdown, setShowCountdown] = useState(false);
  const [missionStarted, setMissionStarted] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    setShowCountdown(true);
    onStart?.();
  };

  const handleGo = () => {
    setMissionStarted(true);
    if (onMissionStart) {
      onMissionStart();
    } else {
      setTimeout(() => {
        router.push(`/missions/mission${missionNumber}/steps`);
      }, 1000);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center relative bg-white px-8">
      {/* Top Row: Title and Time */}
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between mt-8 sm:mt-10 md:mt-12 mb-3 sm:mb-4 max-w-4xl mx-auto gap-2 sm:gap-3 lg:gap-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#222E3A]">
          Mission {missionNumber.toString().padStart(2, "0")}
        </h1>
        <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg text-[#222E3A]">
          <Image
            src="/gala_clock.png"
            alt="Clock"
            width={24}
            height={24}
            className="sm:w-8 sm:h-8 md:w-10 md:h-10"
          />
          <span>
            Time Allocated: <span className="font-bold">{timeAllocated}</span>
          </span>
        </div>
      </div>

      {/* Mission Content */}
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className="mb-3 sm:mb-4 w-[200px] h-[150px] sm:w-[240px] sm:h-[180px] md:w-[320px] md:h-[240px] lg:w-[400px] lg:h-[300px] object-contain"
        />
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-[#222E3A] mb-1.5 sm:mb-2 mt-1 sm:mt-2 text-center">
          {title}
        </div>
        <div className="text-center text-[#888] text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl">
          {instructions}
        </div>
        <div
          className="flex justify-center w-full"
          style={{ overflow: "visible" }}
        >
          <div
            className="flex justify-center w-full"
            style={{ overflow: "visible" }}
          >
            <LetsGoButton
              style={{
                overflow: "visible",
                width: 250,
                minWidth: 250,
                height: 50,
                minHeight: 50,
                fontSize: 18,
                justifyContent: "center",
              }}
              onClick={handleStart}
            >
              {buttonLabel}
            </LetsGoButton>
          </div>
        </div>
      </div>

      {/* Countdown is now handled at page level */}

      {/* Mission Started Overlay */}
      {missionStarted && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[60]"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <div className="text-center text-white px-4">
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold mb-3 sm:mb-4">
              {title}
            </div>
            <div className="text-sm sm:text-base md:text-lg">
              Mission is now active! This is where the actual mission content
              would go.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
