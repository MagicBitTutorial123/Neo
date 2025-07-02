"use client";
import { useState } from "react";
import MissionHeader from "./MissionHeader";
import SideNavbar from "./SideNavbar";

interface MissionStepProps {
  missionNumber: number;
  stepNumber: number;
  title: string;
  timeAllocated: string;
  liveUsers: number;
  stepTitle: string;
  stepDescription: string;
  stepImage?: string;
  stepContent?: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  isConnected?: boolean;
  onConnectToggle?: (connected: boolean) => void;
  onRun?: () => void;
  onPause?: () => void;
  onErase?: () => void;
  isRunning?: boolean;
  showNextButton?: boolean;
  showPreviousButton?: boolean;
  nextButtonText?: string;
  previousButtonText?: string;
  onFinish?: () => void;
  showFinishButton?: boolean;
  finishButtonText?: string;
  showTryAgainButton?: boolean;
  tryAgainButtonText?: string;
}

export default function MissionStep({
  missionNumber,
  stepNumber,
  title,
  timeAllocated,
  liveUsers,
  stepTitle,
  stepDescription,
  stepImage,
  stepContent,
  onNext,
  onPrevious,
  onComplete,
  isConnected = false,
  onConnectToggle,
  onRun,
  onPause,
  onErase,
  isRunning = false,
  showNextButton = true,
  showPreviousButton = true,
  nextButtonText = "Next",
  previousButtonText = "Previous",
  onFinish,
  showFinishButton = false,
  finishButtonText = "Finish",
  showTryAgainButton = false,
  tryAgainButtonText = "Try Again",
}: MissionStepProps) {
  const [currentStep, setCurrentStep] = useState(stepNumber);

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else {
      setCurrentStep((prev) => Math.max(1, prev - 1));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      {/* Side Navbar */}
      <SideNavbar />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mission Header */}
        <MissionHeader
          missionNumber={missionNumber}
          title={title}
          timeAllocated={timeAllocated}
          liveUsers={liveUsers}
          isConnected={isConnected}
          onConnectToggle={onConnectToggle}
          onRun={onRun}
          onPause={onPause}
          onErase={onErase}
          isRunning={isRunning}
        />
        {/* Main Step Content */}
        <div className="flex flex-1 w-full max-w-7xl mx-auto mt-4 gap-6">
          {/* Main Image/Tools Area */}
          <div
            className="flex-1] w-full max-w-7xl mx-auto relative flex flex-col"
            style={{ minHeight: 400 }}
          >
            {/* Main image/tools placeholder */}
            <div className="flex-1 flex items-center justify-center p-8">
              {stepImage && (
                <img
                  src={stepImage}
                  alt={stepTitle}
                  className="max-h-[340px] w-auto object-contain"
                />
              )}
            </div>
          </div>
        </div>
        {/* Step Info Bar (Bottom) */}
        <div className="w-full bg-white border-t border-[#E0E6ED] px-8 py-4 flex items-center justify-between max-w-7xl mx-auto mt-6 rounded-b-2xl">
          <div>
            <div className="text-lg font-bold text-[#222E3A]">
              Step {stepNumber}
            </div>
            <div className="text-base text-[#555] max-w-2xl">
              {stepDescription}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {showPreviousButton && (
              <button
                onClick={handlePrevious}
                className="px-6 py-3 rounded-full font-medium bg-[#F0F4F8] text-[#222E3A] hover:bg-[#E0E6ED] transition-colors"
              >
                {previousButtonText}
              </button>
            )}
            {showNextButton && (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-full font-medium bg-black text-white hover:bg-[#222E3A] transition-colors"
              >
                {nextButtonText}
              </button>
            )}
            {showFinishButton && (
              <button
                onClick={onFinish}
                className="px-6 py-3 rounded-full font-medium bg-[#00AEEF] text-white hover:bg-[#0098D4] transition-colors"
              >
                {finishButtonText}
              </button>
            )}
            {showTryAgainButton && (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-full font-medium bg-[#D9F2FF] text-[#222E3A] hover:bg-[#B3E6FF] transition-colors"
              >
                {tryAgainButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
