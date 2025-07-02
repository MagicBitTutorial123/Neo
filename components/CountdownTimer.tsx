"use client";
import { useState, useEffect } from "react";
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
          }, 1000);
          return 0;
        }
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onGo]);

  if (showGo) {
    return (
      <div className="flex items-center justify-center min-h-[400px] mt-55">
        <Image
          src="/count-go.png"
          alt="GO!"
          width={400}
          height={400}
          className="animate-pulse"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] mt-55">
      <Image
        src={`/count-0${count}.png`}
        alt={`${count}`}
        width={400}
        height={400}
      />
    </div>
  );
}
