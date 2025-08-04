"use client";
import { useState, useEffect } from "react";
import MissionIntro from "@/components/MissionIntro";
import Header from "@/components/StatusHeaderBar";
import CongratsCard from "@/components/CongratsCard";
import StepQuestionCard from "@/components/StepQuestionCard";
import MCQCard from "@/components/MCQCard";
import HelpNeoOverlay from "@/components/HelpNeoOverlay";
import HelpAcceptedOverlay from "@/components/HelpAcceptedOverlay";
import { useRouter } from "next/navigation";
import { missions } from "@/data/missions";
import { useUser } from "@/context/UserContext";
import { completeMission1, completeMission2 } from "@/utils/userState";
import { MissionStatePersistence } from "@/utils/missionStatePersistence";
import BlocklyComponent from "@/components/Blockly/BlocklyComponent";

export default function BlocklySplitLayout({
  mission,
  sidebarCollapsed = false,
  onStateChange,
  forceHideIntro = false,
  onStepQuestionChange,
  onNiceChange,
  onDontWorryChange,
  onCongratsChange,
  onHelpAcceptedChange,
  onTryAgain,
  onMCQAnswer,
  onMCQChange,
  fromNo = false,
  onCurrentStepChange,
  onFinish,
}: {
  mission: any;
  sidebarCollapsed?: boolean;
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
  onMCQAnswer?: (selectedAnswer: number) => void;
  onMCQChange?: (show: boolean, stepIndex: number) => void;
  fromNo?: boolean;
  onCurrentStepChange?: (step: number) => void;
  onFinish?: () => void;
}) {
  const [showIntro, setShowIntro] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showStepQuestion, setShowStepQuestion] = useState(false);
  const [showMCQ, setShowMCQ] = useState(false);
  const [showNice, setShowNice] = useState(false);
  const [showDontWorry, setShowDontWorry] = useState(false);
  const [showHelpNeo, setShowHelpNeo] = useState(false);
  const [showHelpAccepted, setShowHelpAccepted] = useState(false);
  const [showPlaygroundUnlocked, setShowPlaygroundUnlocked] = useState(false);
  const [generatedCode,setGeneratedCode] = useState("")

  // Load saved state on mount
  useEffect(() => {
    const savedState = MissionStatePersistence.getMissionState(
      mission.id.toString()
    );
    if (savedState) {
      console.log("🔄 BlocklySplitLayout: Loading saved state:", savedState);
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
        "🎯 BlocklySplitLayout: forceHideIntro received, setting showIntro to false"
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

  // Notify parent when showMCQ changes
  useEffect(() => {
    // This will be handled by the parent page
  }, [showMCQ]);

  // Listen for goToNextStep event
  useEffect(() => {
    const handleGoToNextStep = () => {
      setCurrentStep((s: number) => s + 1);
    };

    window.addEventListener("goToNextStep", handleGoToNextStep);
    return () => {
      window.removeEventListener("goToNextStep", handleGoToNextStep);
    };
  }, []);

  // Store the user's preferred width
  const [userPanelWidth, setUserPanelWidth] = useState(200); // Initial size set to minimum
  const SIDEBAR_EXPANDED = 260;
  const SIDEBAR_COLLAPSED = 80;
  const leftPanelWidth =
    userPanelWidth +
    (sidebarCollapsed ? 0 : SIDEBAR_EXPANDED - SIDEBAR_COLLAPSED);
  const [isResizing, setIsResizing] = useState(false);
  const router = useRouter();
  const { userData, updateUserData, setUserData } = useUser();

  // Resizer functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const sidebarWidth = sidebarCollapsed
      ? SIDEBAR_COLLAPSED
      : SIDEBAR_EXPANDED;
    const newUserWidth = e.clientX - sidebarWidth - 20; // Account for sidebar and margins
    const minWidth = 100; // Allow making it even smaller
    const maxWidth = 800;
    if (newUserWidth >= minWidth && newUserWidth <= maxWidth) {
      setUserPanelWidth(newUserWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, sidebarCollapsed]);

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
  const isStep3 = currentStep === 2;

  // Next handler
  const handleNext = () => {
    // For Mission 3+, show MCQ question after each step (except last step)
    if (mission.id >= 3 && currentStep < mission.steps.length - 1) {
      onMCQChange?.(true, currentStep);
      return;
    }
    // For older missions, keep the original StepQuestion logic
    if (isStep3) {
      setShowStepQuestion(true);
      return;
    }
    if (isElevationStep) {
      return;
    }
    setCurrentStep((s: number) => s + 1);
  };

  // Previous handler
  const handlePrevious = () => {
    if (isElevationStep) {
      setCurrentStep(mission.steps.length - 2); // Go to second-to-last step
      return;
    }
    if (currentStep > 0) setCurrentStep((s: number) => s - 1);
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

    if (userData?.firebaseUid) {
      try {
        if (mission.id === 1) {
          await completeMission1(userData.firebaseUid);
        } else if (mission.id === 2) {
          await completeMission2(userData.firebaseUid);
        }
      } catch (error) {
        console.error("Failed to update mission progress:", error);
      }
    }

    if (mission.id === 2) {
      setShowPlaygroundUnlocked(true);
    } else {
      const nextMissionId = String(Number(mission.id) + 1);
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

  // MCQ handlers
  const handleMCQAnswer = (selectedAnswer: number) => {
    onMCQChange?.(false, currentStep);
    const currentStepData = mission.steps[currentStep];
    const isCorrect = selectedAnswer === currentStepData.mcq.correctAnswer;

    if (isCorrect) {
      setShowNice(true);
    } else {
      setShowDontWorry(true);
    }

    // Notify parent
    onMCQAnswer?.(selectedAnswer);
  };

  const handleNiceContinue = () => {
    setShowNice(false);
    setCurrentStep(mission.steps.length - 1);
  };
  const handleDontWorryContinue = () => {
    setShowDontWorry(false);
    setCurrentStep(mission.steps.length - 1);
  };
  const handleTryAgain = () => {
    setCurrentStep(0);
  };
  const handleFinish = () => {
    onFinish?.(); // Notify parent that finish was clicked
    // Trigger the final MCQ for the last step
    onMCQChange?.(true, mission.steps.length - 1);
  };

  // Mission header button handlers are now handled at page level

  useEffect(() => {
    if (showHelpAccepted) {
      const timeout = setTimeout(() => {
        router.push("/missions/2");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [showHelpAccepted, router]);

  if (showIntro && !forceHideIntro) {
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

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-row h-screen relative">
        {/* Split Content Area - Below the header */}
        <div className="relative h-screen flex w-full mt-16">
          {/* Left Side - Instructions and Images */}
          <div
            className="flex flex-col bg-[#F8F9FC]"
            style={{
              width: `${leftPanelWidth}px`,
              height: "calc(100vh - 80px)",
              maxHeight: "calc(100vh - 80px)",
              marginLeft: sidebarCollapsed ? "5px" : "10px",
            }}
          >
            <div className="h-full p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pt-10 pb-8">
              {mission.steps[currentStep] ? (
                <>
                  <div className="flex items-center mb-3">
                    <span
                      className="text-white text-xs font-bold px-5 py-1 mr-3"
                      style={{
                        background: "#222E3A",
                        clipPath:
                          "polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%, 0 0)",
                        display: "inline-block",
                        minWidth: "90px",
                        textAlign: "center",
                      }}
                    >
                      STEP {String(currentStep + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xl font-medium text-[#222E3A]">
                      {mission.steps[currentStep].title}
                    </span>
                  </div>

                  {mission.steps[currentStep].blocks && (
                    <div className="mb-3 ml-2 pt-2">
                      <h3 className="text-sm font-bold text-[#222E3A] mb-2">
                        Blocks:
                      </h3>
                      <ul className="space-y-2">
                        {mission.steps[currentStep].blocks.map(
                          (block: any, index: number) => (
                            <li key={index} className="flex items-center">
                              <span className="w-2 h-2 bg-[#F28B20] rounded-full mr-2"></span>
                              <span className="text-[#555] text-sm">
                                {block.name}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {mission.steps[currentStep].tryThis && (
                    <div className="mb-3 ml-2">
                      <h3 className="text-sm font-bold text-[#222E3A] mb-2">
                        Try This:
                      </h3>
                      <p className="text-[#555] text-sm">
                        {mission.steps[currentStep].tryThis}
                      </p>
                    </div>
                  )}

                  {mission.steps[currentStep].whyItWorks && (
                    <div className="mb-4 ml-2">
                      <h3 className="text-sm font-bold text-[#222E3A] mb-2">
                        Why It Works:
                      </h3>
                      <p className="text-[#555] text-sm">
                        {mission.steps[currentStep].whyItWorks}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center mb-8">
                    {mission.steps[currentStep].image && (
                      <div className="relative w-full max-w-[400px] bg-gray-100 rounded-xl overflow-hidden">
                        <img
                          src={mission.steps[currentStep].image}
                          alt={mission.steps[currentStep].title}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Step not found</p>
                </div>
              )}

              <div className="flex justify-between items-center px-2 mb-4 mt-8">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="w-24 px-4 py-2 rounded-full font-medium bg-[#E0E6ED] text-[#222E3A] hover:bg-[#D0D6DD] transition-colors"
                  >
                    Previous
                  </button>
                )}
                {currentStep === 0 && <div></div>}{" "}
                {currentStep < mission.steps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="w-24 px-4 py-2 rounded-full font-medium bg-black text-white hover:bg-[#222E3A] transition-colors ml-auto"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="w-24 px-4 py-2 rounded-full font-medium bg-black text-white hover:bg-[#222E3A] transition-colors ml-auto"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Resizer - Draggable divider */}
          <div
            className="w-1 bg-[#F8F9FC]-300 hover:bg-gray-400 cursor-ew-resize transition-colors"
            onMouseDown={handleMouseDown}
            style={{ cursor: isResizing ? "ew-resize" : "ew-resize" }}
          />
          <div className="flex-grow mb-16">
          {/* Right Side - Coding Workspace - Flex grow to fill remaining space */}
            <BlocklyComponent generatedCode={generatedCode} setGeneratedCode={setGeneratedCode}/>

          </div>
          {/* <div className="flex-grow bg-white border-2 rounded-lg shadow-md mt-4  mr-4 mb-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-[#E0E6ED]">
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-[#F28B20] text-white rounded-lg font-medium flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                    </svg>
                    Blocks
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 4v3h5v12l3-3-3-3V7h5V4H9z" />
                    </svg>
                    Code
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                    </svg>
                    Dashboard
                  </button>
                </div>
              </div>

              <div className="flex-1 p-8 ">
                <div className="h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-500 text-lg font-medium mb-2">
                      Coding Workspace
                    </div>
                    <div className="text-gray-400 text-sm">
                      Blockly component will be integrated here
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

        </div>
      </div>

      {/* Step Info Bar (Bottom) */}
      {/* <div className="w-full bg-white border-t border-[#E0E6ED] px-8 py-4 flex items-center justify-between max-w-7xl mx-auto mt-6 rounded-b-2xl">
        <div>
          <div className="text-lg font-bold text-[#222E3A]">
            Step {currentStep + 1}
          </div>
          <div className="text-base text-[#555] max-w-2xl">
            {mission.steps[currentStep].description}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 rounded-full font-medium bg-[#F0F4F8] text-[#222E3A] hover:bg-[#E0E6ED] transition-colors"
            >
              Prev.
            </button>
          )}
          {!isElevationStep && currentStep < mission.steps.length - 1 && (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-full font-medium bg-black text-white hover:bg-[#222E3A] transition-colors"
            >
              Next
            </button>
          )}
          {isElevationStep && !fromNo && (
            <button
              onClick={handleFinish}
              className="px-6 py-3 rounded-full font-medium bg-[#00AEEF] text-white hover:bg-[#0098D4] transition-colors"
            >
              Finish
            </button>
          )}
          {isElevationStep && fromNo && (
            <button
              onClick={handleTryAgain}
              className="px-6 py-3 rounded-full font-medium bg-[#D9F2FF] text-[#222E3A] hover:bg-[#B3E6FF] transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div> */}

      {/* All overlays are now handled at the page level */}
    </div>
  );
}

function PlaygroundUnlockedCard({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-lg px-12 py-10 flex flex-col items-center min-w-[350px] max-w-[90vw]">
        <div className="mb-4 text-3xl font-extrabold text-center">
          Playground Unlocked!
        </div>
        <div className="mb-4 text-center text-base font-medium text-[#222E3A]">
          You can now access the Playground from the sidebar and try out your
          own robot code!
        </div>
        <img
          src="/playground-unlocked-placeholder.png"
          alt="Playground Unlocked"
          className="mb-8 w-32 h-20 object-contain"
        />
        <button
          onClick={onContinue}
          className="px-8 py-2 rounded-xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
