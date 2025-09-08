"use client";
import { useState } from "react";
import Image from "next/image";
import MissionTimer, { formatTime } from "./MissionTimer";
import ToggleConnectButton from "@/components/ToggleConnectButton";
import { useSidebar } from "@/context/SidebarContext";

interface HeaderProps {
  missionNumber: number;
  title: string;
  timeAllocated: string;
  liveUsers: number;
  isConnected?: boolean;
  onConnectToggle?: (connected: boolean) => void;
  setIsConnected: (connected: boolean) => void;
  onRun?: () => void;
  onPause?: () => void;
  onErase?: () => void;
  onPowerUp?: () => void;
  sidebarCollapsed?: boolean;
  enableTimerPersistence?: boolean;
  isPlayground?: boolean;
  onConnectionTypeChange: (e:"bluetooth" | "serial" | "none") => void;
  setConnectionStatus: React.Dispatch<string>;
  connectionStatus: string;
  connectionType?: "bluetooth" | "serial" | "none";
  isUploading?: boolean;
  isRunning?: boolean;
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
  onPause,
  onErase,
  onPowerUp,
  sidebarCollapsed: propSidebarCollapsed = false,
  isPlayground = false,
  onConnectionTypeChange,
  connectionStatus,
  setConnectionStatus,
  connectionType = "bluetooth",
  isUploading = false,
  isRunning = false,
}: HeaderProps) {
  const [timerValue, setTimerValue] = useState(0);
  const { sidebarCollapsed: contextSidebarCollapsed } = useSidebar();

  // Use context sidebar state if available, otherwise fall back to prop
  const sidebarCollapsed = contextSidebarCollapsed ?? propSidebarCollapsed;

  // Parse timeAllocated string (e.g., "15 mins") to seconds
  const parseTimeAllocated = (str: string): number => {
    if (str) {
      const match = str.match(/(\d+)/);
      return match ? parseInt(match[1], 10) * 60 : 0;
    }
    return 0;
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
      className="fixed top-0 left-0 right-0 bg-[#181E2A] px-4 md:px-8 pb-0 z-50"
      style={{
        height: "65px",
        pointerEvents: "auto",
        marginLeft: sidebarCollapsed ? "80px" : "260px",
        width: sidebarCollapsed ? "calc(100vw - 80px)" : "calc(100vw - 260px)",
      }}
    >
      <div className="flex items-center justify-between max-w-8xl mx-auto relative h-full transition-all duration-300 ease-in-out">
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
              {/* Power Up button - only for playground */}
              {isPlayground && onPowerUp && (
                <button
                  onClick={onPowerUp}
                  className="p-2 bg-gradient-to-r from-[#00AEEF] to-[#0078D4] hover:from-[#0078D4] hover:to-[#0056A3] rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                  title="Power Up - Select Connection Type"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </button>
              )}

              {/* Play/Pause button */}
              <button
                onClick={isRunning ? onPause : onRun}
                disabled={isUploading}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isUploading
                    ? "bg-[#599CFF] opacity-60 cursor-not-allowed"
                    : "bg-[#599CFF] hover:bg-[#8ebbff]"
                }`}
                title={
                  isUploading ? "Uploading..." : isRunning ? "Stop" : "Run"
                }
              >
                {isUploading ? (
                  <div
                    className="h-[15px] w-[15px] border-2 border-white border-t-transparent rounded-full animate-spin"
                    aria-label="Uploading"
                  />
                ) : (
                  <Image
                    src={isRunning ? "/stop button.png" : "/play button.png"}
                    alt={isRunning ? "Stop" : "Run"}
                    width={15}
                    height={15}
                    className="text-white"
                  />
                )}
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
              isConnected={isConnected || false}
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
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: "#FF9C32",
        }}
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
