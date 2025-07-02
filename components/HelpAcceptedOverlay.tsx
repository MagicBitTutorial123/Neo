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
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
  <div className="flex flex-col items-center justify-center flex-1">
    <div className="text-3xl md:text-4xl font-extrabold text-white text-center whitespace-pre-line -ml-50">
      {message}
    </div>
  </div>
  <img
    src="/happy-bot.png"
    alt="Happy bot"
    className="hidden md:block fixed right-0 bottom-0 object-contain"
    style={{
      height: "100vh",
      maxHeight: "100vh",
      width: "auto",
      zIndex: 5,
      pointerEvents: "none"
    }}
  />
</div>
    </div>
  );
}
