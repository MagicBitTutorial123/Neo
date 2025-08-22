import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface HelpAcceptedOverlayProps {
  message?: string;
  imageSrc?: string;
  onAutoNavigate?: () => void;
  autoNavigateDelay?: number; // in milliseconds
  currentMissionId?: string; // Current mission ID for navigation
}

export default function HelpAcceptedOverlay({
  message = `Yahooooo!\nThat's the spirit of an\ninnovator`,
  onAutoNavigate,
  autoNavigateDelay = 0, // Disable auto-navigation by default
  currentMissionId = "1", // Add current mission ID prop
}: HelpAcceptedOverlayProps) {
  const [showContent, setShowContent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(Math.ceil(autoNavigateDelay / 1000));
  const router = useRouter();

  useEffect(() => {
    // Show content after a brief delay for dramatic effect
    const showTimer = setTimeout(() => setShowContent(true), 200);

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto navigate after specified delay (only if delay > 0)
    if (autoNavigateDelay > 0) {
      const autoNavigateTimer = setTimeout(() => {
        if (onAutoNavigate) {
          onAutoNavigate();
        } else {
          // Navigate to next mission instead of home
          const nextMissionId = String(Number(currentMissionId) + 1);
          if (nextMissionId <= "12") {
            // Assuming there are 12 missions
            router.push(`/missions/${nextMissionId}?showIntro=true`);
          } else {
            // If no more missions, go to missions page
            router.push("/missions");
          }
        }
      }, autoNavigateDelay);

      return () => {
        clearTimeout(autoNavigateTimer);
      };
    }

    return () => {
      clearTimeout(showTimer);
      clearInterval(countdownTimer);
    };
  }, [onAutoNavigate, autoNavigateDelay, router, currentMissionId]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      >
        {/* Background Bubbles Animation */}
        {showContent && (
          <>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: -100, opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute bottom-0 left-1/4 w-3 h-3 bg-[#00AEEF] rounded-full"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: -100, opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              className="absolute bottom-0 right-1/3 w-2 h-2 bg-[#FF9C32] rounded-full"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: -100, opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 2 }}
              className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-white rounded-full"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: -100, opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 2.5 }}
              className="absolute bottom-0 right-1/4 w-2.5 h-2.5 bg-[#7ED957] rounded-full"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: -100, opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 3 }}
              className="absolute bottom-0 left-1/3 w-1 h-1 bg-[#9C27B0] rounded-full"
            />
          </>
        )}

        <div className="flex flex-col items-center justify-center flex-1">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={showContent ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
            className="text-3xl md:text-4xl font-extrabold text-white text-center whitespace-pre-line"
          >
            {message}
          </motion.div>

          {/* Auto-navigation indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={showContent ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 5 }}
            className="text-white/70 text-sm mt-4 text-center"
          >
            Continuing in {timeLeft} seconds...
          </motion.div>
        </div>
        <motion.img
          initial={{ x: 100, opacity: 0 }}
          animate={showContent ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          src="/happy-bot.png"
          alt="Happy bot"
          className="hidden md:block fixed right-0 bottom-0 object-contain"
          style={{
            height: "100vh",
            maxHeight: "100vh",
            width: "auto",
            zIndex: 5,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
