"use client";
import { useState } from "react";
import Image from "next/image";
import MissionTimer, { formatTime } from "./MissionTimer";
import ToggleConnectButton from "@/components/ToggleConnectButton";

interface HeaderProps {
  missionNumber: number;
  title: string;
  timeAllocated: string;
  liveUsers: number;
  isConnected?: boolean;
  onConnectToggle?: (connected: boolean) => void;
  setIsConnected: any;
  onRun?: () => void;
  onErase?: () => void;
  sidebarCollapsed?: boolean;
  enableTimerPersistence?: boolean;
  isPlayground?: boolean;
  onConnectionTypeChange: (e:"bluetooth" | "serial") => void;
  setConnectionStatus: React.Dispatch<string>;
  connectionStatus: string;
  connectionType?: "bluetooth" | "serial";
  isUploading?: boolean;
}

export default function Header({
  missionNumber,
  title,
  timeAllocated,
  liveUsers,
  isConnected,
  setIsConnected,
  onConnectToggle,
  onRun,
  onErase,
  sidebarCollapsed = false,
  enableTimerPersistence = false,
  isPlayground = false,
  onConnectionTypeChange,
  connectionStatus,
  setConnectionStatus,
  connectionType = "bluetooth",
  isUploading = false,
}: HeaderProps) {
  const [timerValue, setTimerValue] = useState(0);

  // Parse timeAllocated string (e.g., "15 mins") to seconds
  const parseTimeAllocated = (str: string) => {
    if (str){
      const match = str.match(/(\d+)/);
      return match ? parseInt(match[1], 10) * 60 : 0;
    }
  };
  const allocatedSeconds = parseTimeAllocated(timeAllocated);

  const handleConnectToggle = () => {
    console.log("🔗 Connect toggle clicked!");
    const newConnected = !isConnected;
    setIsConnected(newConnected);
    onConnectToggle?.(newConnected);
  };

  return (
    <div
      className="w-full bg-[#181E2A] px-4 md:px-8 pb-0 relative"
      style={{ height: "65px", pointerEvents: "auto" }}
    >
      <div
        className="flex items-center justify-between max-w-8xl mx-auto relative h-full transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarCollapsed ? "80px" : "260px" }}
      >
        {/* Left: Mission number and title */}
        <div className="flex flex-col xl:flex-row xl:items-center gap-0 xl:gap-8 min-w-0 h-full justify-center xl:justify-start">
          <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-white whitespace-nowrap leading-tight">
            {!isPlayground
              ? `Mission ${missionNumber.toString().padStart(2, "0")}`
              : "Playground"}
          </span>
          {/* Vertical separator - Only visible on extra large screens */}
          {!isPlayground && (
            <>
              <span className="hidden xl:inline-block w-px h-8 bg-[#E0E6ED] mx-4" />
              <span className="text-xs sm:text-sm md:text-lg font-medium text-[#FF9C32] truncate leading-tight">
                {title}
              </span>
            </>
          )}
        </div>

        {/* Center: Timer pill */}
        {!isPlayground && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-full">
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 bg-[#222A36] rounded-full px-2 sm:px-4 md:px-6 py-1 min-w-[80px] sm:min-w-[100px] md:min-w-[120px] shadow-inner border border-[#222A36] h-full">
              <span
                className={
                  timerValue < 0
                    ? "text-[#FF4D4F] text-xs sm:text-sm md:text-lg font-mono font-bold"
                    : "text-white text-xs sm:text-sm md:text-lg font-mono font-bold"
                }
                style={{ letterSpacing: 1 }}
              >
                {timerValue < 0 ? "Timeout!" : formatTime(timerValue)}
              </span>
              <MissionTimer
                allocatedTime={allocatedSeconds}
                showText={false}
                onTick={setTimerValue}
                missionId={missionNumber.toString()}
                enablePersistence={true}
              />
            </div>
          </div>
        )}

        {/* Right: Live users, Control buttons (for mission 3+), and ToggleConnectButton (for mission 2+) */}
        <div className="flex items-center gap-3 md:gap-8 ml-auto h-full">
          {/* Live users count - Hidden on all small screen sizes */}
          <div className="hidden xl:flex items-center gap-2">
            <div className="relative w-3 h-3">
              {/* Center dot */}
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full z-10" />
              {/* Radar rings - Enhanced effect */}
              <div
                className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full opacity-60"
                style={{
                  animation:
                    "radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
              <div
                className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full opacity-40"
                style={{
                  animation:
                    "radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                  animationDelay: "0.5s",
                }}
              />
              <div
                className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full opacity-20"
                style={{
                  animation:
                    "radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                  animationDelay: "1s",
                }}
              />
              <div
                className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full opacity-10"
                style={{
                  animation:
                    "radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                  animationDelay: "1.5s",
                }}
              />
            </div>
            <span className="text-sm font-medium text-white">
              {liveUsers} Live
            </span>
          </div>

          {/* Control buttons for mission 3+ */}
          {(missionNumber >= 3 || isPlayground) && (
            <div className="flex items-center gap-3">
              {/* Play/Pause button */}
              <button
                onClick={isRunning ? onPause : onRun}
                className="p-2 bg-[#599CFF] hover:bg-[#8ebbff] rounded-full transition-colors cursor-pointer"
                title={isRunning ? "Pause" : "Play"}
              >
                <Image
                  src={isRunning ? "/stop button.png" : "/play button.png"}
                  alt={isRunning ? "Pause" : "Play"}
                  width={15}
                  height={15}
                  className="text-white"
                />
              </button>

              {/* Erase/Reset button */}
              <button
                onClick={onErase}
                className="p-2 bg-[#BB23C9] hover:bg-[#f27aff] rounded-full transition-colors"
                title="Erase"
              >
                <Image
                  src="/erase button.png"
                  alt="Erase"
                  width={16}
                  height={16}
                  className="text-white"
                />
              </button>
            </div>
          )}

          {(missionNumber > 1 || isPlayground) && (
            <ToggleConnectButton
              isConnected={isConnected}
              onToggle={handleConnectToggle}
              onConnectionTypeChange={onConnectionTypeChange}
              connectionStatus={connectionStatus}
              setConnectionStatus={setConnectionStatus}
              connectionType={connectionType}
            />
          )}
        </div>
      </div>
      {/* Orange line at the bottom */}
      <div
        className="absolute left-0 bottom-0 w-full h-1"
        style={{ background: "#FF9C32" }}
      />

      {/* Radar animation styles */}
      <style jsx>{`
        @keyframes radar-ping {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(2.5);
            opacity: 0;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
