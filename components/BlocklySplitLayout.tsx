"use client";
import { useState, useEffect } from "react";
import MissionIntro from "@/components/MissionIntro";
import CountdownTimer from "@/components/CountdownTimer";
import StatusHeaderBar from "@/components/StatusHeaderBar";

// import StepQuestionCard from "@/components/StepQuestionCard";
import MCQCard from "@/components/MCQCard";
import StepSuccessCard from "@/components/StepSuccessCard";
import StepRetryCard from "@/components/StepRetryCard";
import CongratsCard from "@/components/CongratsCard";
// import HelpNeoOverlay from "@/components/HelpNeoOverlay";
// import HelpAcceptedOverlay from "@/components/HelpAcceptedOverlay";
// import { useRouter } from "next/navigation";
// import { missions } from "@/data/missions";
// import { useUser } from "@/context/UserContext";
import { MissionStatePersistence } from "@/utils/missionStatePersistence";
import { updateUserXP, isMissionAlreadyCompleted } from "@/utils/queries";
import { useUser } from "@/context/UserContext";
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
  // onTryAgain,
  onMCQAnswer,
  onMCQChange,
  // fromNo = false,
  onCurrentStepChange,
  onFinish,
  onUploadCode,
  showHeader = false,
}: // isUploading = false,
{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  onUploadCode?: (code: string) => void;
  isUploading?: boolean;
  showHeader?: boolean;
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
  const [generatedCode, setGeneratedCode] = useState("");
  const [answeredMCQs, setAnsweredMCQs] = useState<Set<number>>(new Set());
  const [isPracticeCompletion, setIsPracticeCompletion] = useState(false);
  const [missionStartTime, setMissionStartTime] = useState<Date | null>(null);
  const { userData, updateUserData } = useUser();

  // Debug: Monitor generatedCode changes
  useEffect(() => {
    console.log("🔄 BlocklySplitLayout: generatedCode changed:", {
      length: generatedCode?.length,
      content:
        generatedCode?.substring(0, 100) +
        (generatedCode?.length > 100 ? "..." : ""),
    });
  }, [generatedCode]);

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

    // Debug mission data structure
    console.log("🎯 Mission data loaded:", {
      id: mission.id,
      title: mission.title,
      stepsCount: mission.steps?.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      steps: mission.steps?.map((step: any, index: number) => ({
        index,
        title: step.title,
        hasMCQ: !!step.mcq,
        mcqQuestion: step.mcq?.question,
        mcqOptions: step.mcq?.options,
        mcqCorrectAnswer: step.mcq?.correctAnswer,
        isLastStep: index === mission.steps.length - 1,
      })),
    });

    // Specifically check the last step
    if (mission.steps?.length > 0) {
      const lastStep = mission.steps[mission.steps.length - 1];
      console.log("🎯 Last step details:", {
        index: mission.steps.length - 1,
        title: lastStep.title,
        hasMCQ: !!lastStep.mcq,
        mcqData: lastStep.mcq,
        fullStepData: lastStep,
      });
    }
  }, [mission.id, mission.steps]);

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

  // Debug showCongrats changes
  useEffect(() => {
    console.log("🎯 showCongrats changed to:", showCongrats);
  }, [showCongrats]);

  // Debug answeredMCQs changes
  useEffect(() => {
    console.log("🎯 answeredMCQs changed:", Array.from(answeredMCQs));
  }, [answeredMCQs]);

  // Check if mission has been completed before (for Mission 3+)
  useEffect(() => {
    const checkMissionCompletion = async () => {
      if (!userData?._id) return;

      const missionNumber = parseInt(mission.id.replace(/\D/g, "")) || 0;
      if (missionNumber >= 3) {
        try {
          const alreadyCompleted = await isMissionAlreadyCompleted(
            userData._id,
            mission.id
          );
          console.log("🎯 Mission completion check:", {
            missionId: mission.id,
            missionNumber,
            alreadyCompleted,
            isPracticeCompletion: alreadyCompleted,
          });
          setIsPracticeCompletion(alreadyCompleted);
        } catch (error) {
          console.error("🎯 Error checking mission completion:", error);
          setIsPracticeCompletion(false);
        }
      }
    };

    checkMissionCompletion();
  }, [userData?._id, mission.id]);

  // Listen for goToNextStep event
  useEffect(() => {
    const handleGoToNextStep = () => {
      setCurrentStep((s: number) => s + 1);
    };

    const handleTriggerCodeUpload = () => {
      console.log("🚀 handleTriggerCodeUpload called");
      console.log("onUploadCode exists:", !!onUploadCode);
      console.log("generatedCode length:", generatedCode?.length);
      console.log("generatedCode content:", generatedCode);
      if (onUploadCode && generatedCode) {
        console.log("Calling onUploadCode with generated code");
        // Store the code before calling onUploadCode to ensure it's preserved
        const codeToUpload = generatedCode;
        onUploadCode(codeToUpload);
        console.log(
          "onUploadCode called, generatedCode should still be:",
          codeToUpload
        );
      } else {
        console.log("Cannot upload: onUploadCode or generatedCode missing");
      }
    };

    const handleGenerateCode = () => {
      console.log("📡 handleGenerateCode event received in BlocklySplitLayout");
      // Dispatch event to BlocklyComponent to generate code
      window.dispatchEvent(new CustomEvent("generateCodeFromWorkspace"));
      console.log("Generate code event dispatched to BlocklyComponent");
    };

    const handleClearWorkspace = () => {
      // Clear the generated code
      setGeneratedCode("");
      // Dispatch an event to clear the Blockly workspace
      window.dispatchEvent(new CustomEvent("clearBlocklyWorkspace"));
    };

    window.addEventListener("goToNextStep", handleGoToNextStep);
    window.addEventListener("triggerCodeUpload", handleTriggerCodeUpload);
    window.addEventListener("generateCode", handleGenerateCode);
    window.addEventListener("clearBlocklyWorkspace", handleClearWorkspace);
    return () => {
      window.removeEventListener("goToNextStep", handleGoToNextStep);
      window.removeEventListener("triggerCodeUpload", handleTriggerCodeUpload);
      window.removeEventListener("generateCode", handleGenerateCode);
      window.removeEventListener("clearBlocklyWorkspace", handleClearWorkspace);
    };
  }, [onUploadCode, generatedCode]);

  // Store the user's preferred width
  const [userPanelWidth, setUserPanelWidth] = useState(200); // Initial size set to minimum
  const SIDEBAR_EXPANDED = 260;
  const SIDEBAR_COLLAPSED = 80;

  // Define min and max width constraints
  const MIN_PANEL_WIDTH = 240; // Minimum width for usability
  const MAX_PANEL_WIDTH = 500; // Maximum width to maintain good layout balance

  // Apply width constraints
  const leftPanelWidth = Math.max(
    MIN_PANEL_WIDTH,
    Math.min(MAX_PANEL_WIDTH, userPanelWidth)
  );
  const [isResizing, setIsResizing] = useState(false);
  // const router = useRouter();
  // const { userData, updateUserData, setUserData } = useUser();

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

    // Apply min/max constraints
    if (newUserWidth >= MIN_PANEL_WIDTH && newUserWidth <= MAX_PANEL_WIDTH) {
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
  }, [handleMouseMove, isResizing]);

  const handleStart = () => {
    setShowIntro(false);
    setShowCountdown(true);
    onStateChange?.({ showIntro: false, showCountdown: true });
  };
  const handleCountdownGo = () => {
    setShowCountdown(false);
    setShowIntro(false);
    // Set mission start time when countdown finishes
    const startTime = new Date();
    setMissionStartTime(startTime);
    console.log("🎯 BlocklySplitLayout: Mission start time set:", startTime);
    onStateChange?.({ showIntro: false, showCountdown: false });
  };

  // Calculate time spent on mission
  const calculateTimeSpent = (): string => {
    if (!missionStartTime) {
      console.log(
        "🎯 calculateTimeSpent: No mission start time, returning 0:00"
      );
      return "0:00";
    }

    const now = new Date();
    const diffMs = now.getTime() - missionStartTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    const timeSpent = `${diffMins}:${diffSecs.toString().padStart(2, "0")}`;

    console.log("🎯 calculateTimeSpent:", {
      missionStartTime,
      now,
      diffMs,
      diffMins,
      diffSecs,
      timeSpent,
    });

    return timeSpent;
  };

  // Helper to know if we're on the elevation step
  const isElevationStep = currentStep === mission.steps.length - 1;
  const isStep3 = currentStep === 2;

  // Next handler
  const handleNext = () => {
    const missionNumber = parseInt(mission.id.replace(/\D/g, "")) || 0;
    const isLastStep = currentStep === mission.steps.length - 1;

    console.log("🎯 handleNext called:", {
      missionNumber,
      currentStep,
      totalSteps: mission.steps.length,
      isLastStep,
      currentStepData: mission.steps[currentStep],
      hasMCQ: mission.steps[currentStep]?.mcq,
      mcqQuestion: mission.steps[currentStep]?.mcq?.question,
      mcqOptions: mission.steps[currentStep]?.mcq?.options,
      stepDisplayNumber: currentStep + 1, // Human-readable step number
    });

    // For Mission 3+, show MCQ question after each step (including last step)
    if (missionNumber >= 3) {
      const currentStepData = mission.steps[currentStep];
      const hasMCQ =
        currentStepData?.mcq?.question && currentStepData?.mcq?.options;
      const isMCQAnswered = answeredMCQs.has(currentStep);

      console.log("🎯 MCQ Check:", {
        currentStep,
        hasMCQ,
        isMCQAnswered,
        answeredMCQs: Array.from(answeredMCQs),
      });

      if (hasMCQ && !isMCQAnswered) {
        console.log("🎯 Showing MCQ for step:", currentStep);
        setShowMCQ(true);
        onMCQChange?.(true, currentStep);
        return;
      } else if (hasMCQ && isMCQAnswered) {
        console.log(
          "🎯 MCQ already answered for step:",
          currentStep,
          "- skipping to next step"
        );
        // MCQ already answered, move to next step
        if (currentStep < mission.steps.length - 1) {
          console.log("🎯 Moving to next step");
          setCurrentStep((s: number) => s + 1);
        } else {
          console.log("🎯 Last step MCQ already answered, showing congrats");
          handleMissionComplete();
          setShowCongrats(true);
        }
        return;
      } else {
        console.log("🎯 No MCQ data found for step:", currentStep);
        console.log("🎯 Current step data:", currentStepData);
        // No MCQ data, skip to next step or finish
        if (currentStep < mission.steps.length - 1) {
          console.log("🎯 Moving to next step");
          setCurrentStep((s: number) => s + 1);
        } else {
          console.log("🎯 Last step without MCQ, showing congrats");
          console.log("🎯 Calling handleMissionComplete and setShowCongrats");
          // Last step without MCQ, show congrats
          handleMissionComplete();
          setShowCongrats(true);
        }
        return;
      }
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
    const missionNumber = parseInt(mission.id.replace(/\D/g, "")) || 0;
    if (missionNumber === 1) {
      setShowHelpNeo(true);
      return;
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
    const isLastStep = currentStep === mission.steps.length - 1;
    console.log("🎯 handleMCQAnswer called:", {
      selectedAnswer,
      currentStep,
      stepDisplayNumber: currentStep + 1,
      totalSteps: mission.steps.length,
      isLastStep,
      correctAnswer: mission.steps[currentStep]?.mcq?.correctAnswer,
      isCorrect:
        selectedAnswer === mission.steps[currentStep]?.mcq?.correctAnswer,
    });

    setShowMCQ(false);
    onMCQChange?.(false, currentStep);
    const currentStepData = mission.steps[currentStep];
    const isCorrect = selectedAnswer === currentStepData.mcq.correctAnswer;

    // Mark MCQ as answered only if the answer is correct
    if (isCorrect) {
      console.log(
        "🎯 Correct answer - marking MCQ as answered for step:",
        currentStep
      );
      setAnsweredMCQs((prev) => new Set([...prev, currentStep]));

      if (isLastStep) {
        console.log("🎯 Last step correct answer - showing success card first");
        // Last step with correct answer - show success card first, then complete mission
        setShowNice(true);
      } else {
        console.log("🎯 Correct answer - showing success card");
        // Not last step - show success card
        setShowNice(true);
      }
    } else {
      console.log(
        "🎯 Wrong answer - showing retry card (MCQ not marked as answered)"
      );
      if (isLastStep) {
        console.log("🎯 Wrong answer on LAST step - will retry same question");
      }
      // Wrong answer - show retry card (don't mark as answered)
      setShowDontWorry(true);
    }

    // Notify parent
    onMCQAnswer?.(selectedAnswer);
  };

  const handleNiceContinue = () => {
    setShowNice(false);
    const isLastStep = currentStep === mission.steps.length - 1;

    if (isLastStep) {
      console.log("🎯 handleNiceContinue - last step, completing mission");
      console.log("🎯 Mission completion details:", {
        missionId: mission.id,
        missionNumber: parseInt(mission.id.replace(/\D/g, "")) || 0,
        totalSteps: mission.steps.length,
        currentStep,
        isLastStep,
      });
      // Last step - complete mission and show congrats
      handleMissionComplete();
      setShowCongrats(true);
    } else {
      console.log("🎯 handleNiceContinue - moving to next step");
      // Not last step - move to next step
      setCurrentStep((s: number) => s + 1);
    }
  };
  const handleDontWorryContinue = () => {
    console.log(
      "🎯 handleDontWorryContinue called - staying on step:",
      currentStep
    );
    setShowDontWorry(false);
    // Don't advance to next step - stay on current step and show MCQ again
    const missionNumber = parseInt(mission.id.replace(/\D/g, "")) || 0;
    if (missionNumber >= 3) {
      const currentStepData = mission.steps[currentStep];
      if (currentStepData?.mcq?.question && currentStepData?.mcq?.options) {
        console.log("🎯 Retrying MCQ for step:", currentStep);
        setShowMCQ(true);
        onMCQChange?.(true, currentStep);
      } else {
        console.log("🎯 No MCQ data found for retry on step:", currentStep);
      }
    }
  };
  const handleTryAgain = () => {
    setCurrentStep(0);
    setAnsweredMCQs(new Set()); // Clear answered MCQs
    MissionStatePersistence.clearMissionState();
  };
  const handleFinish = () => {
    onFinish?.(); // Notify parent that finish was clicked
    // Trigger the final MCQ for the last step
    onMCQChange?.(true, mission.steps.length - 1);
  };

  // Mission completion handler
  const handleMissionComplete = async () => {
    console.log("🎯 handleMissionComplete called");
    console.log("🎯 User data:", {
      userId: userData?._id,
      hasUserData: !!userData,
    });
    console.log("🎯 Is practice completion:", isPracticeCompletion);

    if (!userData?._id) {
      console.log("❌ No user data available for mission completion");
      return;
    }

    // Only update XP and mission progress for first completions, not practice
    if (!isPracticeCompletion) {
      try {
        const missionNumber = parseInt(mission.id.replace(/\D/g, "")) || 0;
        const totalPoints = mission.steps.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (sum: number, step: any) => sum + (step.points || 0),
          0
        );

        console.log(
          `🎯 First completion - updating XP and mission progress for mission ${missionNumber} with ${totalPoints} points`
        );
        console.log("🎯 Mission details:", {
          missionId: mission.id,
          missionNumber,
          totalPoints,
          userId: userData._id,
        });

        const result = await updateUserXP(
          userData._id,
          mission.id,
          totalPoints
        );

        if (result.success) {
          console.log("✅ Mission completed successfully:", result);
          // Update local user data
          updateUserData({
            xp: (userData.xp || 0) + result.xpAdded,
            missionProgress: result.missionProgress,
          });
        } else {
          console.log("⚠️ Mission completion result:", result);
        }
      } catch (error) {
        console.error("❌ Error completing mission:", error);
      }
    } else {
      console.log("🎯 Practice completion - no XP or mission progress update");
    }
  };

  // Mission header button handlers are now handled at page level

  // Show intro when showIntro is true and not forceHideIntro, or when countdown is active
  if ((showIntro && !forceHideIntro) || showCountdown) {
    return (
      <>
        <MissionIntro
          missionNumber={mission.id}
          title={mission.title}
          timeAllocated={mission.intro.timeAllocated}
          image={mission.intro.image}
          instructions={mission.intro.description}
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

  return (
    <div
      className="flex min-h-screen bg-white relative"
      style={{
        marginLeft: sidebarCollapsed ? "80px" : "260px",
        marginRight: "0px",
      }}
    >
      {/* Mission Header - Fixed at top */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-row h-screen relative">
        {/* Split Content Area - Below the header */}
        <div
          className="relative h-screen flex w-full mt-[65px]"
          style={{
            width: sidebarCollapsed
              ? "calc(100vw - 80px)"
              : "calc(100vw - 260px)",
          }}
        >
          {/* Left Side - Instructions and Images */}
          <div
            className="flex flex-col bg-[#F8F9FC]"
            style={{
              width: `${leftPanelWidth}px`,
              height: "calc(100vh - 80px)",
              maxHeight: "calc(100vh - 80px)",
              marginLeft: "0px", // Remove the small margin since we're handling sidebar spacing at the container level
            }}
          >
            <div className="h-full p-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pt-10 pb-8">
              {mission.steps[currentStep] ? (
                <>
                  <div className="flex items-start mb-3 gap-3">
                    <span
                      className="text-white text-xs font-bold px-5 py-1 flex-shrink-0"
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
                    <span className="text-xl font-medium text-[#222E3A] break-words">
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
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

                  {/* Navigation buttons after instructions */}
                  <div className="flex justify-between items-center px-2 mb-6 mt-4">
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="w-24 px-4 py-2 rounded-full font-medium bg-[#E0E6ED] text-[#222E3A] hover:bg-[#D0D6DD] transition-colors"
                      >
                        Previous
                      </button>
                    )}
                    {currentStep === 0 && <div></div>}
                    {currentStep < mission.steps.length - 1 ? (
                      <button
                        onClick={() => {
                          console.log("🎯 Next button clicked - not last step");
                          handleNext();
                        }}
                        className="w-24 px-4 py-2 rounded-full font-medium bg-black text-white hover:bg-[#222E3A] transition-colors ml-auto"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          console.log("🎯 Next button clicked - LAST STEP");
                          console.log(
                            "🎯 Current step:",
                            currentStep,
                            "Total steps:",
                            mission.steps.length
                          );
                          handleNext();
                        }}
                        className="w-24 px-4 py-2 rounded-full font-medium bg-black text-white hover:bg-[#222E3A] transition-colors ml-auto"
                      >
                        Next
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-center mb-8">
                    {mission.steps[currentStep].image && (
                      <div className="relative w-full bg-gray-100 rounded-xl overflow-hidden">
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
            </div>
          </div>

          {/* Resizer - Draggable divider */}
          <div
            className="w-1 bg-[#F8F9FC]-300 hover:bg-gray-400 cursor-ew-resize transition-colors"
            onMouseDown={handleMouseDown}
            style={{ cursor: isResizing ? "ew-resize" : "ew-resize" }}
          />
          <div className="w-full mb-16">
            {/* Right Side - Coding Workspace - Flex grow to fill remaining space */}
            <BlocklyComponent
              generatedCode={generatedCode}
              setGeneratedCode={setGeneratedCode}
              onWorkspaceChange={() => {}}
            />
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

      {/* MCQ Overlay */}
      {showMCQ && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" />
          <MCQCard
            question={mission.steps[currentStep]?.mcq?.question || "Question"}
            options={
              mission.steps[currentStep]?.mcq?.options || [
                "Option 1",
                "Option 2",
                "Option 3",
                "Option 4",
              ]
            }
            correctAnswer={mission.steps[currentStep]?.mcq?.correctAnswer || 0}
            onAnswer={handleMCQAnswer}
            questionNumber={currentStep + 1}
          />
        </div>
      )}

      {/* Step Success Overlay */}
      {showNice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" />
          <StepSuccessCard
            onNext={handleNiceContinue}
            message="Yay, Awesome!"
            buttonText={
              currentStep === mission.steps.length - 1 ? "Finish" : "Next"
            }
            buttonColor={
              currentStep === mission.steps.length - 1 ? "blue" : "black"
            }
          />
        </div>
      )}

      {/* Step Retry Overlay */}
      {showDontWorry && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" />
          <StepRetryCard
            onTryAgain={handleDontWorryContinue}
            message="Hmm... that doesn't look correct. Let's try this question again!"
          />
        </div>
      )}

      {/* Congrats Overlay */}
      {showCongrats && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" />
          <CongratsCard
            onBack={() => {
              setShowCongrats(false);
              // Navigate back to missions page
              window.location.href = "/missions";
            }}
            onNextMission={() => {
              // Navigate to next mission (only for first completions)
              const missionNumber =
                parseInt(mission.id.replace(/\D/g, "")) || 0;
              const nextMissionId = String(missionNumber + 1).padStart(2, "0");
              window.location.href = `/missions/${nextMissionId}`;
            }}
            headline={
              isPracticeCompletion ? "Great Practice!" : "Mission Complete!"
            }
            subtitle={
              isPracticeCompletion
                ? `You completed mission ${mission.id} again for practice.`
                : "Great job completing this mission!"
            }
            points={
              isPracticeCompletion
                ? 0
                : mission.steps.reduce(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (sum: number, step: any) => sum + (step.points || 0),
                    0
                  )
            }
            timeSpent={calculateTimeSpent()}
            isPracticeCompletion={isPracticeCompletion}
          />
        </div>
      )}

      {/* All other overlays are now handled at the page level */}
    </div>
  );
}
