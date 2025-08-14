"use client";
import { useState } from "react";
import SideNavbar from "@/components/SideNavbar";
import PlaygroundUnlocked from "@/components/PlaygroundUnlocked";

export default function DemoPage() {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8F9FC]">
      <SideNavbar playgroundActive={showOverlay} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#222E3A] mb-4">Demo</h1>
          <p className="text-lg text-gray-600 mb-8">
            Demo page for testing components!
          </p>

          {/* Demo Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => setShowOverlay(true)}
              className="px-6 py-3 bg-[#00AEEF] text-white rounded-full font-semibold hover:bg-[#0098D4] transition-colors shadow-lg hover:shadow-xl"
            >
              Show Playground Unlocked Overlay
            </button>

            <div className="text-sm text-gray-500 mt-4">
              Click the button above to see the playground unlocked celebration
              overlay
            </div>
          </div>
        </div>
      </div>

      {/* Playground Unlocked Overlay */}
      {showOverlay && (
        <PlaygroundUnlocked onClose={() => setShowOverlay(false)} />
      )}
    </div>
  );
}
