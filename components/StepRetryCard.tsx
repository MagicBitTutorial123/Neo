"use client";

interface StepRetryCardProps {
  onTryAgain: () => void;
  message?: string;
  imageSrc?: string;
}

export default function StepRetryCard({
  onTryAgain,
  message = "Hmm... that doesn't look correct. Try again!",
  imageSrc = "/sad-robot-wrong-answer.png",
}: StepRetryCardProps) {
  return (
    <div className="relative bg-white rounded-2xl shadow-lg px-8 py-8 flex items-center min-w-[400px] max-w-[50vw]">
      {/* Left Side - Sad Robot */}
      <div className="mr-8">
        <img
          src={imageSrc}
          alt="Sad Robot"
          className="w-64 h-64 object-contain"
        />
      </div>

      {/* Right Side - Message and Button */}
      <div className="flex flex-col flex-1">
        <div className="mb-6 text-xl font-medium text-[#222E3A] leading-relaxed">
          {message}
        </div>
        <div className="flex justify-start">
          <button
            onClick={onTryAgain}
            className="px-6 py-3 rounded-3xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
