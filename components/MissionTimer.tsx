"use client";
import { useEffect, useRef, useState } from "react";

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
}

export default function MissionTimer({
  allocatedTime,
  onTimeout,
  autoStart = true,
  onTick,
  showText = true,
}: MissionTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(allocatedTime);
  const [isActive, setIsActive] = useState(autoStart);
  const [showTimeoutMsg, setShowTimeoutMsg] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const beepRef = useRef<HTMLAudioElement | null>(null);
  const timeoutTimer = useRef<NodeJS.Timeout | null>(null);

  // Only render timer after mount (fix hydration error)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Start/stop timer
  useEffect(() => {
    if (!isActive || !mounted) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, mounted]);

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
  const progress = Math.max(0, secondsLeft / allocatedTime);
  // Color logic
  let color = "#00AEEF"; // Normal (blue)
  if (secondsLeft <= allocatedTime * 0.2 && secondsLeft > allocatedTime * 0.1)
    color = "#FF9C32"; // Warning (orange)
  if (secondsLeft <= allocatedTime * 0.1 || secondsLeft < 0) color = "#FF4D4F"; // Critical (red)

  // SVG circle params
  const radius = 16;
  const stroke = 4;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * progress;

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
          strokeDashoffset={circumference - dash}
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
