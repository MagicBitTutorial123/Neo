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
  setIsConnected: any,
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
      className="w-full bg-[#181E2A] px-8 pb-0 relative"
      style={{ height: "65px", pointerEvents: "auto" }}
    >
      <div
        className="flex items-center justify-between max-w-8xl mx-auto relative h-full"
        // style={{ marginLeft: sidebarCollapsed ? "80px" : "260px" }}
      >
        {/* Left: Mission number and title */}
        <div className="flex items-center gap-8 min-w-0 h-full">
          <span className="text-2xl font-extrabold text-white whitespace-nowrap">
           {!isPlayground ? `Mission ${missionNumber.toString().padStart(2, "0")}` : "Playground"} 
          </span>
          {/* Vertical separator */}
          {!isPlayground && (
            <>
            <span className="w-px h-8 bg-[#E0E6ED] mx-4 inline-block" />
            <span className="text-lg font-medium text-[#FF9C32] truncate">
              {title}
            </span>
            </>
          )}
          </div>

        {/* Center: Timer pill */}
        {!isPlayground && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-full">
          <div className="flex items-center gap-3 bg-[#222A36] rounded-full px-6 py-1 min-w-[120px] shadow-inner border border-[#222A36] h-full">
            <span
              className={
                timerValue < 0
                  ? "text-[#FF4D4F] text-lg font-mono font-bold"
                  : "text-white text-lg font-mono font-bold"
              }
              style={{ letterSpacing: 2 }}
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
        <div className="flex items-center gap-8 ml-auto h-full">
                     {/* Control buttons for mission 3+ */}
           {(missionNumber >= 3 || isPlayground) && (
             <div className="flex items-center gap-3">
               {/* Play button with loading state */}
               <button
                 onClick={onRun}
                 disabled={isUploading}
                 className="p-2 bg-[#599CFF] hover:bg-[#8ebbff] rounded-full transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                 title="Play"
               >
                 {isUploading ? (
                   <svg
                     className="animate-spin h-4 w-4 text-white"
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                   >
                     <circle
                       className="opacity-25"
                       cx="12"
                       cy="12"
                       r="10"
                       stroke="currentColor"
                       strokeWidth="4"
                     ></circle>
                     <path
                       className="opacity-75"
                       fill="currentColor"
                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                     ></path>
                   </svg>
                 ) : (
                   <Image
                     src="/play button.png"
                     alt="Play"
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
    </div>
  );
}
