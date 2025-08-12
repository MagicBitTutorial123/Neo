"use client";
import { useState } from "react";
import PlaygroundUnlocked from "@/components/PlaygroundUnlocked";

export default function PlaygroundUnlockedPage() {
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
      {showOverlay ? (
        <PlaygroundUnlocked />
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#222E3A] mb-4">
            Playground Unlocked Demo
          </h1>
          <p className="text-lg text-[#555] mb-6">
            This is a demo page for the playground unlocked overlay.
          </p>
          <button
            onClick={() => setShowOverlay(true)}
            className="bg-[#00AEEF] text-white px-6 py-3 rounded-lg hover:bg-[#0099CC] transition-colors"
          >
            Show Overlay Again
          </button>
        </div>
      )}
    </div>
  );
}
