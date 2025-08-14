"use client";
import { useEffect, useRef, useState } from "react";
import { TimerPersistence } from "@/utils/timerPersistence";

export function formatTime(s: number) {
  const abs = Math.abs(s);
  const m = Math.floor(abs / 60)
    .toString()
    .padStart(2, "0");
  const sec = (abs % 60).toString().padStart(2, "0");
  return `${s < 0 ? "-" : ""}${m}:${sec}`;
}

interface MissionTimerProps {
  allocatedTime: number; // in seconds
  onTimeout?: () => void;
  autoStart?: boolean;
  onTick?: (secondsLeft: number) => void;
  showText?: boolean;
  missionId?: string;
  enablePersistence?: boolean;
}

export default function MissionTimer({
  allocatedTime,
  onTimeout,
  autoStart = true,
  onTick,
  showText = true,
  missionId,
  enablePersistence = false,
}: MissionTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(allocatedTime);
  const [isActive, setIsActive] = useState(autoStart);
  const [showTimeoutMsg, setShowTimeoutMsg] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const beepRef = useRef<HTMLAudioElement | null>(null);
  const timeoutTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer with persistence on mount
  useEffect(() => {
    setMounted(true);

    if (enablePersistence && missionId) {
      const savedTimeLeft = TimerPersistence.getCurrentTimeLeft(
        missionId,
        allocatedTime
      );
      setSecondsLeft(savedTimeLeft);

      // If timer was active before, resume it
      const state = TimerPersistence.loadTimerState();
      if (state && state.missionId === missionId && state.isActive) {
        setIsActive(true);
      } else if (autoStart) {
        // Start new timer if autoStart is true
        TimerPersistence.startTimer(missionId, allocatedTime);
      }
    }
  }, [enablePersistence, missionId, allocatedTime, autoStart]);

  // Start/stop timer
  useEffect(() => {
    if (!isActive || !mounted) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const newValue = prev - 1;

        // Update persistence if enabled
        if (enablePersistence && missionId) {
          const state = TimerPersistence.loadTimerState();
          if (state && state.missionId === missionId) {
            state.startTime = Date.now() - (allocatedTime - newValue) * 1000;
            TimerPersistence.saveTimerState(state);
          }
        }

        return newValue;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, mounted, enablePersistence, missionId, allocatedTime]);

  // Timeout logic: beep and show message for 3s, then continue negative time
  useEffect(() => {
    if (secondsLeft === 0) {
      setShowTimeoutMsg(true);
      if (beepRef.current) {
        try {
          beepRef.current.currentTime = 0;
          beepRef.current.play();
        } catch (e) {
          // ignore play errors
        }
      }
      if (onTimeout) onTimeout();
      timeoutTimer.current = setTimeout(() => setShowTimeoutMsg(false), 3000);
    }
    if (onTick) onTick(secondsLeft);
    return () => {
      if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
    };
  }, [secondsLeft, onTimeout, onTick]);

  // Progress for circle (0-1, clamp at 0 for negative)
  const progress = Math.max(0, secondsLeft / (allocatedTime || 1));
  // Color logic
  let color = "#00AEEF"; // Normal (blue)
  if (
    secondsLeft <= (allocatedTime || 1) * 0.2 &&
    secondsLeft > (allocatedTime || 1) * 0.1
  )
    color = "#FF9C32"; // Warning (orange)
  if (secondsLeft <= (allocatedTime || 1) * 0.1 || secondsLeft < 0)
    color = "#FF4D4F"; // Critical (red)

  // SVG circle params
  const radius = 16;
  const stroke = 4;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * progress;
  const strokeDashoffset = Math.max(0, circumference - dash); // Ensure it's not negative

  // Expose timer control methods
  const pauseTimer = () => {
    if (enablePersistence && missionId) {
      TimerPersistence.pauseTimer();
    }
    setIsActive(false);
  };

  const resumeTimer = () => {
    if (enablePersistence && missionId) {
      TimerPersistence.resumeTimer();
    }
    setIsActive(true);
  };

  const resetTimer = () => {
    if (enablePersistence && missionId) {
      TimerPersistence.resetTimer(missionId, allocatedTime);
    }
    setSecondsLeft(allocatedTime);
    setIsActive(autoStart);
  };

  // Expose methods to parent component
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).missionTimerControls = {
        pause: pauseTimer,
        resume: resumeTimer,
        reset: resetTimer,
      };
    }
  }, [enablePersistence, missionId, allocatedTime, autoStart]);

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center">
      <audio ref={beepRef} src="/beep.mp3" preload="auto" />
      <svg width={40} height={40}>
        <circle
          cx={20}
          cy={20}
          r={radius}
          stroke="#E0E6ED"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={20}
          cy={20}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s, stroke 0.3s" }}
        />
        {showText && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="1rem"
            fontWeight={700}
            fill={secondsLeft < 0 ? "#FF4D4F" : "#fff"}
          >
            {showTimeoutMsg ? "Timeout!" : formatTime(secondsLeft)}
          </text>
        )}
      </svg>
    </div>
  );
}
