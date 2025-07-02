import React from "react";

interface HelpAcceptedOverlayProps {
  message?: string;
  imageSrc?: string;
}

export default function HelpAcceptedOverlay({
  message = `Yahooooo!\nThat's the spirit of an\ninnovator`,
}: HelpAcceptedOverlayProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
    >
      <div className="flex flex-row items-center justify-start w-full max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-3xl md:text-4xl font-extrabold text-white text-center whitespace-pre-line">
            {message}
          </div>
        </div>
        <img
          src="/happy-bot.png"
          alt="Happy bot"
          className="hidden md:block object-contain"
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
