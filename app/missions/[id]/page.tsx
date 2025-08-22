"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { missions } from "@/data/missions";
import { missionLayoutMap } from "@/data/missionLayoutMap";
import StandardMissionLayout from "@/components/StandardMissionLayout";
import BlocklySplitLayout from "@/components/BlocklySplitLayout";
import SideNavbar from "@/components/SideNavbar";
import Header from "@/components/StatusHeaderBar";
import CountdownTimer from "@/components/CountdownTimer";
import StepQuestionCard from "@/components/StepQuestionCard";
import MCQCard from "@/components/MCQCard";
import StepRetryCard from "@/components/StepRetryCard";
import StepSuccessCard from "@/components/StepSuccessCard";
import CongratsCard from "@/components/CongratsCard";
import HelpNeoOverlay from "@/components/HelpNeoOverlay";
import HelpAcceptedOverlay from "@/components/HelpAcceptedOverlay";
import { MissionStatePersistence } from "@/utils/missionStatePersistence";
import { TimerPersistence } from "@/utils/timerPersistence";

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
  const router = useRouter();
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

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleSidebarCollapsed = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebarCollapsed', handleSidebarCollapsed as EventListener);
    
    return () => {
      window.removeEventListener('sidebarCollapsed', handleSidebarCollapsed as EventListener);
    };
  }, []);
  const [showCountdown, setShowCountdown] = useState(false);
  const [forceHideIntro, setForceHideIntro] = useState(false);

  // Overlay states - moved to page level
  const [showStepQuestion, setShowStepQuestion] = useState(false);
  const [showMCQ, setShowMCQ] = useState(false);
  const [showNice, setShowNice] = useState(false);
  const [showDontWorry, setShowDontWorry] = useState(false);
  const [showStepRetry, setShowStepRetry] = useState(false);
  const [showStepSuccess, setShowStepSuccess] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showHelpNeo, setShowHelpNeo] = useState(false);
  const [showHelpAccepted, setShowHelpAccepted] = useState(false);
  const [showPlaygroundUnlocked, setShowPlaygroundUnlocked] = useState(false);
  const [fromNo, setFromNo] = useState(false);
  const [currentStepForMCQ, setCurrentStepForMCQ] = useState(0);
  const [completedMCQSteps, setCompletedMCQSteps] = useState<Set<number>>(
    new Set()
  );
  const [isFinalMCQ, setIsFinalMCQ] = useState(false);
  const [timeTaken, setTimeTaken] = useState("");

  // Arrays of images for random selection
  const successImages = [
    "/happy-robot-correct-1.png",
    "/happy-robot-correct-2.png",
    "/happy-robot-correct-3.png",
  ];

  const retryImages = [
    "/sad-robot-wrong-answer-1.png",
    "/sad-robot-wrong-answer-2.png",
  ];

  // State to store current random images
  const [currentSuccessImage, setCurrentSuccessImage] = useState("");
  const [currentRetryImage, setCurrentRetryImage] = useState("");

  // Function to get random image from array
  const getRandomImage = (imageArray: string[]) => {
    return imageArray[Math.floor(Math.random() * imageArray.length)];
  };

  // Function to set random images when showing feedback cards
  const setRandomImages = () => {
    setCurrentSuccessImage(getRandomImage(successImages));
    setCurrentRetryImage(getRandomImage(retryImages));
  };

  // Load mission state on mount
  useEffect(() => {
    const savedState = MissionStatePersistence.getMissionState(id);
    if (savedState) {
      console.log("🔄 Loading saved mission state:", savedState);
      setShowHeader(savedState.showHeader);
      setForceHideIntro(savedState.forceHideIntro);
      setShowCountdown(savedState.showCountdown);
      setIsRunning(savedState.isRunning);
      setFromNo(savedState.fromNo);
      setCompletedMCQSteps(new Set(savedState.completedMCQSteps));

      // If we're resuming a mission that was already started, resume the timer
      if (savedState.showHeader && !savedState.showCountdown) {
        // Wait for the timer component to be ready, then resume
        setTimeout(() => {
          if (
            typeof window !== "undefined" &&
            (window as any).missionTimerControls
          ) {
            const savedTimerState = TimerPersistence.loadTimerState();
            if (savedTimerState && savedTimerState.missionId === id) {
              console.log("🔄 Resuming existing timer for mission", id);
              (window as any).missionTimerControls.resume();
            }
          }
        }, 100);
      }
    }
  }, [id]);

  // Handle current step changes from layout components
  const handleCurrentStepChange = (step: number) => {
    console.log("🔄 Current step changed to:", step);
    // Update mission state with new step
    MissionStatePersistence.updateMissionState(id, {
      currentStep: step,
    });
  };

  // Function to stop timer and calculate time taken
  const stopTimerAndCalculateTime = () => {
    if (typeof window !== "undefined" && (window as any).missionTimerControls) {
      // Pause the timer first
      (window as any).missionTimerControls.pause();

      // Get the current timer state to calculate time taken
      const savedTimerState = TimerPersistence.loadTimerState();
      if (savedTimerState && savedTimerState.missionId === id) {
        const allocatedTime = savedTimerState.allocatedTime;
        const elapsed = Math.floor(
          (Date.now() - savedTimerState.startTime) / 1000
        );
        const remaining = Math.max(0, allocatedTime - elapsed);
        const timeTaken = allocatedTime - remaining;

        // Format time taken as MM:SS
        const minutes = Math.floor(timeTaken / 60);
        const seconds = timeTaken % 60;
        const formattedTime = `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`;

        setTimeTaken(formattedTime);
        console.log("⏱️ Time taken to complete mission:", formattedTime);
      }
    }
  };

  // Save mission state when it changes
  useEffect(() => {
    MissionStatePersistence.updateMissionState(id, {
      showHeader,
      forceHideIntro,
      showCountdown,
      isRunning,
      fromNo,
      completedMCQSteps: Array.from(completedMCQSteps),
    });
  }, [
    id,
    showHeader,
    forceHideIntro,
    showCountdown,
    isRunning,
    fromNo,
    completedMCQSteps,
  ]);

  // Stop timer when congratulations card is shown
  useEffect(() => {
    if (showCongrats) {
      stopTimerAndCalculateTime();
    }
  }, [showCongrats]);

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
    // Resume timer if persistence is enabled
    if (typeof window !== "undefined" && (window as any).missionTimerControls) {
      (window as any).missionTimerControls.resume();
    }
  };

  const handlePause = () => {
    console.log("⏸️ Pause button clicked from page level!");
    setIsRunning(false);
    // Pause timer if persistence is enabled
    if (typeof window !== "undefined" && (window as any).missionTimerControls) {
      (window as any).missionTimerControls.pause();
    }
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
    } else if (layoutType === "blocklySplitLayout") {
      // For BlocklySplitLayout, we need to communicate with the component
      window.dispatchEvent(new CustomEvent("goToNextStep"));
    }
  };

  const handleDontWorryContinue = () => {
    setShowDontWorry(false);
    // Trigger step progression in StandardMissionLayout
    if (layoutType === "standardIntroLayout") {
      // We need to communicate with StandardMissionLayout to go to elevation step
      window.dispatchEvent(new CustomEvent("goToElevationStep"));
    } else if (layoutType === "blocklySplitLayout") {
      // For BlocklySplitLayout, we need to communicate with the component
      window.dispatchEvent(new CustomEvent("goToNextStep"));
    }
  };

  const handleBack = () => {
    setShowCongrats(false);
    if (mission.id === 1) {
      setShowHelpNeo(true);
      return;
    }
    // For Mission 2 and Mission 3+, navigate to missions main page
    if (mission.id >= 2) {
      // Clear mission state and timer when going back to missions page
      MissionStatePersistence.clearMissionState();
      TimerPersistence.clearTimerState();
      router.push("/missions");
      return;
    }
  };

  const handleNextMission = async () => {
    setShowCongrats(false);
    // Clear mission state and timer for new mission
    MissionStatePersistence.clearMissionState();
    TimerPersistence.clearTimerState();
    if (typeof window !== "undefined" && (window as any).missionTimerControls) {
      (window as any).missionTimerControls.reset();
    }
    // Navigate to next mission
    const nextMissionId = String(Number(mission.id) + 1);
    window.location.href = `/missions/${nextMissionId}`;
  };

  const handleTryAgain = () => {
    setShowDontWorry(false);
    setFromNo(false);
    // Reset timer when restarting the same mission
    if (typeof window !== "undefined" && (window as any).missionTimerControls) {
      (window as any).missionTimerControls.reset();
    }
    // Reset to previous step
  };

  // MCQ handlers
  const handleMCQAnswer = (selectedAnswer: number) => {
    setShowMCQ(false);
    const currentStepData = mission.steps[currentStepForMCQ];
    if (currentStepData && "mcq" in currentStepData) {
      const isCorrect = selectedAnswer === currentStepData.mcq.correctAnswer;

      if (isCorrect) {
        // Mark this step as completed
        setCompletedMCQSteps((prev) => new Set([...prev, currentStepForMCQ]));

        // Set random images and show success card
        setRandomImages();
        setShowStepSuccess(true);
      } else {
        // Set random images and show retry card
        setRandomImages();
        setShowStepRetry(true);
      }
    }
  };

  const handleMCQTryAgain = () => {
    setShowStepRetry(false);
    setShowMCQ(true);
  };

  const handleMCQNext = () => {
    setShowStepSuccess(false);

    // Check if this is the final MCQ
    if (isFinalMCQ) {
      // Stop timer and calculate time taken for final MCQ
      stopTimerAndCalculateTime();
      // Show congrats for final MCQ
      setShowCongrats(true);
    } else {
      // Trigger next step in BlocklySplitLayout
      window.dispatchEvent(new CustomEvent("goToNextStep"));
    }
  };

  // Get current step's feedback messages
  const getCurrentStepFeedback = () => {
    const currentStepData = mission.steps[currentStepForMCQ];
    if (
      currentStepData &&
      "mcq" in currentStepData &&
      currentStepData.mcq.feedback
    ) {
      return currentStepData.mcq.feedback;
    }
    // If no feedback found, return empty strings (shouldn't happen with proper data)
    return {
      success: "",
      retry: "",
    };
  };

  const handleMCQChange = (show: boolean, stepIndex: number) => {
    // Only show MCQ if this step hasn't been completed yet
    if (show && !completedMCQSteps.has(stepIndex)) {
      setShowMCQ(true);
      setCurrentStepForMCQ(stepIndex);
      // Check if this is the final MCQ (last step)
      setIsFinalMCQ(stepIndex === mission.steps.length - 1);
    } else if (show && completedMCQSteps.has(stepIndex)) {
      // If step is already completed, go to next step
      // This will trigger the final MCQ for the last step
      window.dispatchEvent(new CustomEvent("goToNextStep"));
    } else {
      setShowMCQ(false);
    }
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

    // Start timer when countdown completes (only if no saved timer exists)
    if (typeof window !== "undefined" && (window as any).missionTimerControls) {
      // Check if there's already a saved timer state for this mission
      const savedTimerState = TimerPersistence.loadTimerState();
      if (!savedTimerState || savedTimerState.missionId !== id) {
        // Only reset if no saved timer exists for this mission
        (window as any).missionTimerControls.reset();
      } else {
        // Resume existing timer
        (window as any).missionTimerControls.resume();
      }
    }

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
              <Header
                missionNumber={mission.id}
                title={mission.title}
                timeAllocated={mission.intro.timeAllocated}
                liveUsers={17}
                onRun={handleRun}
                onPause={handlePause}
                onErase={handleErase}
                isRunning={isRunning}
                sidebarCollapsed={sidebarCollapsed}
                enableTimerPersistence={true}
              />
            </div>
          )}

          <SideNavbar />
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
              onCurrentStepChange={handleCurrentStepChange}
              onFinish={stopTimerAndCalculateTime}
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
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
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
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
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
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
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
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
              <CongratsCard
                onBack={handleBack}
                onNextMission={handleNextMission}
                headline="Congratulations!"
                subtitle={`You completed mission ${mission.id} successfully.`}
                points={0}
                timeSpent={timeTaken || "0:00"}
                robotImageSrc="/confettiBot.png"
                backText="Back"
                nextMissionText="Next Mission"
              />
            </div>
          )}

          {showHelpNeo && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
            >
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
              style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
              onClick={() => setShowHelpAccepted(false)}
            >
              <HelpAcceptedOverlay />
            </div>
          )}

          {showPlaygroundUnlocked && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
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
              <Header
                missionNumber={mission.id}
                title={mission.title}
                timeAllocated={mission.intro.timeAllocated}
                liveUsers={17}
                onRun={handleRun}
                onPause={handlePause}
                onErase={handleErase}
                isRunning={isRunning}
                sidebarCollapsed={sidebarCollapsed}
                enableTimerPersistence={true}
              />
            </div>
          )}

          <SideNavbar />
          <div className="flex-1 overflow-hidden relative z-30">
            <BlocklySplitLayout
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
              onMCQAnswer={handleMCQAnswer}
              onMCQChange={handleMCQChange}
              onCurrentStepChange={handleCurrentStepChange}
              onFinish={stopTimerAndCalculateTime}
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

          {/* MCQ Overlay for Mission 3+ */}
          {showMCQ &&
            mission.steps[currentStepForMCQ] &&
            "mcq" in mission.steps[currentStepForMCQ] && (
              <div
                className="fixed inset-0 z-[99999] flex items-center justify-center"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
              >
                <MCQCard
                  question={mission.steps[currentStepForMCQ].mcq.question}
                  options={mission.steps[currentStepForMCQ].mcq.options}
                  correctAnswer={
                    mission.steps[currentStepForMCQ].mcq.correctAnswer
                  }
                  questionNumber={currentStepForMCQ + 1}
                  onAnswer={handleMCQAnswer}
                />
              </div>
            )}

          {/* Step Retry Overlay for Mission 3+ */}
          {showStepRetry && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
              <StepRetryCard
                onTryAgain={handleMCQTryAgain}
                message={getCurrentStepFeedback().retry}
                imageSrc={currentRetryImage}
              />
            </div>
          )}

          {/* Step Success Overlay for Mission 3+ */}
          {showStepSuccess && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
              <StepSuccessCard
                onNext={handleMCQNext}
                message={getCurrentStepFeedback().success}
                buttonText={isFinalMCQ ? "Finish" : "Next"}
                buttonColor={isFinalMCQ ? "blue" : "black"}
                imageSrc={currentSuccessImage}
              />
            </div>
          )}

          {/* All overlays at page level with z-[99999] - Same as StandardMissionLayout */}
          {showStepQuestion && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
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
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
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
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
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
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
              <CongratsCard
                onBack={handleBack}
                onNextMission={handleNextMission}
                headline="Congratulations!"
                subtitle={`You completed mission ${mission.id} successfully.`}
                points={0}
                timeSpent={timeTaken || "0:00"}
                robotImageSrc="/confettiBot.png"
                backText="Back"
                nextMissionText="Next Mission"
              />
            </div>
          )}

          {showHelpNeo && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
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
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
              onClick={() => setShowHelpAccepted(false)}
            >
              <HelpAcceptedOverlay />
            </div>
          )}

          {showPlaygroundUnlocked && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
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
    default:
      return <div>Unknown layout</div>;
  }
}
