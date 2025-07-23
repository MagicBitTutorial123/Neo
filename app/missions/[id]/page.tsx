"use client";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { missions } from "@/data/missions";
import { missionLayoutMap } from "@/data/missionLayoutMap";
import StandardMissionLayout from "@/components/StandardMissionLayout";
import BlocklySplitLayout from "@/components/BlocklySplitLayout";
import SideNavbar from "@/components/SideNavbar";
import MissionHeader from "@/components/MissionHeader";
import CountdownTimer from "@/components/CountdownTimer";
import StepQuestionCard from "@/components/StepQuestionCard";
import CongratsCard from "@/components/CongratsCard";
import HelpNeoOverlay from "@/components/HelpNeoOverlay";
import HelpAcceptedOverlay from "@/components/HelpAcceptedOverlay";

const validMissionIds = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
] as const;
type MissionId = (typeof validMissionIds)[number];

export default function MissionPage() {
  const params = useParams();
  let id = params.id;
  if (Array.isArray(id)) id = id[0];
  id = String(id);
  if (!validMissionIds.includes(id as MissionId)) {
    return <div>Mission not found</div>;
  }
  const mission = missions[id as MissionId];
  const layoutType = missionLayoutMap[id as MissionId] || "standardIntroLayout";

  // State for mission header buttons
  const [isRunning, setIsRunning] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [forceHideIntro, setForceHideIntro] = useState(false);

  // Overlay states - moved to page level
  const [showStepQuestion, setShowStepQuestion] = useState(false);
  const [showNice, setShowNice] = useState(false);
  const [showDontWorry, setShowDontWorry] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showHelpNeo, setShowHelpNeo] = useState(false);
  const [showHelpAccepted, setShowHelpAccepted] = useState(false);
  const [showPlaygroundUnlocked, setShowPlaygroundUnlocked] = useState(false);
  const [fromNo, setFromNo] = useState(false);

  // Show header when forceHideIntro is true (backup method)
  useEffect(() => {
    if (forceHideIntro) {
      console.log("🔄 forceHideIntro is true, showing header");
      setShowHeader(true);
    }
  }, [forceHideIntro]);

  const handleRun = () => {
    console.log("🚀 Run button clicked from page level!");
    setIsRunning(true);
  };

  const handlePause = () => {
    console.log("⏸️ Pause button clicked from page level!");
    setIsRunning(false);
  };

  const handleErase = () => {
    console.log("🧹 Erase button clicked from page level!");
    // Add erase functionality here
  };

  // Overlay handlers
  const handleStepQuestionYes = () => {
    setShowStepQuestion(false);
    setShowNice(true);
    setFromNo(false);
  };

  const handleStepQuestionNo = () => {
    setShowStepQuestion(false);
    setShowDontWorry(true);
    setFromNo(true);
  };

  const handleNiceContinue = () => {
    setShowNice(false);
    // Trigger step progression in StandardMissionLayout
    if (layoutType === "standardIntroLayout") {
      // We need to communicate with StandardMissionLayout to go to elevation step
      // For now, we'll use a custom event or state
      window.dispatchEvent(new CustomEvent("goToElevationStep"));
    }
  };

  const handleDontWorryContinue = () => {
    setShowDontWorry(false);
    // Trigger step progression in StandardMissionLayout
    if (layoutType === "standardIntroLayout") {
      // We need to communicate with StandardMissionLayout to go to elevation step
      window.dispatchEvent(new CustomEvent("goToElevationStep"));
    }
  };

  const handleBack = () => {
    setShowCongrats(false);
    if (mission.id === 1) {
      setShowHelpNeo(true);
      return;
    }
  };

  const handleNextMission = async () => {
    setShowCongrats(false);
    // Navigate to next mission
    const nextMissionId = String(Number(mission.id) + 1);
    window.location.href = `/missions/${nextMissionId}`;
  };

  const handleTryAgain = () => {
    setShowDontWorry(false);
    setFromNo(false);
    // Reset to previous step
  };

  const handleFinish = () => {
    setShowCongrats(true);
  };

  const handleStateChange = useCallback(
    (state: { showIntro: boolean; showCountdown: boolean }) => {
      console.log("🔄 handleStateChange called:", state);
      const shouldShowHeader = !state.showIntro && !state.showCountdown;
      console.log("📊 shouldShowHeader:", shouldShowHeader);
      setShowHeader(shouldShowHeader);
      // Only set showCountdown to true when requested, never set to false here
      if (state.showCountdown) setShowCountdown(true);
    },
    []
  );

  const handleCountdownComplete = () => {
    console.log("🎯 handleCountdownComplete called");
    setShowCountdown(false);
    setForceHideIntro(true);
    setShowHeader(true); // Ensure header is visible after countdown
    console.log("✅ setShowHeader(true) called");
  };

  // Navigate to next mission after HelpAccepted overlay
  useEffect(() => {
    if (showHelpAccepted) {
      const timeout = setTimeout(() => {
        // Navigate to next mission
        const nextMissionId = String(Number(mission.id) + 1);
        window.location.href = `/missions/${nextMissionId}`;
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [showHelpAccepted, mission.id]);

  switch (layoutType) {
    case "standardIntroLayout":
      return (
        <div className="flex h-screen bg-white relative overflow-hidden">
          {/* Mission Header - Full width behind everything including sidebar */}
          {showHeader && (
            <div className="absolute top-0 left-0 right-0 z-40">
              <MissionHeader
                missionNumber={mission.id}
                title={mission.title}
                timeAllocated={mission.intro.timeAllocated}
                liveUsers={17}
                onRun={handleRun}
                onPause={handlePause}
                onErase={handleErase}
                isRunning={isRunning}
                sidebarCollapsed={sidebarCollapsed}
              />
            </div>
          )}

          <SideNavbar onCollapse={setSidebarCollapsed} />
          <div className="flex-1 overflow-hidden relative z-30">
            <StandardMissionLayout
              mission={mission}
              onStateChange={handleStateChange}
              forceHideIntro={forceHideIntro}
              fromNo={fromNo}
              onStepQuestionChange={setShowStepQuestion}
              onNiceChange={setShowNice}
              onDontWorryChange={setShowDontWorry}
              onCongratsChange={setShowCongrats}
              onHelpAcceptedChange={setShowHelpAccepted}
              onTryAgain={handleTryAgain}
            />
          </div>

          {/* Countdown Overlay - Covers everything */}
          {showCountdown && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            >
              <CountdownTimer onGo={handleCountdownComplete} />
            </div>
          )}

          {/* All overlays at page level with z-[99999] */}
          {showStepQuestion && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <div className="relative bg-white rounded-2xl shadow-lg px-12 py-10 flex flex-col items-center min-w-[350px] max-w-[90vw]">
                <div className="mb-8 text-center text-base font-medium text-[#222E3A]">
                  Did you follow the steps correctly?
                </div>
                <div className="flex gap-6">
                  <button
                    onClick={handleStepQuestionNo}
                    className="px-8 py-2 rounded-xl bg-[#D9F2FF] text-[#222E3A] font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#00AEEF] transition"
                  >
                    No
                  </button>
                  <button
                    onClick={handleStepQuestionYes}
                    className="px-8 py-2 rounded-xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          )}

          {showNice && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <div className="relative bg-white rounded-2xl shadow-lg px-12 py-10 flex flex-col items-center min-w-[350px] max-w-[90vw]">
                <div className="mb-4 text-3xl font-extrabold text-center">
                  Nice!
                </div>
                <div className="mb-8 text-center text-base font-medium text-[#222E3A]">
                  Let's see if you are correct or wrong.
                </div>
                <button
                  onClick={handleNiceContinue}
                  className="px-8 py-2 rounded-xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {showDontWorry && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <div className="relative bg-white rounded-2xl shadow-lg px-12 py-10 flex flex-col items-center min-w-[350px] max-w-[90vw]">
                <div className="mb-4 text-3xl font-extrabold text-center">
                  Don't worry!
                </div>
                <div className="mb-4 text-center text-base font-medium text-[#222E3A]">
                  Check the images of elevation and try again.
                </div>
                <img
                  src="/dont-worry-card-image.png"
                  alt="Don't worry"
                  className="mb-8 w-32 h-20 object-contain"
                />
                <button
                  onClick={handleDontWorryContinue}
                  className="px-8 py-2 rounded-xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {showCongrats && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <CongratsCard
                onBack={mission.id === 2 ? () => {} : handleBack}
                onNextMission={handleNextMission}
                headline="Congratulations!"
                subtitle={`You completed mission ${mission.id} successfully.`}
                points={0}
                timeSpent="3:00"
                robotImageSrc="/confettiBot.png"
                backText={mission.id === 2 ? "" : "Back"}
                nextMissionText={mission.id === 2 ? "Continue" : "Next Mission"}
              />
            </div>
          )}

          {showHelpNeo && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <HelpNeoOverlay
                headline="Hey, Neo needs your help!"
                subtitle="He needs you the most right now!"
                imageSrc="/crying-bot.png"
                laterText="Yes, But later"
                helpText="I will help!"
                onLater={() => {
                  setShowHelpNeo(false);
                  window.location.href = "/missions";
                }}
                onHelp={() => {
                  setShowHelpNeo(false);
                  setShowHelpAccepted(true);
                }}
              />
            </div>
          )}

          {showHelpAccepted && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              onClick={() => setShowHelpAccepted(false)}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <HelpAcceptedOverlay />
            </div>
          )}

          {showPlaygroundUnlocked && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <div className="bg-white rounded-2xl shadow-lg px-12 py-10 flex flex-col items-center min-w-[350px] max-w-[90vw]">
                <div className="mb-4 text-3xl font-extrabold text-center">
                  Playground Unlocked!
                </div>
                <div className="mb-4 text-center text-base font-medium text-[#222E3A]">
                  You can now access the Playground from the sidebar and try out
                  your own robot code!
                </div>
                <img
                  src="/playground-unlocked-placeholder.png"
                  alt="Playground Unlocked"
                  className="mb-8 w-32 h-20 object-contain"
                />
                <button
                  onClick={() => setShowPlaygroundUnlocked(false)}
                  className="px-8 py-2 rounded-xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      );
    case "blocklySplitLayout":
      return (
        <div className="flex h-screen bg-white relative overflow-hidden">
          {/* Mission Header - Full width behind everything including sidebar */}
          {showHeader && (
            <div className="absolute top-0 left-0 right-0 z-40">
              <MissionHeader
                missionNumber={mission.id}
                title={mission.title}
                timeAllocated={mission.intro.timeAllocated}
                liveUsers={17}
                onRun={handleRun}
                onPause={handlePause}
                onErase={handleErase}
                isRunning={isRunning}
                sidebarCollapsed={sidebarCollapsed}
              />
            </div>
          )}

          <SideNavbar onCollapse={setSidebarCollapsed} />
          <div className="flex-1 overflow-hidden relative z-30">
            <BlocklySplitLayout
              mission={mission}
              onStateChange={handleStateChange}
              forceHideIntro={forceHideIntro}
            />
          </div>

          {/* Countdown Overlay - Covers everything */}
          {showCountdown && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
            >
              <CountdownTimer onGo={handleCountdownComplete} />
            </div>
          )}
        </div>
      );
    default:
      return <div>Unknown layout</div>;
  }
}
