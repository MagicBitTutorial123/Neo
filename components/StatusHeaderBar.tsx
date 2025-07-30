"use client";
import { useState } from "react";
import Image from "next/image";
import MissionTimer, { formatTime } from "./MissionTimer";
import ToggleConnectButton from "@/components/ToggleConnectButton";

interface StatusHeaderProps {
  missionNumber: number;
  title: string;
  timeAllocated: string;
  liveUsers: number;
  isConnected?: boolean;
  onConnectToggle?: (connected: boolean) => void;
  onRun?: () => void;
  onPause?: () => void;
  onErase?: () => void;
  isRunning?: boolean;
  playground?: boolean;
  clearWorkspace?: () => void;
}

export default function StatusHeaderBar({
  missionNumber,
  title,
  timeAllocated,
  liveUsers,
  isConnected = false,
  onConnectToggle,
  onRun,
  onPause,
  onErase,
  playground = false,
  isRunning = false,
}: StatusHeaderProps) {
  const [connected, setConnected] = useState(isConnected);
  const [timerValue, setTimerValue] = useState(0);

  // Parse timeAllocated string (e.g., "15 mins") to seconds
  const parseTimeAllocated = (str: string) => {
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1], 10) * 60 : 0;
  };
  const allocatedSeconds = parseTimeAllocated(timeAllocated);

  const handleConnectToggle = () => {
    const newConnected = !connected;
    setConnected(newConnected);
    onConnectToggle?.(newConnected);
  };

  return (
    <div
      className="w-full bg-[#181E2A] px-8 pb-0 relative"
      style={{ height: "65px" }}
    >
      <div className="flex items-center justify-between max-w-8xl mx-auto relative h-full">
        {/* Left: Mission number and title */}
        <div className="flex items-center gap-4 min-w-0 h-full">
          <span className="text-2xl font-extrabold text-white whitespace-nowrap">
            {playground
              ? "Playground"
              : `Mission ${missionNumber.toString().padStart(2, "0")}`}
          </span>
          {/* Vertical separator */}
          <span className="w-px h-8 bg-[#E0E6ED] mx-4 inline-block" />
          {!playground ? (
            <span className="text-lg font-medium text-[#FF9C32] truncate">
              {title}
            </span>
          ) : (
            <>
              <span className="relative flex items-center justify-center">
                <span className="w-3 h-3 bg-green-400 rounded-full block z-10" />
                <span
                  className="absolute w-6 h-6 rounded-full bg-green-400 opacity-40 animate-ping z-0"
                  style={{
                    left: "-6px",
                    top: "-6px",
                    animationDuration: "1.8s",
                  }}
                />
              </span>
              <span className="text-white text-lg font-regular">
                {liveUsers} online
              </span>
            </>
          )}
        </div>

        {/* Center: Timer pill */}
        {! playground && (
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
            />
          </div>
        </div>

        )}

        {/* Right: Live users, Control buttons (for mission 3+), and ToggleConnectButton (for mission 2+) */}
        <div className="flex items-center gap-8 ml-auto h-full">
          {/* Control buttons for mission 3+ */}
          {(missionNumber >= 3 || playground) && (
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

          {missionNumber > 1 && (
            <ToggleConnectButton
              isConnected={connected}
              onToggle={handleConnectToggle}
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
