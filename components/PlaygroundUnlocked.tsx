"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface PlaygroundUnlockedProps {
  onClose?: () => void;
  onNext?: () => void;
}

export default function PlaygroundUnlocked({
  onClose,
  onNext,
}: PlaygroundUnlockedProps) {
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show content after a brief delay for dramatic effect
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      // Default behavior - navigate to existing playground
      router.push("/playground");
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
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

      <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-4xl lg:max-w-5xl mx-auto">
        {/* Content */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={showContent ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col items-center justify-center flex-1 text-center -mt-24 sm:-mt-20 md:-mt-16 lg:mt-0 lg:mb-0 lg:-ml-20"
        >
          {/* Celebration Text */}
          <motion.div
            initial={{ scale: 0 }}
            animate={showContent ? { scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
            className="text-center px-4"
          >
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extrabold text-white mb-2 sm:mb-3">
              Amazing!
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white/90 mb-2 sm:mb-3">
              You have unlocked the
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-[#FF9C32] mb-6 sm:mb-8 lg:mb-10">
              Playground.
            </div>
          </motion.div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4">
            <motion.button
              initial={{ y: 30, opacity: 0 }}
              animate={showContent ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              onClick={handleNext}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-white text-black font-bold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 hover:bg-gray-100 hover:scale-105 hover:shadow-lg"
            >
              Next
            </motion.button>

            {onClose && (
              <motion.button
                initial={{ y: 30, opacity: 0 }}
                animate={showContent ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.9 }}
                onClick={handleClose}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-gray-600 text-white font-bold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 hover:bg-gray-700 hover:scale-105 hover:shadow-lg"
              >
                Close
              </motion.button>
            )}
          </div>
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
          className="flex justify-center lg:justify-end w-full lg:w-auto"
        >
          <img
            src="/happy-bot.png"
            alt="Robot"
            className="fixed bottom-0 left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 object-contain h-72 sm:h-80 md:h-96 lg:h-[70vh] xl:h-[80vh] 2xl:h-screen"
            style={{
              width: "auto",
              zIndex: 5,
              pointerEvents: "none",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
