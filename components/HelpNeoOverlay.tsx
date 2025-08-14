import React from "react";

interface HelpNeoOverlayProps {
  onLater: () => void;
  onHelp: () => void;
  headline?: string;
  subtitle?: string;
  imageSrc?: string;
  laterText?: string;
  helpText?: string;
}

export default function HelpNeoOverlay({
  onLater,
  onHelp,
  headline = "Hey, Neo needs your help!",
  subtitle = "He need you the most right now!",
  laterText = "Yes, But later",
  helpText = "I will help!",
}: HelpNeoOverlayProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
    >
      <div className="flex flex-row items-center justify-start w-full max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center flex-1 -ml-40">
          <div className="text-3xl md:text-4xl font-extrabold text-white mb-2 text-center whitespace-nowrap max-w-full">
            {headline}
          </div>
          <div className="text-base md:text-lg text-white mb-8 opacity-80 text-center">
            {subtitle}
          </div>
          <div className="flex gap-8 mt-8 justify-center">
            <button
              onClick={onLater}
              className="px-6 py-2 rounded-full bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#B3E6FF] transition-all duration-200 hover:bg-gray-800 hover:scale-105 hover:shadow-lg"
            >
              {laterText}
            </button>
            <button
              onClick={onHelp}
              className="px-6 py-2 rounded-full bg-white text-black font-bold text-base focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 hover:bg-gray-100 hover:scale-105 hover:shadow-lg"
            >
              {helpText}
            </button>
          </div>
        </div>
        <img
          src="/crying-bot.png"
          alt="Neo needs help"
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
