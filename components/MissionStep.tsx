"use client";
import { useState } from "react";

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
  onTryAgain?: () => void;
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
  onTryAgain,
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
    <div className="flex h-full bg-white relative">
      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col h-full"
        style={{ marginTop: "65px" }}
      >
        {/* Main Step Content */}
        <div
          className="flex w-full max-w-7xl mx-auto mt-4 gap-6"
          style={{ flex: "0 1 auto" }}
        >
          {/* Main Image/Tools Area */}
          <div
            className="flex-1 w-full max-w-7xl mx-auto relative flex flex-col"
            style={{ minHeight: 300 }}
          >
            {/* Main image/tools placeholder */}
            <div className="flex-1 flex items-center justify-center p-4">
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
      </div>

      {/* Instructions Container - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E0E6ED] py-6">
        <div className="w-full px-8 flex items-center justify-between max-w-7xl mx-auto h-16">
          <div>
            <div className="text-lg font-bold text-[#222E3A]">
              Step {stepNumber}
            </div>
            <div className="text-base text-[#555] max-w-2xl">
              {stepDescription}
            </div>
          </div>
          <div className="flex items-center gap-12">
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
                onClick={onTryAgain}
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
