"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LetsGoButton from "@/components/LetsGoButton";
import CountdownTimer from "@/components/CountdownTimer";

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
      <div className="w-full flex flex-row items-start justify-between mt-12 mb-4 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#222E3A]">
          Mission {missionNumber.toString().padStart(2, "0")}
        </h1>
        <div className="flex items-center gap-2 text-lg font-poppins text-[#222E3A]">
          <Image src="/gala_clock.png" alt="Clock" width={32} height={32} />
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
          width={240}
          height={120}
          className="mb-4"
        />
        <div className="text-2xl md:text-3xl font-extrabold text-[#222E3A] mb-2 mt-2 text-center">
          {title}
        </div>
        <div className="text-center text-[#888] text-base md:text-lg mb-8 max-w-2xl">
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
                width: 300,
                minWidth: 300,
                height: 60,
                minHeight: 60,
                fontSize: 22,
                justifyContent: "center",
              }}
              onClick={handleStart}
            >
              {buttonLabel}
            </LetsGoButton>
          </div>
        </div>
      </div>

      {/* Countdown Overlay */}
      {showCountdown && !missionStarted && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        >
          <CountdownTimer onGo={handleGo} />
        </div>
      )}

      {/* Mission Started Overlay */}
      {missionStarted && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <div className="text-center text-white">
            <div className="text-2xl md:text-3xl font-extrabold mb-4">
              {title}
            </div>
            <div className="text-base md:text-lg">
              Mission is now active! This is where the actual mission content
              would go.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
