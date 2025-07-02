import React from "react";

interface StepRetryCardProps {
  onClose: () => void;
  message?: string;
  subtitle?: string;
  imageSrc?: string;
  buttonText?: string;
}

export default function StepRetryCard({
  onClose,
  message = "Don't worry!",
  subtitle = "Check the images of elevation and try again.",
  imageSrc = "/mission1-step1-image.png", // Replace with your illustration
  buttonText = "Try Again",
}: StepRetryCardProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
    >
      <div className="bg-white rounded-2xl shadow-lg px-12 py-10 flex flex-col items-center min-w-[350px] max-w-[90vw]">
        <div className="mb-2 text-center text-3xl font-extrabold text-black">
          {message}
        </div>
        <div className="mb-6 text-center text-base text-black">{subtitle}</div>
        <img
          src={imageSrc}
          alt="Try Again"
          className="mb-8 w-40 h-28 object-contain"
        />
        <button
          onClick={onClose}
          className="px-8 py-2 rounded-xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
 