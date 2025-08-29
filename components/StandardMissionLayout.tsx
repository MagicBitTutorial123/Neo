"use client";
import { useState, useEffect } from "react";
import MissionIntro from "@/components/MissionIntro";
import MissionStep from "@/components/MissionStep";
import CongratsCard from "@/components/CongratsCard";
import StepQuestionCard from "@/components/StepQuestionCard";
import HelpNeoOverlay from "@/components/HelpNeoOverlay";
import HelpAcceptedOverlay from "@/components/HelpAcceptedOverlay";
import { useRouter } from "next/navigation";
import { missions } from "@/data/missions";
import { useUser } from "@/context/UserContext";
import { MissionStatePersistence } from "@/utils/missionStatePersistence";

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
  fromNo = false,
  onCurrentStepChange,
  onFinish,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mission: any;
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
  fromNo?: boolean;
  onCurrentStepChange?: (step: number) => void;
  onFinish?: () => void;
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
  const router = useRouter();
  const { userData, updateUserData, setUserData } = useUser();

  // Load saved state on mount
  useEffect(() => {
    const savedState = MissionStatePersistence.getMissionState(
      mission.id.toString()
    );
    if (savedState) {
      console.log("🔄 StandardMissionLayout: Loading saved state:", savedState);
      setCurrentStep(savedState.currentStep);
      setShowIntro(!savedState.showHeader);
      setShowCountdown(savedState.showCountdown);
    }
  }, [mission.id]);

  // Notify parent of initial state
  useEffect(() => {
    onStateChange?.({ showIntro: true, showCountdown: false });
  }, [onStateChange]);

  // Hide intro when forceHideIntro is true (after countdown completes)
  useEffect(() => {
    if (forceHideIntro) {
      console.log(
        "🎯 StandardMissionLayout: forceHideIntro received, setting showIntro to false"
      );
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

  // Optionally: overlays, motivational cards, etc.
  // const [showOverlay, setShowOverlay] = useState(false);

  const handleStart = () => {
    setShowCountdown(true);
    onStateChange?.({ showIntro: false, showCountdown: true });
  };
  const handleCountdownGo = () => {
    setShowCountdown(false);
    setShowIntro(false);
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
      if (mission.id === 1) {
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
    // Show HelpNeo overlay for all missions when back button is clicked
    setShowHelpNeo(true);
  };
  const handleNextMission = async () => {
    setShowCongrats(false);

   

    if (mission.id === 2) {
      setShowPlaygroundUnlocked(true);
    } else {
      // Find the next mission id
      const nextMissionId = String(Number(mission.id) + 1); 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((missions as any)[nextMissionId]) {
        router.push(`/missions/${nextMissionId}`);
      } else {
        router.push("/missions");
      }
    }
  };

  // Overlay handlers
  const handleStepQuestionYes = () => {
    setShowStepQuestion(false);
    setShowNice(true);
  };
  const handleStepQuestionNo = () => {
    setShowStepQuestion(false);
    setShowDontWorry(true);
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
    onTryAgain?.(); // Reset fromNo state
  };
  const handleFinish = () => {
    onFinish?.(); // Notify parent that finish was clicked
    setShowCongrats(true);
  };

  useEffect(() => {
    if (showHelpAccepted) {
      const timeout = setTimeout(() => {
        // Navigate to next mission for all missions
        const nextMissionId = String(Number(mission.id) + 1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((missions as any)[nextMissionId]) {
          router.push(`/missions/${nextMissionId}`);
        } else {
          router.push("/missions");
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [showHelpAccepted, router, mission.id]);

  if (showIntro) {
    return (
      <MissionIntro
        missionNumber={mission.id}
        title={mission.title}
        timeAllocated={mission.intro.timeAllocated}
        image={mission.intro.image}
        instructions={mission.intro.description}
        onStart={handleStart}
        onMissionStart={handleCountdownGo}
      />
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

  // Always render MissionStep in the background
  return (
    <div className="relative h-full">
      <MissionStep
        missionNumber={mission.id}
        stepNumber={currentStep + 1}
        title={mission.title}
        timeAllocated={mission.intro.timeAllocated}
        liveUsers={17}
        stepTitle={currentStepData.title}
        stepDescription={currentStepData.description}
        stepImage={currentStepData.image}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onFinish={handleFinish}
        showPreviousButton={currentStep > 0}
        showNextButton={
          !isElevationStep && currentStep < mission.steps.length - 1
        }
        showFinishButton={isElevationStep && !fromNo}
        showTryAgainButton={isElevationStep && fromNo}
        nextButtonText="Next"
        previousButtonText="Prev."
        finishButtonText="Finish"
        tryAgainButtonText="Try Again"
        onTryAgain={handleTryAgain}
      />
      {/* StepQuestionCard overlay is now handled at the page level */}
      {/* Nice overlay is now handled at the page level */}
      {/* Don't Worry overlay is now handled at the page level */}
      {/* CongratsCard overlay is now handled at the page level */}
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
      {/* Overlay for PlaygroundUnlockedCard */}
      {/* {showPlaygroundUnlocked && (
        <PlaygroundUnlockedCard
          onContinue={async () => {
            setShowPlaygroundUnlocked(false);

            if (userData?.firebaseUid) {
              try {
                // Update user state in backend
                const updatedUser = await completeMission2(
                  userData.firebaseUid
                );
                console.log("Backend update successful:", updatedUser);

                // Update local user data with the response
                setUserData(updatedUser);

                router.push("/home");
              } catch (error) {
                console.error("Failed to update user state:", error);
                // Fallback to localStorage if backend fails
                localStorage.setItem("hasCompletedMission2", "true");
                localStorage.setItem("isNewUser", "false");
                router.push("/home");
              }
            } else {
              // Fallback if no user data
              localStorage.setItem("hasCompletedMission2", "true");
              localStorage.setItem("isNewUser", "false");
              router.push("/home");
            }
          }}
        />
      )} */}
    </div>
  );
}

// function PlaygroundUnlockedCard({ onContinue }: { onContinue: () => void }) {
//   return (
//     <div
//       className="fixed inset-0 flex items-center justify-center z-[60]"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//     >
//       <div className="bg-white rounded-2xl shadow-lg px-12 py-10 flex flex-col items-center min-w-[350px] max-w-[90vw]">
//         <div className="mb-4 text-3xl font-extrabold text-center">
//           Playground Unlocked!
//         </div>
//         <div className="mb-4 text-center text-base font-medium text-[#222E3A]">
//           You can now access the Playground from the sidebar and try out your
//           own robot code!
//         </div>
//         <img
//           src="/playground-unlocked-placeholder.png"
//           alt="Playground Unlocked"
//           className="mb-8 w-32 h-20 object-contain"
//         />
//         <button
//           onClick={onContinue}
//           className="px-8 py-2 rounded-xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition"
//         >
//           Continue
//         </button>
//       </div>
//     </div>
//   );
// }
