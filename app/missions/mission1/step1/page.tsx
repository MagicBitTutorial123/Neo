"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MissionStep from "@/components/MissionStep";
import StepQuestionCard from "@/components/StepQuestionCard";
import StepRetryCard from "@/components/StepRetryCard";
import StepSuccessCard from "@/components/StepSuccessCard";
import CongratsCard from "@/components/CongratsCard";
import HelpNeoOverlay from "@/components/HelpNeoOverlay";
import HelpAcceptedOverlay from "@/components/HelpAcceptedOverlay";

const steps = [
  {
    image: "/mission1-step1-image.png",
    title: "Introduction to Robot Assembly",
    description:
      "Welcome to your first mission! In this step, you'll learn the basics of robot assembly. We'll start by understanding the different components and how they work together to create a functional robot.",
  },
  {
    image: "/mission1-step2-image.png", // Replace with your uploaded image filename
    title: "Assemble the Arm",
    description:
      "Welcome to your first mission! In this step, you'll learn the basics of robot assembly. We'll start by understanding the different components and how they work together to create a functional robot.",
  },
  {
    image: "/mission1-step1-image.png",
    title: "Introduction to Robot Assembly",
    description:
      "Welcome to your first mission! In this step, you'll learn the basics of robot assembly. We'll start by understanding the different components and how they work together to create a functional robot.",
  },
  // New Elevations Step
  {
    image: "/mission1-elevations.png", // Replace with the correct image for the elevations frame
    title: "Elevations",
    description:
      "Refer to the elevation images and details as shown in the Figma design. Follow the instructions to complete this step.",
  },
];

const STORAGE_KEY = "mission1-currentStep";

export default function Mission1StepsPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [showQuestionCard, setShowQuestionCard] = useState(false);
  const [showRetryCard, setShowRetryCard] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [fromRetry, setFromRetry] = useState(false);
  const [showCongratsCard, setShowCongratsCard] = useState(false);
  const [showHelpNeoOverlay, setShowHelpNeoOverlay] = useState(false);
  const [showHelpAcceptedOverlay, setShowHelpAcceptedOverlay] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && !isNaN(Number(saved))) {
      setCurrentStep(Number(saved));
    }
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, String(currentStep));
    }
  }, [currentStep, hydrated]);

  if (!hydrated) return null;

  const handleNext = () => {
    if (isElevations && fromRetry) {
      setFromRetry(false);
      setCurrentStep(0);
      return;
    }
    if (isElevations) {
      setShowCongratsCard(true);
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      router.push("/missions/mission1");
    }
  };

  const handleConnectToggle = (connected: boolean) => {
    console.log("Connection status:", connected);
  };

  const handleRun = () => {
    console.log("Run clicked");
  };

  const handlePause = () => {
    console.log("Pause clicked");
  };

  const handleErase = () => {
    console.log("Erase clicked");
  };

  const handleFinish = () => {
    setShowQuestionCard(true);
  };

  const handleQuestionYes = () => {
    setShowQuestionCard(false);
    setShowSuccessCard(true);
  };

  const handleQuestionNo = () => {
    setShowQuestionCard(false);
    setShowRetryCard(true);
  };

  const handleCloseRetry = () => {
    setShowRetryCard(false);
    setCurrentStep(steps.length - 1);
    setFromRetry(true);
  };

  const handleTryAgainFromElevations = () => {
    setShowRetryCard(false);
    setCurrentStep(0);
    setFromRetry(false);
  };

  const handleContinueSuccess = () => {
    setShowSuccessCard(false);
    setCurrentStep(steps.length - 1);
  };

  const handleCloseCongrats = () => {
    setShowCongratsCard(false);
    setShowHelpNeoOverlay(true);
  };

  const handleHelpNeoLater = () => {
    setShowHelpNeoOverlay(false);
    router.push("/missions");
  };

  const handleHelpNeoHelp = () => {
    setShowHelpNeoOverlay(false);
    setShowHelpAcceptedOverlay(true);
  };

  const handleNextMission = () => {
    // TODO: Implement navigation to Mission 2
    setShowCongratsCard(false);
    router.push("/missions/mission2");
  };

  const isStep1 = currentStep === 0;
  const isStep2 = currentStep === 1;
  const isStep3 = currentStep === 2;
  const isElevations = currentStep === steps.length - 1;

  const showPrev = isStep2 || isStep3 || isElevations;
  let showNext =
    (isStep1 || isStep2 || isElevations) && !(isElevations && fromRetry);
  const showFinish = isStep3;
  const showTryAgain = isElevations && fromRetry;

  return (
    <>
      <MissionStep
        missionNumber={1}
        stepNumber={currentStep + 1}
        title="Assemble the robot"
        timeAllocated="15 mins"
        liveUsers={42}
        stepTitle={steps[currentStep].title}
        stepDescription={steps[currentStep].description}
        stepImage={steps[currentStep].image}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onConnectToggle={handleConnectToggle}
        onRun={handleRun}
        onPause={handlePause}
        onErase={handleErase}
        onFinish={handleFinish}
        showPreviousButton={showPrev}
        showNextButton={showNext && !showFinish}
        showFinishButton={showFinish}
        showTryAgainButton={showTryAgain}
        nextButtonText="Next"
        previousButtonText="Prev."
        finishButtonText="Finish"
        tryAgainButtonText="Try Again"
      />
      {showQuestionCard && (
        <StepQuestionCard
          question="Did you follow the steps correctly?"
          onYes={handleQuestionYes}
          onNo={handleQuestionNo}
        />
      )}
      {showSuccessCard && (
        <StepSuccessCard
          onContinue={handleContinueSuccess}
          message="Nice!"
          subtitle="Let's see if you are correct or wrong."
          buttonText="Continue"
        />
      )}
      {showRetryCard &&
        (isElevations ? (
          <StepRetryCard
            onClose={handleTryAgainFromElevations}
            message="Don't worry!"
            subtitle="Check the images of elevation and try again."
            imageSrc="/mission1-step1-image.png"
            buttonText="Try Again"
          />
        ) : (
          <StepRetryCard
            onClose={handleCloseRetry}
            message="Don't worry!"
            subtitle="Check the images of elevation and try again."
            imageSrc="/mission1-step1-image.png"
            buttonText="Try Again"
          />
        ))}
      {showCongratsCard && (
        <CongratsCard
          onBack={handleCloseCongrats}
          onNextMission={handleNextMission}
          headline="Congratulations!"
          subtitle="You completed mission 1 successfully."
          points={0}
          timeSpent="2:34"
          robotImageSrc="/confettiBot.png"
          backText="Back"
          nextMissionText="Mission 2"
        />
      )}
      {showHelpNeoOverlay && (
        <HelpNeoOverlay
          onLater={handleHelpNeoLater}
          onHelp={handleHelpNeoHelp}
          headline="Hey, Neo needs your help!"
          subtitle="He need you the most right now!"
          imageSrc="/neo-help.png" // Replace with your actual image path
          laterText="Yes, But later"
          helpText="I will help!"
        />
      )}
      {showHelpAcceptedOverlay && (
        <HelpAcceptedOverlay
          message={`Yahooooo!\nThat's the spirit of an\ninnovator`}
          imageSrc="/happy-bot.png"
        />
      )}
    </>
  );
}
