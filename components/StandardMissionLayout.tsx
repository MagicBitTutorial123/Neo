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
import { completeMission1, completeMission2 } from "@/utils/userState";

export default function StandardMissionLayout({ mission }: { mission: any }) {
  const [showIntro, setShowIntro] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showStepQuestion, setShowStepQuestion] = useState(false);
  const [showNice, setShowNice] = useState(false);
  const [showDontWorry, setShowDontWorry] = useState(false);
  const [fromNo, setFromNo] = useState(false); // Track if user came from No
  const [showHelpNeo, setShowHelpNeo] = useState(false);
  const [showHelpAccepted, setShowHelpAccepted] = useState(false);
  const [showPlaygroundUnlocked, setShowPlaygroundUnlocked] = useState(false);
  const router = useRouter();
  const { userData, updateUserData, setUserData } = useUser();

  // Optionally: overlays, motivational cards, etc.
  // const [showOverlay, setShowOverlay] = useState(false);

  const handleStart = () => setShowCountdown(true);
  const handleCountdownGo = () => {
    setShowCountdown(false);
    setShowIntro(false);
  };

  // Helper to know if we're on the elevation step
  const isElevationStep = currentStep === mission.steps.length - 1;
  const isStep3 = currentStep === 2; // 0-based index

  // Next handler
  const handleNext = () => {
    if (isStep3) {
      setShowStepQuestion(true);
      return;
    }
    if (isElevationStep) {
      // Only allow finish/try again here
      return;
    }
    setCurrentStep((s: number) => s + 1);
  };

  // Previous handler
  const handlePrevious = () => {
    if (isElevationStep) {
      setCurrentStep(2); // Go back to step 3
      setFromNo(false);
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
    // Optionally: navigate home or to missions list
  };
  const handleNextMission = async () => {
    setShowCongrats(false);

    // Update mission progress in backend
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
      // Find the next mission id
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
    setFromNo(false);
  };
  const handleStepQuestionNo = () => {
    setShowStepQuestion(false);
    setShowDontWorry(true);
    setFromNo(true);
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
    setFromNo(false);
  };
  const handleFinish = () => {
    setShowCongrats(true);
  };

  useEffect(() => {
    if (showHelpAccepted) {
      const timeout = setTimeout(() => {
        router.push("/missions/2");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [showHelpAccepted, router]);

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

  // Always render MissionStep in the background
  return (
    <div className="relative">
      <MissionStep
        missionNumber={mission.id}
        stepNumber={currentStep + 1}
        title={mission.title}
        timeAllocated={mission.intro.timeAllocated}
        liveUsers={17}
        stepTitle={mission.steps[currentStep].title}
        stepDescription={mission.steps[currentStep].description}
        stepImage={mission.steps[currentStep].image}
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
      {/* Overlay for StepQuestionCard */}
      {showStepQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" />
          <StepQuestionCard
            question="Did you follow the steps correctly?"
            onYes={handleStepQuestionYes}
            onNo={handleStepQuestionNo}
            yesLabel="Yes"
            noLabel="No"
          />
        </div>
      )}
      {/* Overlay for Nice! */}
      {showNice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" />
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
      {/* Overlay for Don't Worry */}
      {showDontWorry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" />
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
      {/* Overlay for CongratsCard */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" />
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
      {/* Overlay for HelpNeoOverlay (after mission 1, on back from congrats) */}
      {showHelpNeo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" />
          <HelpNeoOverlay
            headline="Hey, Neo needs your help!"
            subtitle="He needs you the most right now!"
            imageSrc="/crying-bot.png"
            laterText="Yes, But later"
            helpText="I will help!"
            onLater={() => setShowHelpNeo(false)}
            onHelp={() => {
              setShowHelpNeo(false);
              setShowHelpAccepted(true);
            }}
          />
        </div>
      )}
      {showHelpAccepted && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowHelpAccepted(false)}
        >
          <div className="absolute inset-0 bg-black opacity-50" />
          <HelpAcceptedOverlay />
        </div>
      )}
      {/* Overlay for PlaygroundUnlockedCard */}
      {showPlaygroundUnlocked && (
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
      )}
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
