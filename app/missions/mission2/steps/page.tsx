"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MissionStep from "@/components/MissionStep";
import CongratsCard from "@/components/CongratsCard";

const steps = [
  {
    image: "/mission1-step2-image.png",
    title: "Attach the Arm",
    description:
      "Start by attaching the robot's arm to the main body. Make sure it is secure and moves freely.",
  },
  {
    image: "/mission1-step1-image.png",
    title: "Test the Arm",
    description:
      "Test the arm's movement and ensure all connections are tight. Complete the mission by verifying the arm works as expected.",
  },
];

export default function Mission2StepsPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showCongratsCard, setShowCongratsCard] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setShowCongratsCard(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      router.push("/missions/mission2");
    }
  };

  const handleConnectToggle = (connected: boolean) => {
    setIsConnected(connected);
  };

  const handleBack = () => {
    setShowCongratsCard(false);
    router.push("/missions");
  };

  const handleNextMission = () => {
    setShowCongratsCard(false);
    router.push("/missions/mission3"); // Or wherever you want to go next
  };

  return (
    <>
      <MissionStep
        missionNumber={2}
        stepNumber={currentStep + 1}
        title="Build the robot's arm"
        timeAllocated="10 mins"
        liveUsers={17}
        stepTitle={steps[currentStep].title}
        stepDescription={steps[currentStep].description}
        stepImage={steps[currentStep].image}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isConnected={isConnected}
        onConnectToggle={handleConnectToggle}
        showPreviousButton={currentStep > 0}
        showNextButton={currentStep < steps.length - 1}
        showFinishButton={currentStep === steps.length - 1}
        nextButtonText="Next"
        previousButtonText="Prev."
        finishButtonText="Finish"
      />
      {showCongratsCard && (
        <CongratsCard
          onBack={handleBack}
          onNextMission={handleNextMission}
          headline="Congratulations!"
          subtitle="You completed mission 2 successfully."
          points={0}
          timeSpent="3:00"
          robotImageSrc="/confettiBot.png"
          backText="Back"
          nextMissionText="Next Mission"
        />
      )}
    </>
  );
}
