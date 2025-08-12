"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface PlaygroundUnlockedProps {
  onClose?: () => void;
}

export default function PlaygroundUnlocked({
  onClose,
}: PlaygroundUnlockedProps) {
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show content after a brief delay for dramatic effect
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    // Navigate to existing playground
    router.push("/playground");
  };

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

        <div className="flex flex-row items-center justify-start w-full max-w-5xl mx-auto">
          {/* Left: Content */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={showContent ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center justify-center flex-1 -ml-40"
          >
            {/* Celebration Text */}
            <motion.div
              initial={{ scale: 0 }}
              animate={showContent ? { scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-3">
                Amazing!
              </div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white/90 mb-3">
                You have unlocked the
              </div>
              <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#FF9C32] mb-10">
                Playground.
              </div>
            </motion.div>

            {/* Next Button */}
            <motion.button
              initial={{ y: 30, opacity: 0 }}
              animate={showContent ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              onClick={handleNext}
              className="px-8 py-3 rounded-full bg-white text-black font-bold text-lg focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 hover:bg-gray-100 hover:scale-105 hover:shadow-lg"
            >
              Next
            </motion.button>
          </motion.div>

          {/* Right: Robot Illustration */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={
              showContent
                ? {
                    x: 0,
                    opacity: 1,
                  }
                : {}
            }
            transition={{
              duration: 1,
              delay: 0.6,
              ease: "easeOut",
            }}
          >
            <img
              src="/happy-bot.png"
              alt="Robot"
              className="hidden md:block fixed right-0 bottom-0 object-contain"
              style={{
                height: "100vh",
                maxHeight: "100vh",
                width: "auto",
                zIndex: 5,
                pointerEvents: "none",
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
