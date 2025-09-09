"use client";

import React, { useState, useEffect } from "react";
import MissionIntro from "@/components/MissionIntro";
import MissionStep from "@/components/MissionStep";
import CongratsCard from "@/components/CongratsCard";
import StepQuestionCard from "@/components/StepQuestionCard";
import HelpNeoOverlay from "@/components/HelpNeoOverlay";
import HelpAcceptedOverlay from "@/components/HelpAcceptedOverlay";
import CountdownTimer from "@/components/CountdownTimer";
import StatusHeaderBar from "@/components/StatusHeaderBar";
import PlaygroundUnlocked from "@/components/PlaygroundUnlocked";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { MissionStatePersistence } from "@/utils/missionStatePersistence";
import { NormalizedMission } from "@/utils/normalizeMission";
import { updateUserXP } from "@/utils/queries";

export default function StandardMissionLayout({
  mission,
  onStateChange,
  forceHideIntro = false,
  onStepQuestionChange,
  onNiceChange,
  onDontWorryChange,
  onCongratsChange,
  onHelpAcceptedChange,
  onTryAgain,
  onCurrentStepChange,
  onFinish,
  showHeader = false,
}: {
  mission: NormalizedMission;
  onStateChange?: (state: {
    showIntro: boolean;
    showCountdown: boolean;
  }) => void;
  forceHideIntro?: boolean;
  onStepQuestionChange?: (show: boolean) => void;
  onNiceChange?: (show: boolean) => void;
  onDontWorryChange?: (show: boolean) => void;
  onCongratsChange?: (show: boolean) => void;
  onHelpAcceptedChange?: (show: boolean) => void;
  onTryAgain?: () => void;
  onCurrentStepChange?: (step: number) => void;
  onFinish?: () => void;
  showHeader?: boolean;
}) {
  const [showIntro, setShowIntro] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showStepQuestion, setShowStepQuestion] = useState(false);
  const [showNice, setShowNice] = useState(false);
  const [showDontWorry, setShowDontWorry] = useState(false);
  const [showHelpNeo, setShowHelpNeo] = useState(false);
  const [showHelpAccepted, setShowHelpAccepted] = useState(false);
  const [showPlaygroundUnlocked, setShowPlaygroundUnlocked] = useState(false);
  const [hasSeenStepQuestion, setHasSeenStepQuestion] = useState(false);
  const [fromNo, setFromNo] = useState(false); // Track if user clicked "No" in step question
  const [isFirstCompletion, setIsFirstCompletion] = useState(true); // Track if this is first completion
  const [missionStartTime, setMissionStartTime] = useState<Date | null>(null); // Track when mission started
  const [showPlaygroundUnlock, setShowPlaygroundUnlock] = useState(false); // Track if playground unlock should be shown
  const router = useRouter();
  const { userData, updateUserData } = useUser();

  // Debug playground unlock state changes
  useEffect(() => {
    console.log("🎯 showPlaygroundUnlock changed to:", showPlaygroundUnlock);
  }, [showPlaygroundUnlock]);

  // Load saved state on mount
  useEffect(() => {
    const savedState = MissionStatePersistence.getMissionState(
      mission.id.toString()
    );
    console.log(
      "🎯 StandardMissionLayout: Saved state for mission",
      mission.id,
      ":",
      savedState
    );
    if (savedState) {
      setCurrentStep(savedState.currentStep);
      setShowIntro(!savedState.showHeader);
      setShowCountdown(savedState.showCountdown);
      console.log(
        "🎯 StandardMissionLayout: Applied saved state - showCountdown:",
        savedState.showCountdown
      );
    }
  }, [mission.id]);

  // Notify parent of initial state
  useEffect(() => {
    console.log("🎯 StandardMissionLayout: Notifying parent of initial state");
    console.log(
      "🎯 StandardMissionLayout: onStateChange exists:",
      !!onStateChange
    );
    onStateChange?.({ showIntro: true, showCountdown: false });
  }, [onStateChange]);

  // Hide intro when forceHideIntro is true (after countdown completes)
  useEffect(() => {
    if (forceHideIntro) {
      setShowIntro(false);
      // Immediately notify parent that intro is hidden
      onStateChange?.({ showIntro: false, showCountdown: false });
    }
  }, [forceHideIntro, onStateChange]);

  // Notify parent when showStepQuestion changes
  useEffect(() => {
    onStepQuestionChange?.(showStepQuestion);
  }, [showStepQuestion, onStepQuestionChange]);

  // Notify parent when showNice changes
  useEffect(() => {
    onNiceChange?.(showNice);
  }, [showNice, onNiceChange]);

  // Notify parent when showDontWorry changes
  useEffect(() => {
    onDontWorryChange?.(showDontWorry);
  }, [showDontWorry, onDontWorryChange]);

  // Notify parent when showCongrats changes
  useEffect(() => {
    onCongratsChange?.(showCongrats);
  }, [showCongrats, onCongratsChange]);

  // Notify parent when showHelpAccepted changes
  useEffect(() => {
    onHelpAcceptedChange?.(showHelpAccepted);
  }, [showHelpAccepted, onHelpAcceptedChange]);

  // Notify parent when currentStep changes
  useEffect(() => {
    onCurrentStepChange?.(currentStep);
  }, [currentStep, onCurrentStepChange]);

  // Debug showCountdown changes
  useEffect(() => {
    console.log(
      "🎯 StandardMissionLayout: showCountdown changed to:",
      showCountdown
    );
  }, [showCountdown]);

  // Listen for step progression events from page-level overlays
  useEffect(() => {
    const handleGoToElevationStep = () => {
      setCurrentStep(mission.steps.length - 1); // Go to elevation step
    };

    window.addEventListener("goToElevationStep", handleGoToElevationStep);
    return () => {
      window.removeEventListener("goToElevationStep", handleGoToElevationStep);
    };
  }, [mission.steps.length]);

  const handleStart = () => {
    console.log(
      "🎯 StandardMissionLayout: handleStart called for mission",
      mission.id
    );
    console.log(
      "🎯 StandardMissionLayout: Before setShowCountdown - showCountdown:",
      showCountdown
    );

    // Clear any saved state that might interfere
    MissionStatePersistence.clearMissionState();

    // Hide intro and show countdown
    setShowIntro(false);
    setShowCountdown(true);
    console.log(
      "🎯 StandardMissionLayout: After setShowCountdown - showCountdown should be true"
    );
    onStateChange?.({ showIntro: false, showCountdown: true });
  };
  const handleCountdownGo = () => {
    console.log(
      "🎯 StandardMissionLayout: handleCountdownGo called for mission",
      mission.id
    );
    setShowCountdown(false);
    setShowIntro(false);
    // Reset to first step when starting the mission
    setCurrentStep(0);
    // Set mission start time
    setMissionStartTime(new Date());
    console.log(
      "🎯 StandardMissionLayout: Mission started, currentStep set to 0"
    );
    console.log("🎯 StandardMissionLayout: Notifying parent to show header");
    console.log(
      "🎯 StandardMissionLayout: onStateChange exists:",
      !!onStateChange
    );
    onStateChange?.({ showIntro: false, showCountdown: false }); // Notify parent to show header
  };

  // Helper to know if we're on the elevation step
  const isElevationStep = currentStep === mission.steps.length - 1;
  const isStep3 = currentStep === 2; // 0-based index

  // Next handler
  const handleNext = () => {
    if (isStep3) {
      // Only show StepQuestion if user hasn't seen it before in this session
      if (!hasSeenStepQuestion) {
        setShowStepQuestion(true);
        setHasSeenStepQuestion(true);
        return;
      } else {
        // User has already seen the question, go directly to elevation step
        const elevationStep = mission.steps.length - 1;
        setCurrentStep(elevationStep);
        onCurrentStepChange?.(elevationStep);
        return;
      }
    }
    if (isElevationStep) {
      // Only allow finish/try again here
      return;
    }
    const newStep = currentStep + 1;
    setCurrentStep(newStep);
    onCurrentStepChange?.(newStep);
  };

  // Previous handler
  const handlePrevious = () => {
    if (isElevationStep) {
      // Only Mission 1 has a special elevation step that goes back to step 3
      if (mission.id === "01") {
        setCurrentStep(2); // Go back to step 3 (index 2)
        onCurrentStepChange?.(2);
      } else {
        // For other missions, just go back one step
        const newStep = currentStep - 1;
        setCurrentStep(newStep);
        onCurrentStepChange?.(newStep);
      }
      return;
    }
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onCurrentStepChange?.(newStep);
    }
  };

  const handleBack = () => {
    setShowCongrats(false);

    // Check if this is Mission 2 first completion - show playground unlock
    const isMission2 =
      mission.id === "M2" || mission.id === "02" || mission.id === "2";
    if (isMission2 && isFirstCompletion) {
      console.log("🎯 Mission 2 - showing playground unlock overlay on back");
      setShowPlaygroundUnlock(true);
    } else if (isFirstCompletion) {
      // For other missions, show HelpNeo overlay for first completion
      setShowHelpNeo(true);
    } else {
      // For practice completion, just go back to missions list
      router.push("/missions");
    }
  };

  // Playground unlock handlers
  const handlePlaygroundUnlockClose = () => {
    setShowPlaygroundUnlock(false);
    // Navigate back to missions page
    router.push("/missions");
  };

  const handlePlaygroundUnlockNext = () => {
    setShowPlaygroundUnlock(false);
    // Navigate to next mission (Mission 3)
    const nextMissionId = String(Number(mission.id) + 1).padStart(2, "0");
    router.push(`/missions/${nextMissionId}`);
  };
  const handleNextMission = async () => {
    setShowCongrats(false);

    // Check if this is Mission 2 first completion - show playground unlock
    const isMission2 =
      mission.id === "M2" || mission.id === "02" || mission.id === "2";
    if (isMission2 && isFirstCompletion) {
      console.log(
        "🎯 Mission 2 - showing playground unlock overlay on next mission"
      );
      setShowPlaygroundUnlock(true);
    } else if (isFirstCompletion) {
      // For other missions, go to next mission
      const nextMissionId = String(Number(mission.id) + 1).padStart(2, "0");
      router.push(`/missions/${nextMissionId}`);
    } else {
      // For practice completion, go back to missions list
      router.push("/missions");
    }
  };

  // Overlay handlers
  const handleStepQuestionYes = () => {
    setShowStepQuestion(false);
    setShowNice(true);
    setFromNo(false); // Reset fromNo when user clicks "Yes"
  };
  const handleStepQuestionNo = () => {
    setShowStepQuestion(false);
    setShowDontWorry(true);
    setFromNo(true); // Set fromNo to true when user clicks "No"
  };
  const handleNiceContinue = () => {
    setShowNice(false);
    setCurrentStep(mission.steps.length - 1); // Go to elevation step
  };
  const handleDontWorryContinue = () => {
    setShowDontWorry(false);
    setCurrentStep(mission.steps.length - 1); // Go to elevation step
  };
  const handleTryAgain = () => {
    setCurrentStep(0); // Go to step 1
    setHasSeenStepQuestion(false); // Reset step question state
    setFromNo(false); // Reset fromNo state
    onTryAgain?.(); // Notify parent
  };

  // Calculate time spent on mission
  const calculateTimeSpent = (): string => {
    if (!missionStartTime) return "0:00";

    const now = new Date();
    const diffMs = now.getTime() - missionStartTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    return `${diffMins}:${diffSecs.toString().padStart(2, "0")}`;
  };

  const handleFinish = async () => {
    try {
      // Update user XP with mission total points
      if (userData?._id) {
        const result = await updateUserXP(
          userData._id,
          mission.id,
          mission.totalPoints
        );

        if (result.success) {
          console.log(
            `🎯 Mission ${mission.id} completed successfully: ${result.message}`
          );
          console.log(
            "🎯 Setting isFirstCompletion to TRUE (first completion)"
          );
          setIsFirstCompletion(true); // This is first completion

          // Update local user data
          const isMission2 =
            mission.id === "M2" || mission.id === "02" || mission.id === "2";
          updateUserData({
            xp: (userData.xp || 0) + result.xpAdded,
            missionProgress: result.missionProgress,
            hasCompletedMission2: isMission2
              ? true
              : userData.hasCompletedMission2,
          });

          // Trigger a custom event to refresh user data in parent components
          window.dispatchEvent(
            new CustomEvent("missionCompleted", {
              detail: {
                missionId: mission.id,
                xpAdded: result.xpAdded,
                newMissionProgress: result.missionProgress,
              },
            })
          );
        } else {
          console.log(
            `🎯 Mission ${mission.id} already completed: ${result.message}`
          );
          console.log(
            "🎯 Setting isFirstCompletion to FALSE (practice completion)"
          );
          setIsFirstCompletion(false); // This is practice completion
          // Still show congrats for practice completion
        }
      }

      onFinish?.(); // Notify parent that finish was clicked

      // Always show congrats card first
      setShowCongrats(true);
    } catch (error) {
      console.error("Error updating user XP:", error);
      // Still show congrats even if XP update fails
      onFinish?.();
      setShowCongrats(true);
    }
  };

  useEffect(() => {
    if (showHelpAccepted) {
      const timeout = setTimeout(() => {
        // Navigate to next mission for all missions
        const nextMissionId = String(Number(mission.id) + 1).padStart(2, "0");
        router.push(`/missions/${nextMissionId}`);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [showHelpAccepted, router, mission.id]);

  if (showIntro) {
    return (
      <MissionIntro
        missionNumber={Number(mission.id)}
        title={mission.title}
        timeAllocated={mission.intro.timeAllocated}
        image={mission.intro.image || mission.missionPageImage || ""}
        instructions={mission.missionDescription}
        onStart={handleStart}
        onMissionStart={handleCountdownGo}
      />
    );
  }

  // Show intro when showIntro is true and not forceHideIntro, or when countdown is active
  if ((showIntro && !forceHideIntro) || showCountdown) {
    return (
      <>
        <MissionIntro
          missionNumber={Number(mission.id)}
          title={mission.title}
          timeAllocated={mission.intro.timeAllocated}
          image={mission.intro.image || mission.missionPageImage || ""}
          instructions={mission.missionDescription}
          onStart={handleStart}
          onMissionStart={handleCountdownGo}
        />
        {/* Countdown Overlay on MissionIntro */}
        {showCountdown && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-85" />
            <CountdownTimer onGo={handleCountdownGo} />
          </div>
        )}
      </>
    );
  }

  // Safety check to ensure mission data is loaded
  if (!mission.steps || mission.steps.length === 0) {
    return <div>Loading mission data...</div>;
  }

  // Ensure currentStep is within valid bounds
  const validCurrentStep = Math.max(
    0,
    Math.min(currentStep, mission.steps.length - 1)
  );
  if (validCurrentStep !== currentStep) {
    console.warn(`Step index ${currentStep} adjusted to ${validCurrentStep}`);
    setCurrentStep(validCurrentStep);
    return <div>Loading...</div>;
  }

  // Get current step data safely
  const currentStepData = mission.steps[currentStep];
  if (!currentStepData) {
    console.error(`Step data not found for index ${currentStep}`);
    return <div>Error: Step data not found</div>;
  }

  // Debug step 4 image issue
  console.log(`🎯 Step ${currentStep + 1} data:`, {
    stepIndex: currentStep,
    stepDisplayNumber: currentStep + 1,
    title: currentStepData.title,
    image: currentStepData.image,
    hasImage: !!currentStepData.image,
    isElevationStep: currentStep === mission.steps.length - 1,
    totalSteps: mission.steps.length,
    allSteps: mission.steps.map((s, idx) => ({
      index: idx,
      displayNumber: idx + 1,
      title: s.title,
      image: s.image,
      hasImage: !!s.image,
    })),
  });

  // Always render MissionStep in the background
  return (
    <div className="relative h-full">
      {/* Always show header when not in intro or countdown */}
      {!showIntro && !showCountdown && (
        <StatusHeaderBar
          missionNumber={Number(mission.id)}
          title={mission.title}
          timeAllocated={mission.intro.timeAllocated}
          liveUsers={0}
          isConnected={false}
          setIsConnected={() => {}}
          onConnectionTypeChange={() => {}}
          setConnectionStatus={() => {}}
          connectionStatus="disconnected"
          connectionType="bluetooth"
          isUploading={false}
          isRunning={false}
        />
      )}

      {/* Main Content Area - Step Image Only */}
      <div className="pb-[220px] px-6 pt-6 mt-[65px] overflow-hidden">
        {/* Step Image Container - Fixed Size */}
        {currentStepData.image ? (
          <div className="mb-6 flex items-center justify-center">
            <div className="w-[800px] h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
              <img
                src={currentStepData.image}
                alt={`Step ${currentStep + 1}`}
                className="w-full h-full object-contain"
                onLoad={() =>
                  console.log(
                    `✅ Step ${currentStep + 1} image loaded successfully:`,
                    currentStepData.image
                  )
                }
                onError={(e) =>
                  console.error(
                    `❌ Step ${currentStep + 1} image failed to load:`,
                    currentStepData.image,
                    e
                  )
                }
              />
            </div>
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-center">
            <div className="w-[800px] h-[400px] bg-red-50 rounded-lg border-2 border-dashed border-red-200 flex items-center justify-center">
              <div className="text-center text-red-600">
                <p className="text-lg font-semibold">No Image Found</p>
                <p className="text-sm">Step {currentStep + 1}</p>
                <p className="text-xs mt-2">
                  Image property: {JSON.stringify(currentStepData.image)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEW: Enhanced Instruction Panel at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E0E6ED] py-4 px-6 z-50 min-h-[200px] max-h-[40vh] overflow-hidden shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-3">
            {/* Step Progress */}
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {mission.steps.length}
            </div>

            {/* Step Title */}
            {currentStepData.title && (
              <h3 className="text-lg font-semibold text-[#222E3A]">
                {currentStepData.title}
              </h3>
            )}

            {/* Step Instructions */}
            {currentStepData.text && (
              <p className="text-base text-[#333] leading-relaxed">
                {currentStepData.text}
              </p>
            )}

            {/* Navigation Buttons and Note Section - Side by Side */}
            <div className="flex flex-col lg:flex-row gap-4 mt-4 pt-3">
              {/* Step Note - Left Side */}
              {currentStepData.note &&
                currentStepData.note.trim().length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex-1">
                    <p className="text-sm text-amber-700">
                      <span className="font-semibold">Note:</span>{" "}
                      {currentStepData.note}
                    </p>
                  </div>
                )}

              {/* Navigation Buttons - Right Side */}
              <div className="flex flex-col gap-3 lg:min-w-[200px]">
                <div className="flex gap-3 flex-wrap">
                  {/* Previous Button */}
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Previous
                    </button>
                  )}

                  {/* Next Button */}
                  {!isElevationStep &&
                    currentStep < mission.steps.length - 1 && (
                      <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                      >
                        Next
                      </button>
                    )}

                  {/* Finish Button */}
                  {isElevationStep && !fromNo && (
                    <button
                      onClick={handleFinish}
                      className="px-6 py-2 bg-[#00AEEF] text-white rounded-lg hover:bg-[#0A6CFF] transition-colors font-medium"
                    >
                      Finish
                    </button>
                  )}

                  {/* Try Again Button */}
                  {isElevationStep && fromNo && (
                    <button
                      onClick={handleTryAgain}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* StepQuestionCard overlay */}
      {showStepQuestion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50 z-[60]" />
          <div className="relative z-[70]">
            <StepQuestionCard
              question="Did you follow the steps correctly?"
              onYes={handleStepQuestionYes}
              onNo={handleStepQuestionNo}
            />
          </div>
        </div>
      )}

      {/* Nice overlay */}
      {showNice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50 z-[60]" />
          <div className="relative z-[70]">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Great!</h3>
              <p className="mb-4">
                You&apos;re doing well! Let&apos;s continue to the final step.
              </p>
              <button
                onClick={handleNiceContinue}
                className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Don't Worry overlay */}
      {showDontWorry && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50 z-[60]" />
          <div className="relative z-[70]">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Don&apos;t Worry!</h3>
              <p className="mb-4">
                It&apos;s okay to make mistakes. Let&apos;s try the final step
                together.
              </p>
              <button
                onClick={handleDontWorryContinue}
                className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playground Unlock overlay - only for Mission 2 first completion */}
      {showPlaygroundUnlock && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-85" />
          <PlaygroundUnlocked
            onClose={handlePlaygroundUnlockClose}
            onNext={handlePlaygroundUnlockNext}
          />
        </div>
      )}

      {/* CongratsCard overlay */}
      {showCongrats && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-85" />
          <CongratsCard
            onBack={handleBack}
            onNextMission={handleNextMission}
            headline={
              isFirstCompletion ? "Congratulations!" : "Great Practice!"
            }
            subtitle={
              isFirstCompletion
                ? `You completed mission ${mission.id} successfully!`
                : `You completed mission ${mission.id} again for practice.`
            }
            points={isFirstCompletion ? mission.totalPoints : 0}
            nextMissionText={
              isFirstCompletion
                ? `Mission ${String(Number(mission.id) + 1).padStart(2, "0")}`
                : "Back to Missions"
            }
            isPracticeCompletion={!isFirstCompletion}
            timeSpent={calculateTimeSpent()}
          />
        </div>
      )}

      {/* Overlay for HelpNeoOverlay (after mission 1, on back from congrats) */}
      {showHelpNeo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" />
          <HelpNeoOverlay
            headline="Hey, Neo needs your help!"
            subtitle="He needs you the most right now!"
            imageSrc="/crying-bot.png"
            laterText="Yes, But later"
            helpText="I will help!"
            onLater={() => {
              setShowHelpNeo(false);
              router.push("/missions");
            }}
            onHelp={() => {
              setShowHelpNeo(false);
              setShowHelpAccepted(true);
            }}
          />
        </div>
      )}
      {showHelpAccepted && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" />
          <HelpAcceptedOverlay currentMissionId={String(mission.id)} />
        </div>
      )}
    </div>
  );
}
