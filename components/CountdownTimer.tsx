"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface CountdownTimerProps {
  onComplete?: () => void;
  onGo?: () => void;
}

export default function CountdownTimer({
  onComplete,
  onGo,
}: CountdownTimerProps) {
  const [count, setCount] = useState(3);
  const [showGo, setShowGo] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount and play continuously during countdown
  useEffect(() => {
    audioRef.current = new Audio("/countdown.mp3");
    audioRef.current.volume = 0.7; // Set volume to 70%
    audioRef.current.loop = true; // Loop the audio continuously

    // Start playing the audio immediately when countdown begins
    const playAudio = async () => {
      try {
        await audioRef.current?.play();
      } catch (error) {
        console.log("Audio playback failed:", error);
      }
    };

    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio when countdown completes
  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount > 1) {
          return prevCount - 1;
        } else if (prevCount === 1) {
          // Show "GO!" for 1 second
          setShowGo(true);
          setTimeout(() => {
            setIsActive(false);
            onGo?.();
          }, 2000);
          return 0;
        }
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onGo]);

  if (showGo) {
    return (
      <div
        className="relative"
        style={{
          border: "none",
          outline: "none",
          boxShadow: "none",
          filter: "none",
        }}
      >
        <Image
          src="/count-go.png"
          alt="GO!"
          width={550}
          height={550}
          className="animate-pulse w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px] object-contain"
          style={
            {
              border: "none !important",
              outline: "none !important",
              boxShadow: "none !important",
              filter: "none !important",
              display: "block",
            } as React.CSSProperties
          }
        />
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{
        border: "none",
        outline: "none",
        boxShadow: "none",
        filter: "none",
      }}
    >
      <Image
        src={`/count-0${count}.png`}
        alt={`${count}`}
        width={550}
        height={550}
        className="w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px] object-contain"
        style={
          {
            border: "none !important",
            outline: "none !important",
            boxShadow: "none !important",
            filter: "none !important",
            display: "block",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
