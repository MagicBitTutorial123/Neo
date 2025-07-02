import React from "react";

interface StepSuccessCardProps {
  onContinue: () => void;
  message?: string;
  subtitle?: string;
  buttonText?: string;
}

export default function StepSuccessCard({
  onContinue,
  message = "Nice!",
  subtitle = "Let's see if you are correct or wrong.",
  buttonText = "Continue",
}: StepSuccessCardProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
    >
      <div className="bg-white rounded-2xl shadow-lg px-12 py-10 flex flex-col items-center min-w-[350px] max-w-[90vw]">
        <div className="mb-2 text-center text-3xl font-extrabold text-black">
          {message}
        </div>
        <div className="mb-8 text-center text-base text-black">{subtitle}</div>
        <button
          onClick={onContinue}
          className="px-8 py-2 rounded-xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
